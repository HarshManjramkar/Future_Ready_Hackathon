"""
EduFlow NFR, Adversarial Security & Performance Test Suite (bmad-tea & Virat Innovation Suite).
Tests injection resistance, extreme payloads, concurrency stress, and boundary conditions.
"""
import unittest
import sys
import time
from pathlib import Path
from unittest.mock import MagicMock

def mock_decorator(*args, **kwargs):
    def decorator(fn):
        return fn
    return decorator

if "fastapi" not in sys.modules:
    fastapi_mock = MagicMock()
    fastapi_mock.FastAPI.return_value.get = mock_decorator
    fastapi_mock.FastAPI.return_value.post = mock_decorator
    sys.modules["fastapi"] = fastapi_mock
    sys.modules["fastapi.middleware"] = MagicMock()
    sys.modules["fastapi.middleware.cors"] = MagicMock()

if "pydantic" not in sys.modules:
    pydantic_mock = MagicMock()
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
    pydantic_mock.BaseModel = BaseModel
    sys.modules["pydantic"] = pydantic_mock

for mod in ["ortools", "ortools.sat", "ortools.sat.python", "ortools.sat.python.cp_model", "PIL", "dotenv"]:
    if mod not in sys.modules:
        sys.modules[mod] = MagicMock()

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

if "app.main" in sys.modules:
    del sys.modules["app.main"]

import app.main as api_app


class TestNFRAdversarialPerf(unittest.TestCase):
    """Adversarial security, extreme boundary, and performance benchmark tests."""

    def setUp(self):
        api_app.reset_demo_state()

    def test_adversarial_malformed_json_in_qr(self):
        """Security: Malformed JSON string in QR code should not crash the scanner."""
        malformed_qrs = [
            '{"id": 9901',  # Unclosed brace
            '{"id": None}',  # Python literal in JSON
            '<script>alert("XSS")</script>',
            "' OR '1'='1",
            "A" * 5000  # Extreme payload length
        ]
        for qr in malformed_qrs:
            req = api_app.AttendanceScanRequest(qr_code=qr, face_detected=True)
            res = api_app.register_attendance(req)
            self.assertIn(res["status"], ["SUCCESS", "REJECTED"])

    def test_adversarial_verification_with_injection_strings(self):
        """Security: Verify student registration safely sanitizes/escapes XSS/SQL injections."""
        api_app.UNREVIEWED_DOCUMENTS.clear()
        api_app.UNREVIEWED_DOCUMENTS.append({"document_type": "STUDENT_ADMISSION_FORM"})
        
        req = api_app.VerificationRequest(
            index=0,
            verified_data={
                "student_info": {"full_name": "<script>alert('pwn')</script>", "aadhaar_number": "9999-8888-7777"},
                "parent_info": {"father_mobile": "'+DROP TABLE STUDENTS;--"},
                "address": {"city": "Pune \u2603\u2728"}
            }
        )
        res = api_app.verify_document(req)
        self.assertEqual(res["status"], "SUCCESS")
        # Ensure payload is HTML-escaped to prevent stored XSS attacks
        self.assertNotIn("<script>", res["student"]["name"])
        self.assertIn("&lt;script&gt;", res["student"]["name"])

    def test_concurrency_and_throughput_kiosk_scans(self):
        """NFR Stress: 100 rapid attendance scans must execute in < 0.05 seconds total."""
        start = time.time()
        for i in range(100):
            req = api_app.AttendanceScanRequest(qr_code="9901", face_detected=True)
            api_app.register_attendance(req)
        duration = time.time() - start
        self.assertLess(duration, 0.05, f"Throughput too low: 100 scans took {duration:.4f}s")

    def test_state_isolation_and_demo_reset_hygiene(self):
        """Verify POST /api/demo/reset completely wipes temporary state mutations."""
        # Mutate state
        api_app.register_attendance(api_app.AttendanceScanRequest(qr_code="9901", face_detected=True))
        api_app.UNREVIEWED_DOCUMENTS.append({"test": 123})
        
        # Reset
        res = api_app.reset_demo_state()
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(len(api_app.UNREVIEWED_DOCUMENTS), 0)
        for student in api_app.ATTENDANCE_LOGS:
            self.assertEqual(student["attendance_status"], "ABSENT")


if __name__ == "__main__":
    unittest.main()
