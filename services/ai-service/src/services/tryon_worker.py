"""Isolated Gradio request. The parent process enforces the total time limit.

Upper-body garments (tops, jackets) use IDM-VTON. Lower-body garments (trousers,
shorts) and dresses use OOTDiffusion, whose full-body mode has a category switch.
"""
import json
import os
import sys
from concurrent.futures import TimeoutError
from pathlib import Path

from gradio_client import Client, handle_file
from PIL import Image


def main() -> int:
    user_path, garment_path, output_path, description = sys.argv[1:5]
    garment_type = sys.argv[5] if len(sys.argv) > 5 else "upper_body"
    client = None
    job = None
    try:
        if garment_type == "upper_body":
            client = Client(
                os.getenv("TRYON_SPACE", "yisol/IDM-VTON"),
                token=os.getenv("HF_TOKEN") or None,
                verbose=False,
                httpx_kwargs={"timeout": 20.0},
                download_files=str(Path(output_path).parent),
                analytics_enabled=False,
            )
            job = client.submit(
                {"background": handle_file(user_path), "layers": [], "composite": None},
                handle_file(garment_path), description, True, False, 30, 42,
                api_name="/tryon",
            )
        else:
            category = {"lower_body": "Lower-body", "dress": "Dress"}[garment_type]
            client = Client(
                os.getenv("TRYON_SPACE_FULL", "levihsu/OOTDiffusion"),
                token=os.getenv("HF_TOKEN") or None,
                verbose=False,
                httpx_kwargs={"timeout": 20.0},
                download_files=str(Path(output_path).parent),
                analytics_enabled=False,
            )
            job = client.submit(
                handle_file(user_path), handle_file(garment_path), category,
                1, 20, 2, -1, api_name="/process_dc",
            )
        timeout = max(10, int(os.getenv("TRYON_TIMEOUT_SECONDS", "120")) - 25)
        result = job.result(timeout=timeout)
        result_path = result[0] if isinstance(result, (tuple, list)) else result
        # OOTDiffusion returns a gallery: [{"image": path, ...}]
        if isinstance(result_path, dict):
            result_path = result_path.get("image") or result_path.get("path")
        if isinstance(result_path, dict):
            result_path = result_path.get("path")
        if not isinstance(result_path, str):
            raise ValueError("No image returned")
        with Image.open(result_path) as image:
            image.convert("RGB").save(output_path, format="JPEG", quality=95)
        return 0
    except Exception as error:
        detail = str(error).lower()
        code = "UNAVAILABLE"
        if isinstance(error, TimeoutError):
            code = "TIMEOUT"
            if job:
                job.cancel()
        elif any(word in detail for word in ("quota", "gpu", "429", "rate limit", "too many")):
            code = "QUOTA"
        elif any(word in detail for word in ("unauthorized", "authentication", "401", "403", "sign in")):
            code = "AUTH"
        print(json.dumps({"code": code}), flush=True)
        return 1
    finally:
        if client:
            client.close()


if __name__ == "__main__":
    sys.exit(main())
