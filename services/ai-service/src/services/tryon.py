import os
import uuid
from io import BytesIO
from PIL import Image
from gradio_client import Client, handle_file

# Try-on space cache folder
CACHE_DIR = os.path.join(os.path.expanduser("~"), ".cache", "aura-tryon")
os.makedirs(CACHE_DIR, exist_ok=True)

class TryOnService:
    @staticmethod
    def run_tryon(user_img_bytes: bytes, garment_img_bytes: bytes) -> bytes:
        """
        Executes virtual try-on using Hugging Face IDM-VTON or overlays the garment 
        onto the user image as a fallback.
        """
        # Save temp files for Gradio client
        user_temp_path = os.path.join(CACHE_DIR, f"user_{uuid.uuid4().hex}.png")
        garment_temp_path = os.path.join(CACHE_DIR, f"garment_{uuid.uuid4().hex}.png")
        
        try:
            with open(user_temp_path, "wb") as f:
                f.write(user_img_bytes)
            with open(garment_temp_path, "wb") as f:
                f.write(garment_img_bytes)
                
            # Attempt to use Hugging Face Space for IDM-VTON
            try:
                print("Calling Hugging Face IDM-VTON Space...")
                client = Client("yisol/IDM-VTON", verbose=False)
                
                # Predict returns file paths
                result = client.predict(
                    dict(background=handle_file(user_temp_path), layers=[], composite=None),
                    handle_file(garment_temp_path),
                    "garment", # text description
                    True, # is checked
                    True, # is checked details
                    30, # steps
                    42, # seed
                    api_name="/tryon"
                )
                
                # Check results
                # result is a tuple, result[0] is the tryon image path
                if isinstance(result, tuple) and len(result) > 0:
                    tryon_image_path = result[0]
                elif isinstance(result, str):
                    tryon_image_path = result
                else:
                    raise ValueError("Unexpected result format from Gradio client")
                
                with open(tryon_image_path, "rb") as f:
                    output_bytes = f.read()
                print("Successfully generated tryon via Hugging Face space!")
                return output_bytes
                
            except Exception as hf_err:
                print(f"HF Space Try-On failed, falling back to local PIL composite overlay. Error: {hf_err}")
                return TryOnService.generate_fallback_composite(user_temp_path, garment_temp_path)
                
        finally:
            # Clean up temp files
            for p in [user_temp_path, garment_temp_path]:
                if os.path.exists(p):
                    try:
                        os.remove(p)
                    except:
                        pass

    @staticmethod
    def generate_fallback_composite(user_path: str, garment_path: str) -> bytes:
        """
        Fallback: Resizes the garment and overlays it in the lower-middle section 
        of the user image (chest/body area) to simulate a try-on look.
        """
        user_img = Image.open(user_path).convert("RGBA")
        garment_img = Image.open(garment_path).convert("RGBA")
        
        # Calculate size for garment (e.g. 45% of user image width)
        w_user, h_user = user_img.size
        w_g, h_g = garment_img.size
        
        target_w = int(w_user * 0.45)
        target_h = int(h_g * (target_w / w_g))
        
        resized_garment = garment_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # Paste in center-lower area (representing body area)
        x_pos = int((w_user - target_w) / 2)
        y_pos = int(h_user * 0.42)
        
        # Create a new composite layer
        composite = Image.new("RGBA", user_img.size)
        composite.paste(user_img, (0, 0))
        composite.paste(resized_garment, (x_pos, y_pos), mask=resized_garment)
        
        # Save output bytes
        out_io = BytesIO()
        composite.convert("RGB").save(out_io, format="JPEG", quality=90)
        return out_io.getvalue()
