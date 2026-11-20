import os
import uuid
import json
import time
from pathlib import Path
from threading import Lock
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from starlette.concurrency import run_in_threadpool
from pydantic import BaseModel
from typing import List, Optional

# Import services
from src.services.tryon import TryOnService, TryOnError, validate_image, MAX_UPLOAD_BYTES, TRYON_TIMEOUT_SECONDS, CACHE_DIR
from src.services.nlp_chat import NLPChatService
from src.services.vision import VisionService, VisualSearchError, MAX_IMAGE_BYTES as MAX_VISUAL_IMAGE_BYTES
from src.services.recommendation import RecommendationService

app = FastAPI(title="AURA AI Service", version="0.1.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory job status map
tryon_jobs = {}
tryon_lock = Lock()


def prune_tryon_jobs():
    """Called under the job lock; expire abandoned jobs and old previews."""
    now = time.monotonic()
    # Results can outlive their in-memory metadata after a service restart.
    for preview in Path(CACHE_DIR).glob("result_*.jpg"):
        try:
            if time.time() - preview.stat().st_mtime > 3600:
                preview.unlink(missing_ok=True)
        except OSError:
            print("Try-on preview cleanup could not remove an expired file.")
    for job_id, job in list(tryon_jobs.items()):
        if job["status"] in ("PENDING", "PROCESSING") and now - job["created_at"] > TRYON_TIMEOUT_SECONDS + 20:
            job.update(status="FAILED", error="The try-on service took too long. Please try again later.", finished_at=now)
        if now - job.get("finished_at", job["created_at"]) > 3600:
            if job.get("file_path"):
                Path(job["file_path"]).unlink(missing_ok=True)
            del tryon_jobs[job_id]

def process_tryon_task(job_id: str, user_bytes: bytes, garment_bytes: bytes, description: str = "upper-body top"):
    with tryon_lock:
        job = tryon_jobs.get(job_id)
        if not job or job["status"] != "PENDING":
            return
        job["status"] = "PROCESSING"
    try:
        output_bytes = TryOnService.run_tryon(user_bytes, garment_bytes, description)
        with tryon_lock:
            job = tryon_jobs.get(job_id)
            if not job or job["status"] != "PROCESSING":
                return
            Path(CACHE_DIR).mkdir(parents=True, exist_ok=True)
            output_path = str(Path(CACHE_DIR) / f"result_{job_id}.jpg")
            Path(output_path).write_bytes(output_bytes)
            job.update(status="COMPLETED", file_path=output_path, provider="idm-vton", finished_at=time.monotonic())
    except Exception as e:
        print("Try-on job failed:", type(e).__name__)
        message = str(e) if isinstance(e, TryOnError) else "The AI preview could not be generated. Please try again."
        with tryon_lock:
            if job_id in tryon_jobs:
                tryon_jobs[job_id].update(status="FAILED", error=message, finished_at=time.monotonic())

# Request Models
class ChatTurn(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatTurn]

class FitRequest(BaseModel):
    heightCm: int
    weightKg: int
    fitPreference: str

# Endpoints
@app.get("/health")
def health_check():
    return {"ok": True, "service": "ai-service-python"}

# 1. Virtual Try-On (multipart/form-data) - Async Job Queue implementation
@app.post("/api/tryon")
async def tryon(
    background_tasks: BackgroundTasks,
    user_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
    garment_type: str = Form("upper_body"),
    garment_description: str = Form("upper-body top"),
):
    if garment_type != "upper_body":
        raise HTTPException(status_code=422, detail="Virtual try-on currently supports tops only.")
    user_bytes = await user_image.read(MAX_UPLOAD_BYTES + 1)
    garment_bytes = await garment_image.read(MAX_UPLOAD_BYTES + 1)
    if max(len(user_bytes), len(garment_bytes)) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Each photo must be 8 MB or smaller.")
    try:
        validate_image(user_bytes)
        validate_image(garment_bytes)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    job_id = str(uuid.uuid4())
    with tryon_lock:
        prune_tryon_jobs()
        if sum(j["status"] in ("PENDING", "PROCESSING") for j in tryon_jobs.values()) >= 2:
            raise HTTPException(status_code=429, detail="The try-on service is busy. Please try again shortly.")
        tryon_jobs[job_id] = {"status": "PENDING", "created_at": time.monotonic()}
    background_tasks.add_task(process_tryon_task, job_id, user_bytes, garment_bytes, garment_description[:200])
    return Response(
        content=json.dumps({"job_id": job_id, "status": "PENDING", "timeout_seconds": TRYON_TIMEOUT_SECONDS}),
        media_type="application/json", status_code=202,
        headers={"Cache-Control": "no-store"},
    )

@app.get("/api/tryon/status/{job_id}")
def get_tryon_status(job_id: str):
    with tryon_lock:
        prune_tryon_jobs()
        job = dict(tryon_jobs.get(job_id) or {})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": job["status"], "error": job.get("error"), "provider": job.get("provider")}

@app.get("/api/tryon/result/{job_id}")
def get_tryon_result(job_id: str):
    with tryon_lock:
        prune_tryon_jobs()
        job = dict(tryon_jobs.get(job_id) or {})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != "COMPLETED":
        raise HTTPException(status_code=400, detail=f"Job is not completed. Status: {job['status']}")
    
    file_path = job.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=500, detail="Result file missing")
    
    from fastapi.responses import FileResponse
    return FileResponse(file_path, media_type="image/jpeg", headers={"Cache-Control": "private, no-store"})

# 2. Review & Fit Summarization
@app.get("/api/reviews/summary/{product_id}")
def reviews_summary(product_id: str):
    try:
        summary_stats = NLPChatService.get_review_fit_summary(product_id)
        return summary_stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Personalized Recommendations
@app.get("/api/recommendations/{product_id}")
def get_recommendations(product_id: str):
    try:
        items = RecommendationService.get_recommendations(product_id)
        return {"items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. AI Shopping Assistant Chatbot
@app.post("/api/chat")
def chat(req: ChatRequest):
    try:
        turns = [{"role": m.role, "content": m.content} for m in req.messages]
        reply = NLPChatService.chat(turns)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. Visual Search (multipart/form-data)
@app.post("/api/search/visual")
async def visual_search(image: UploadFile = File(...)):
    try:
        image_bytes = await image.read(MAX_VISUAL_IMAGE_BYTES + 1)
        return await run_in_threadpool(VisionService.search_visual, image_bytes)
    except VisualSearchError as error:
        raise HTTPException(status_code=error.status_code, detail=str(error)) from error
    except Exception as error:
        print("Visual search failed:", type(error).__name__)
        raise HTTPException(status_code=503, detail="Image search is temporarily unavailable. Please try again.") from error

# 6. Size & Fit Predictor
@app.post("/api/fit")
def predict_size(req: FitRequest):
    try:
        prediction = RecommendationService.predict_size(req.heightCm, req.weightKg, req.fitPreference)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 7. Embeddings generation batch trigger
@app.post("/api/reindex")
def trigger_reindex():
    raise HTTPException(status_code=410, detail="The legacy embedding indexer is retired. Image search uses Gemini and the live catalog.")
