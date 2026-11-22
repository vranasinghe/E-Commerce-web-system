import json
import os
import subprocess
import sys
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image, ImageOps, UnidentifiedImageError
from dotenv import load_dotenv

SERVICE_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(SERVICE_ROOT.parents[1] / ".env")
CACHE_DIR = str(SERVICE_ROOT / ".cache" / "tryon")
MAX_UPLOAD_BYTES = 8 * 1024 * 1024
TRYON_TIMEOUT_SECONDS = max(30, min(300, int(os.getenv("TRYON_TIMEOUT_SECONDS", "120"))))


class TryOnError(Exception):
    """A customer-readable error without credentials or provider tracebacks."""


def validate_image(data: bytes) -> None:
    if not data or len(data) > MAX_UPLOAD_BYTES:
        raise ValueError("Each photo must be between 1 byte and 8 MB.")
    try:
        with Image.open(BytesIO(data)) as image:
            if image.format not in ("JPEG", "PNG", "WEBP"):
                raise ValueError("Please use JPG, PNG, or WebP photos.")
            if min(image.size) < 128 or image.width * image.height > 20_000_000:
                raise ValueError("Photos must be at least 128 pixels on each side and no more than 20 megapixels.")
            image.verify()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as error:
        raise ValueError("That photo could not be read. Please choose another image.") from error


def normalize_image(data: bytes, path: Path) -> None:
    with Image.open(BytesIO(data)) as image:
        photo = ImageOps.exif_transpose(image).convert("RGBA")
        background = Image.new("RGB", photo.size, "white")
        background.paste(photo, mask=photo.getchannel("A"))
        background.save(path, format="JPEG", quality=95)


class TryOnService:
    @staticmethod
    def run_tryon(user_img_bytes: bytes, garment_img_bytes: bytes, description: str = "upper-body top",
                  garment_type: str = "upper_body") -> bytes:
        """Run the real provider in an isolated process with a hard deadline."""
        validate_image(user_img_bytes)
        validate_image(garment_img_bytes)
        Path(CACHE_DIR).mkdir(parents=True, exist_ok=True)
        with TemporaryDirectory(prefix="request-", dir=CACHE_DIR) as directory:
            request_dir = Path(directory)
            user_path, garment_path = request_dir / "person.jpg", request_dir / "garment.jpg"
            output_path = request_dir / "result.jpg"
            normalize_image(user_img_bytes, user_path)
            normalize_image(garment_img_bytes, garment_path)
            try:
                result = subprocess.run(
                    [sys.executable, "-m", "src.services.tryon_worker", str(user_path),
                     str(garment_path), str(output_path), description[:200], garment_type],
                    cwd=SERVICE_ROOT, capture_output=True, text=True,
                    timeout=TRYON_TIMEOUT_SECONDS,
                    creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
                )
            except subprocess.TimeoutExpired as error:
                raise TryOnError("The try-on service took too long. Please try again later.") from error
            if result.returncode != 0:
                try:
                    code = json.loads(result.stdout.strip().splitlines()[-1]).get("code")
                except (ValueError, IndexError):
                    code = "UNAVAILABLE"
                messages = {
                    "TIMEOUT": "The try-on service took too long. Please try again later.",
                    "QUOTA": "The try-on provider is busy or has reached its usage limit. Please try again later.",
                    "AUTH": "The try-on provider requires account access. Please contact the store.",
                }
                raise TryOnError(messages.get(code, "The AI try-on service is unavailable. Please try again later."))
            if not output_path.is_file():
                raise TryOnError("The AI service did not return a preview. Please try again.")
            output = output_path.read_bytes()
            try:
                with Image.open(BytesIO(output)) as image:
                    if image.format != "JPEG":
                        raise ValueError("Unexpected image format")
                    image.verify()
            except (UnidentifiedImageError, OSError, ValueError) as error:
                raise TryOnError("The AI service returned an unreadable preview. Please try again.") from error
            return output
