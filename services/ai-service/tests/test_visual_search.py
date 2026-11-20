import json
import os
import unittest
from io import BytesIO
from unittest.mock import Mock, patch

from fastapi.testclient import TestClient
from PIL import Image

from src.main import app
from src.services.vision import VisionService, score_product


def photo_bytes():
    output = BytesIO()
    Image.new("RGB", (300, 400), "pink").save(output, "JPEG")
    return output.getvalue()


class VisualSearchTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key", "GEMINI_MODEL": "gemini-3.5-flash-lite"})
    @patch("src.services.vision.httpx.post")
    @patch("src.services.vision.execute_query")
    def test_dress_finds_real_category_and_ranks_flora_first(self, query, post):
        query.side_effect = [
            [{"slug": "dresses", "name": "Dresses", "parentName": "Women"}],
            [
                {"id": "a", "slug": "slip-satin-dress", "name": "Slip Satin Dress", "description": "Plain bias-cut satin dress", "gender": "women", "images": ["/slip.webp"], "basePrice": 98, "colors": ["Blush"]},
                {"id": "b", "slug": "floral-tea-dress", "name": "Floral Tea Dress", "description": "Vintage floral print", "gender": "women", "images": ["/floral.webp"], "basePrice": 92, "colors": ["Pink"]},
            ],
        ]
        post.return_value = Mock(status_code=200)
        post.return_value.json.return_value = {"candidates": [{"content": {"parts": [{"text": json.dumps({
            "categorySlug": "dresses", "gender": "women", "garmentType": "tea dress",
            "color": "pink", "pattern": "floral", "keywords": ["floral", "tea"],
        })}]}}]}
        response = self.client.post("/api/search/visual", files={"image": ("dress.jpg", photo_bytes(), "image/jpeg")})
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(result["category"]["slug"], "dresses")
        self.assertEqual(result["results"][0]["slug"], "floral-tea-dress")
        self.assertEqual(result["results"][0]["price"], 92)
        self.assertNotIn("similarity", result["results"][0])
        self.assertEqual(post.call_args.kwargs["headers"]["x-goog-api-key"], "test-key")
        self.assertEqual(post.call_args.kwargs["json"]["contents"][0]["parts"][1]["inline_data"]["mime_type"], "image/jpeg")

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("src.services.vision.httpx.post")
    @patch("src.services.vision.execute_query", return_value=[{"slug": "dresses", "name": "Dresses", "parentName": "Women"}])
    def test_unknown_category_returns_no_random_products(self, _query, post):
        post.return_value = Mock(status_code=200)
        post.return_value.json.return_value = {"candidates": [{"content": {"parts": [{"text": '{"categorySlug":null}'}]}}]}
        result = VisionService.search_visual(photo_bytes())
        self.assertIsNone(result["category"])
        self.assertEqual(result["results"], [])

    @patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"})
    @patch("src.services.vision.httpx.post")
    @patch("src.services.vision.execute_query")
    def test_department_suffix_from_model_still_maps_to_real_category(self, query, post):
        query.side_effect = [
            [{"slug": "outerwear", "name": "Outerwear", "parentName": "Men"}],
            [{"id": "coat", "slug": "wool-overcoat", "name": "Wool Overcoat", "description": "Warm coat", "gender": "men", "images": ["/coat.webp"], "basePrice": 245, "colors": ["Camel"]}],
        ]
        post.return_value = Mock(status_code=200)
        post.return_value.json.return_value = {"candidates": [{"content": {"parts": [{"text": json.dumps({
            "categorySlug": "outerwear (Men)", "gender": "men", "garmentType": "overcoat",
            "color": "camel", "pattern": "solid", "keywords": ["coat"],
        })}]}}]}
        result = VisionService.search_visual(photo_bytes())
        self.assertEqual(result["category"]["slug"], "outerwear")
        self.assertEqual(result["results"][0]["slug"], "wool-overcoat")

    def test_bad_image_is_rejected_before_provider(self):
        response = self.client.post("/api/search/visual", files={"image": ("bad.jpg", b"not an image", "image/jpeg")})
        self.assertEqual(response.status_code, 422)

    def test_score_uses_catalog_details(self):
        product = {"name": "Floral Tea Dress", "description": "Soft floral print", "colors": ["Pink"]}
        category = {"garmentType": "tea dress", "keywords": ["floral"], "pattern": "floral", "color": "pink"}
        self.assertGreater(score_product(product, category), 0)


if __name__ == "__main__":
    unittest.main()
