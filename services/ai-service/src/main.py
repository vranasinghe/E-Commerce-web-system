import os
import uuid
import json
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional

# Import services
from src.services.tryon import TryOnService
from src.services.nlp_chat import NLPChatService
from src.services.vision import VisionService
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

def process_tryon_task(job_id: str, user_bytes: bytes, garment_bytes: bytes):
    tryon_jobs[job_id] = {"status": "PROCESSING"}
    try:
        from src.services.tryon import CACHE_DIR
        output_bytes = TryOnService.run_tryon(user_bytes, garment_bytes)
        output_path = os.path.join(CACHE_DIR, f"result_{job_id}.jpg")
        with open(output_path, "wb") as f:
            f.write(output_bytes)
        tryon_jobs[job_id] = {"status": "COMPLETED", "file_path": output_path}
    except Exception as e:
        print(f"Async tryon task error for job {job_id}: {e}")
        tryon_jobs[job_id] = {"status": "FAILED", "error": str(e)}

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
    garment_image: UploadFile = File(...)
):
    try:
        job_id = str(uuid.uuid4())
        user_bytes = await user_image.read()
        garment_bytes = await garment_image.read()
        
        tryon_jobs[job_id] = {"status": "PENDING"}
        background_tasks.add_task(process_tryon_task, job_id, user_bytes, garment_bytes)
        
        return Response(
            content=json.dumps({"job_id": job_id, "status": "PENDING"}),
            media_type="application/json",
            status_code=202
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tryon/status/{job_id}")
def get_tryon_status(job_id: str):
    job = tryon_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": job["status"], "error": job.get("error")}

@app.get("/api/tryon/result/{job_id}")
def get_tryon_result(job_id: str):
    job = tryon_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job["status"] != "COMPLETED":
        raise HTTPException(status_code=400, detail=f"Job is not completed. Status: {job['status']}")
    
    file_path = job.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=500, detail="Result file missing")
    
    from fastapi.responses import FileResponse
    return FileResponse(file_path, media_type="image/jpeg")

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
        image_bytes = await image.read()
        results = VisionService.search_visual(image_bytes)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
    try:
        VisionService.generate_product_embeddings()
        return {"ok": True, "message": "Precomputed product embeddings successfully generated."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
