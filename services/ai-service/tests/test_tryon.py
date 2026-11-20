import json
import os
import subprocess
import tempfile
import time
import unittest
from io import BytesIO
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient
from PIL import Image

from src import main
from src.services import tryon


def photo_bytes():
    buffer = BytesIO()
    Image.new("RGB", (256, 384), "white").save(buffer, format="JPEG")
    return buffer.getvalue()


class ProviderTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.cache = patch.object(tryon, "CACHE_DIR", self.directory.name)
        self.cache.start()
        self.addCleanup(self.cache.stop)

    @patch.object(tryon.subprocess, "run")
    def test_success_requires_valid_provider_output_and_removes_inputs(self, run):
        def provider(command, **kwargs):
            self.assertEqual(kwargs["timeout"], tryon.TRYON_TIMEOUT_SECONDS)
            self.assertTrue(Path(command[3]).exists())
            Path(command[5]).write_bytes(photo_bytes())
            return subprocess.CompletedProcess(command, 0, stdout="")
        run.side_effect = provider
        result = tryon.TryOnService.run_tryon(photo_bytes(), photo_bytes())
        self.assertEqual(Image.open(BytesIO(result)).format, "JPEG")
        self.assertEqual(list(Path(self.directory.name).iterdir()), [])

    @patch.object(tryon.subprocess, "run")
    def test_provider_failure_is_not_a_successful_overlay(self, run):
        run.return_value = subprocess.CompletedProcess([], 1, stdout=json.dumps({"code": "QUOTA"}))
        with self.assertRaisesRegex(tryon.TryOnError, "usage limit"):
            tryon.TryOnService.run_tryon(photo_bytes(), photo_bytes())
        self.assertEqual(list(Path(self.directory.name).iterdir()), [])

    @patch.object(tryon.subprocess, "run", side_effect=subprocess.TimeoutExpired("worker", 120))
    def test_provider_has_a_hard_deadline(self, _run):
        with self.assertRaisesRegex(tryon.TryOnError, "took too long"):
            tryon.TryOnService.run_tryon(photo_bytes(), photo_bytes())
        self.assertEqual(list(Path(self.directory.name).iterdir()), [])

    @patch.object(tryon.subprocess, "run")
    def test_invalid_upload_does_not_reach_provider(self, run):
        with self.assertRaises(ValueError):
            tryon.TryOnService.run_tryon(b"not a photo", photo_bytes())
        with self.assertRaises(ValueError):
            tryon.validate_image(b"a" * (tryon.MAX_UPLOAD_BYTES + 1))
        run.assert_not_called()

    @patch.object(tryon.subprocess, "run")
    def test_empty_success_response_is_rejected(self, run):
        run.return_value = subprocess.CompletedProcess([], 0, stdout="")
        with self.assertRaisesRegex(tryon.TryOnError, "did not return"):
            tryon.TryOnService.run_tryon(photo_bytes(), photo_bytes())


class TryOnApiTests(unittest.TestCase):
    def setUp(self):
        main.tryon_jobs.clear()
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.cache = patch.object(main, "CACHE_DIR", self.directory.name)
        self.cache.start()
        self.addCleanup(self.cache.stop)
        self.addCleanup(main.tryon_jobs.clear)
        self.client = TestClient(main.app)

    def upload(self, **data):
        return self.client.post("/api/tryon", files={
            "user_image": ("person.jpg", photo_bytes(), "image/jpeg"),
            "garment_image": ("top.jpg", photo_bytes(), "image/jpeg"),
        }, data=data)

    @patch.object(main.TryOnService, "run_tryon", return_value=photo_bytes())
    def test_real_result_contract_status_and_private_download(self, provider):
        queued = self.upload(garment_description="White cotton top")
        self.assertEqual(queued.status_code, 202)
        job_id = queued.json()["job_id"]
        status = self.client.get(f"/api/tryon/status/{job_id}").json()
        self.assertEqual(status["status"], "COMPLETED")
        self.assertEqual(status["provider"], "idm-vton")
        result = self.client.get(f"/api/tryon/result/{job_id}")
        self.assertEqual(result.status_code, 200)
        self.assertEqual(result.headers["cache-control"], "private, no-store")
        self.assertEqual(Image.open(BytesIO(result.content)).format, "JPEG")
        self.assertEqual(provider.call_args.args[2], "White cotton top")

    @patch.object(main.TryOnService, "run_tryon", side_effect=tryon.TryOnError("Provider busy. Please retry later."))
    def test_failure_is_reported_and_has_no_result(self, _provider):
        queued = self.upload()
        job_id = queued.json()["job_id"]
        status = self.client.get(f"/api/tryon/status/{job_id}").json()
        self.assertEqual(status["status"], "FAILED")
        self.assertIn("Provider busy", status["error"])
        self.assertEqual(self.client.get(f"/api/tryon/result/{job_id}").status_code, 400)
        self.assertEqual(list(Path(self.directory.name).iterdir()), [])

    @patch.object(main.TryOnService, "run_tryon")
    def test_unsupported_categories_and_invalid_files_are_rejected(self, provider):
        self.assertEqual(self.upload(garment_type="lower_body").status_code, 422)
        invalid = self.client.post("/api/tryon", files={
            "user_image": ("bad.jpg", b"not a photo", "image/jpeg"),
            "garment_image": ("top.jpg", photo_bytes(), "image/jpeg"),
        })
        self.assertEqual(invalid.status_code, 422)
        provider.assert_not_called()

    def test_unknown_jobs_return_not_found(self):
        self.assertEqual(self.client.get("/api/tryon/status/missing").status_code, 404)
        self.assertEqual(self.client.get("/api/tryon/result/missing").status_code, 404)

    def test_abandoned_processing_job_expires(self):
        main.tryon_jobs["stale"] = {"status": "PROCESSING", "created_at": time.monotonic() - tryon.TRYON_TIMEOUT_SECONDS - 25}
        status = self.client.get("/api/tryon/status/stale").json()
        self.assertEqual(status["status"], "FAILED")
        self.assertIn("too long", status["error"])

    def test_expired_preview_is_deleted(self):
        image = Path(self.directory.name) / "expired.jpg"
        image.write_bytes(photo_bytes())
        main.tryon_jobs["expired"] = {
            "status": "COMPLETED", "created_at": time.monotonic() - 4000,
            "finished_at": time.monotonic() - 3700, "file_path": str(image),
        }
        self.assertEqual(self.client.get("/api/tryon/status/expired").status_code, 404)
        self.assertFalse(image.exists())

    @patch.object(main.TryOnService, "run_tryon")
    def test_capacity_is_bounded(self, provider):
        for job_id in ("busy1", "busy2"):
            main.tryon_jobs[job_id] = {"status": "PROCESSING", "created_at": time.monotonic()}
        self.assertEqual(self.upload().status_code, 429)
        provider.assert_not_called()

    def test_orphaned_preview_is_removed_after_restart(self):
        image = Path(self.directory.name) / "result_orphan.jpg"
        image.write_bytes(photo_bytes())
        expired = time.time() - 3700
        os.utime(image, (expired, expired))
        self.assertEqual(self.client.get("/api/tryon/status/missing").status_code, 404)
        self.assertFalse(image.exists())


if __name__ == "__main__":
    unittest.main()
