"""Isolated Gradio request. The parent process enforces the total time limit."""
import json
import os
import sys
from concurrent.futures import TimeoutError
from pathlib import Path

from gradio_client import Client, handle_file
from PIL import Image


def main() -> int:
    user_path, garment_path, output_path, description = sys.argv[1:]
    client = None
    job = None
    try:
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
        timeout = max(10, int(os.getenv("TRYON_TIMEOUT_SECONDS", "120")) - 25)
        result = job.result(timeout=timeout)
        result_path = result[0] if isinstance(result, (tuple, list)) else result
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
