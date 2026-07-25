import math
import random
import numpy as np
from src.services.db import execute_query

class RecommendationService:
    @staticmethod
    def get_recommendations(product_id: str) -> list:
        """
        Returns a list of recommended product objects for the "You may also like" carousel.
        Uses vector similarity on text embeddings if present, otherwise falls back to a 
        category-matching, price-proximity heuristic.
        """
        try:
            # 1. Fetch target product details
            product = execute_query(
                'SELECT id, "categoryId", brand, "basePrice" FROM "Product" WHERE id = %s',
                (product_id,)
            )
            if not product:
                return []
            product = product[0]
            
            # 2. Try vector-based content recommendation
            target_emb = execute_query(
                'SELECT "textEmbedding" FROM "ProductEmbedding" WHERE "productId" = %s',
                (product_id,)
            )
            
            if target_emb and target_emb[0]["textEmbedding"]:
                target_vector = np.array(target_emb[0]["textEmbedding"])
                
                # Fetch all other active product embeddings
                candidates = execute_query(
                    'SELECT pe."productId", pe."textEmbedding", p.slug, p.name, p."basePrice", p.images '
                    'FROM "ProductEmbedding" pe '
                    'JOIN "Product" p ON pe."productId" = p.id '
                    'WHERE p.active = true AND p.id != %s',
                    (product_id,)
                )
                
                scored_candidates = []
                for c in candidates:
                    c_emb = c["textEmbedding"]
                    if c_emb and len(c_emb) > 0:
                        c_vector = np.array([float(x) for x in c_emb])
                        # Dot product for normalized cosine similarity
                        score = float(np.dot(target_vector, c_vector))
                        scored_candidates.append({
                            "productId": c["productId"],
                            "slug": c["slug"],
                            "name": c["name"],
                            "price": float(c["basePrice"]),
                            "image": c["images"][0] if c["images"] else "",
                            "score": score
                        })
                
                if scored_candidates:
                    scored_candidates.sort(key=lambda x: x["score"], reverse=True)
                    return scored_candidates[:6]
                    
        except Exception as err:
            print("Error in vector recommendation, falling back to heuristic:", err)

        # 3. Heuristic Fallback (Category/Brand + Price Proximity)
        try:
            target_price = float(product["basePrice"]) if product else 50.0
            cat_id = product["categoryId"] if product else None
            brand = product["brand"] if product else None
            
            candidates = execute_query(
                'SELECT id, slug, name, "basePrice", images FROM "Product" '
                'WHERE active = true AND id != %s AND ("categoryId" = %s OR brand = %s) '
                "LIMIT 12",
                (product_id, cat_id, brand)
            )
            
            results = []
            for c in candidates:
                price = float(c["basePrice"])
                # Similarity proxy: closer price -> higher score
                price_diff = abs(price - target_price)
                score = 1.0 / (1.0 + (price_diff / 50.0))
                
                results.append({
                    "productId": c["id"],
                    "slug": c["slug"],
                    "name": c["name"],
                    "price": price,
                    "image": c["images"][0] if c["images"] else "",
                    "score": round(score, 4)
                })
            
            results.sort(key=lambda x: x["score"], reverse=True)
            return results[:6]
            
        except Exception as e:
            print("Error in heuristic recommendation fallback:", e)
            return []

    @staticmethod
    def predict_size(height_cm: int, weight_kg: int, fit_preference: str) -> dict:
        """
        Calculates size prediction using BMI categories, height threshold nudges, 
        and fit preferences. Returns recommended size, confidence, and explanation.
        """
        sizes = ["XS", "S", "M", "L", "XL", "XXL"]
        
        # BMI Calculation
        height_m = height_cm / 100.0
        bmi = weight_kg / (height_m * height_m)
        
        # Base size estimation from BMI
        if bmi < 18.5:
            idx = 1  # S
        elif bmi < 22.0:
            idx = 2  # M
        elif bmi < 25.0:
            idx = 3  # L
        elif bmi < 28.0:
            idx = 4  # XL
        else:
            idx = 5  # XXL

        # Tall height shift
        if height_cm >= 190 and idx < len(sizes) - 1:
            idx += 1
            
        # Fit preference shifts
        if fit_preference == "relaxed" and idx < len(sizes) - 1:
            idx += 1
        elif fit_preference == "slim" and idx > 0:
            idx -= 1
            
        recommended_size = sizes[idx]
        
        # Confidence calculation based on proximity to BMI band centers
        band_centers = [16.0, 20.0, 23.5, 26.5, 30.0]
        nearest_diff = min(abs(bmi - center) for center in band_centers)
        confidence = max(0.60, min(0.95, 0.95 - (nearest_diff / 20.0)))
        
        # Size suggestion shift advice in rationale
        shift_advice = "size up" if fit_preference == "relaxed" else "size down"
        rationale = (
            f"Based on your height and weight (BMI ~{bmi:.1f}) and a {fit_preference} fit preference, "
            f"we suggest size {recommended_size}. If you fall in between standard sizes, "
            f"consider choosing to {shift_advice} to suit your comfort."
        )
        
        return {
            "recommendedSize": recommended_size,
            "confidence": round(confidence, 2),
            "rationale": rationale
        }
