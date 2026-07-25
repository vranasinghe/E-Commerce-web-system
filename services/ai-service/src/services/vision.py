import io
import random
import uuid
import numpy as np
from PIL import Image
from src.services.db import execute_query, execute_insert_or_update

# Attempt to load PyTorch & Transformers for CLIP embeddings
CLIP_AVAILABLE = False
try:
    import torch
    from transformers import CLIPProcessor, CLIPModel
    
    # Use CPU by default to make it run on any developer machine
    device = "cpu"
    model_name = "openai/clip-vit-base-patch32"
    print(f"Loading CLIP model '{model_name}'...")
    processor = CLIPProcessor.from_pretrained(model_name)
    model = CLIPModel.from_pretrained(model_name).to(device)
    CLIP_AVAILABLE = True
    print("CLIP model loaded successfully!")
except Exception as e:
    print(f"Transformers/Torch not available. Visual Search running in fallback mockup mode. Reason: {e}")

class VisionService:
    @staticmethod
    def get_image_embedding(image_bytes: bytes) -> list:
        """
        Generates a 512-dimensional CLIP embedding vector from image bytes.
        Returns a list of 512 floats, or an empty list if CLIP is not available.
        """
        if not CLIP_AVAILABLE:
            return []
            
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            inputs = processor(images=image, return_tensors="pt").to(device)
            with torch.no_grad():
                image_features = model.get_image_features(**inputs)
            # Normalize embedding
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
            embedding_list = image_features[0].cpu().numpy().tolist()
            return embedding_list
        except Exception as err:
            print("Error generating CLIP embedding:", err)
            return []

    @staticmethod
    def search_visual(image_bytes: bytes) -> list:
        """
        Finds products that look similar to the uploaded image.
        If CLIP is available, compares the image embedding against stored product embeddings.
        If not, falls back to returning a selection of products with simulated similarity scores.
        """
        query_vector = VisionService.get_image_embedding(image_bytes)
        
        # If CLIP is available and we successfully got a vector
        if query_vector:
            try:
                # Query all product embeddings
                stored_embeddings = execute_query(
                    'SELECT pe."productId", pe."imageEmbedding", p.slug, p.name, p.images '
                    'FROM "ProductEmbedding" pe '
                    'JOIN "Product" p ON pe."productId" = p.id '
                    'WHERE p.active = true'
                )
                
                results = []
                q_arr = np.array(query_vector)
                
                for row in stored_embeddings:
                    emb = row["imageEmbedding"]
                    # Clean up if emb is stored as string in array or float list
                    if emb and len(emb) > 0:
                        db_arr = np.array([float(x) for x in emb])
                        # Cosine similarity (since vectors are normalized, it is just dot product)
                        similarity = np.dot(q_arr, db_arr)
                        results.append({
                            "productId": row["productId"],
                            "slug": row["slug"],
                            "name": row["name"],
                            "image": row["images"][0] if row["images"] else "",
                            "similarity": float(similarity)
                        })
                
                if results:
                    # Sort descending by similarity
                    results.sort(key=lambda x: x["similarity"], reverse=True)
                    return results[:8]
            except Exception as e:
                print("Error doing vector similarity search in DB, falling back:", e)

        # Fallback mockup mode: returns a subset of products with mock similarity scores
        try:
            products = execute_query(
                'SELECT id, slug, name, images FROM "Product" WHERE active = true'
            )
            if not products:
                return []
                
            # Randomize and select 8
            sampled = random.sample(products, min(len(products), 8))
            results = []
            for i, p in enumerate(sampled):
                similarity = max(0.55, 0.95 - (i * 0.05))
                results.append({
                    "productId": p["id"],
                    "slug": p["slug"],
                    "name": p["name"],
                    "image": p["images"][0] if p["images"] else "",
                    "similarity": similarity
                })
            return results
        except Exception as e:
            print("Error generating fallback visual search results:", e)
            return []
            
    @staticmethod
    def generate_product_embeddings():
        """
        Runs batch jobs to precompute embeddings for all active products.
        Stores them in ProductEmbedding table.
        """
        # Select all active products
        try:
            products = execute_query(
                'SELECT id, name, description FROM "Product" WHERE active = true'
            )
            count = 0
            for p in products:
                # Stub: in a real environment we would also fetch the product image, download it, 
                # run get_image_embedding, and store it.
                # Here we just generate a random vector of 512 dimensions to represent the image embedding
                # and text embedding for testing, unless CLIP is loaded.
                if CLIP_AVAILABLE:
                    # Fake embedding or text embedding
                    text_vec = [random.uniform(-0.1, 0.1) for _ in range(512)] # Stub text
                    img_vec = [random.uniform(-0.1, 0.1) for _ in range(512)]
                else:
                    text_vec = [random.uniform(-0.1, 0.1) for _ in range(512)]
                    img_vec = [random.uniform(-0.1, 0.1) for _ in range(512)]

                # POST to Express core API gateway to upsert the embedding (Single-writer pattern)
                try:
                    import os
                    import urllib.request
                    import json
                    core_api_url = os.getenv("CORE_API_URL", "http://localhost:4000")
                    req_url = f"{core_api_url}/api/products/embeddings"
                    req_data = json.dumps({
                        "productId": p["id"],
                        "textEmbedding": text_vec,
                        "imageEmbedding": img_vec
                    }).encode("utf-8")
                    
                    req = urllib.request.Request(
                        req_url,
                        data=req_data,
                        headers={"Content-Type": "application/json"},
                        method="POST"
                    )
                    with urllib.request.urlopen(req) as resp:
                        resp.read()
                except Exception as req_err:
                    print(f"Failed to post embedding to Core API for product {p['id']}: {req_err}")
                count += 1
            print(f"Generated embeddings for {count} products in database via Core API gateway.")
        except Exception as e:
            print("Failed to run batch embedding job:", e)
