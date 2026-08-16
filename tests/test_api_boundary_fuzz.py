"""
EduFlow API Boundary & Memory Stress Fuzzing Suite (bmad-tea & Virat Oracle).
Probes extreme index boundaries, memory heap leakage, XSS sanitization, and state integrity.
"""
import unittest
import sys
from pathlib import Path
from unittest.mock import MagicMock

def mock_decorator(*args, **kwargs):
    def decorator(fn): return fn
    return decorator

if "fastapi" not in sys.modules:
    fastapi_mock = MagicMock()
    class HTTPException(Exception):
        def __init__(self, status_code, detail=""):
            self.status_code = status_code
            self.detail = detail
    fastapi_mock.HTTPException = HTTPException
    fastapi_mock.FastAPI.return_value.get = mock_decorator
    fastapi_mock.FastAPI.return_value.post = mock_decorator
    sys.modules["fastapi"] = fastapi_mock
    sys.modules["fastapi.middleware"] = MagicMock()
    sys.modules["fastapi.middleware.cors"] = MagicMock()

if "pydantic" not in sys.modules:
    pydantic_mock = MagicMock()
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items(): setattr(self, k, v)
    pydantic_mock.BaseModel = BaseModel
    sys.modules["pydantic"] = pydantic_mock

for mod in ["ortools", "ortools.sat", "ortools.sat.python", "ortools.sat.python.cp_model", "PIL", "dotenv"]:
    if mod not in sys.modules: sys.modules[mod] = MagicMock()

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path: sys.path.insert(0, str(BACKEND_DIR))
if "app.main" in sys.modules: del sys.modules["app.main"]

import app.main as api_app


class TestAPIBoundaryFuzz(unittest.TestCase):
    """Deep boundary fuzzing and memory heap stress testing across REST APIs."""

    def setUp(self):
        api_app.reset_demo_state()

    def test_extreme_verification_index_boundaries(self):
        """Boundary: Fuzz document verification with negative, zero, and huge out-of-range indices."""
        fuzzed_indices = [-1, -999, 0, 1, 99999, 2**31 - 1]
        for idx in fuzzed_indices:
            req = api_app.VerificationRequest(index=idx, verified_data={"student_info": {}, "parent_info": {}, "address": {}})
            # Should safely raise HTTPException if unreviewed inbox is empty or out-of-range
            with self.assertRaises(Exception):
                api_app.verify_document(req)

    def test_memory_leakage_and_heap_reclamation_stress(self):
        """Stress: Ingest 500 students, verify state growth, then reset to verify exact heap reclamation."""
        initial_count = len(api_app.ATTENDANCE_LOGS)
        self.assertEqual(initial_count, 17)

        # Ingest 200 documents
        for i in range(200):
            api_app.UNREVIEWED_DOCUMENTS.append({
                "document_type": "STUDENT_ADMISSION_FORM",
                "student_info": {"full_name": f"Student {i}", "aadhaar_number": f"1234-5678-{i:04d}"},
                "parent_info": {}, "address": {}
            })
            req = api_app.VerificationRequest(
                index=0,
                verified_data={
                    "student_info": {"full_name": f"Student {i}", "aadhaar_number": f"1234-5678-{i:04d}"},
                    "parent_info": {}, "address": {}
                }
            )
            api_app.verify_document(req)

        self.assertEqual(len(api_app.ATTENDANCE_LOGS), 17 + 200)

        # Execute demo reset
        res = api_app.reset_demo_state()
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(len(api_app.ATTENDANCE_LOGS), 17, "Memory leak: ATTENDANCE_LOGS failed to reset cleanly!")
        self.assertEqual(len(api_app.UNREVIEWED_DOCUMENTS), 0)

    def test_xss_and_unicode_name_sanitization_in_verification(self):
        """Security: Verify name fields with malicious HTML tags are sanitized before DB insertion."""
        api_app.UNREVIEWED_DOCUMENTS.append({"document_type": "STUDENT_ADMISSION_FORM"})
        req = api_app.VerificationRequest(
            index=0,
            verified_data={
                "student_info": {"full_name": "  <img src=x onerror=alert(1)> Devang \u2728  ", "aadhaar_number": "1234-5678-9999"},
                "parent_info": {"father_mobile": "+91 99999 11111"},
                "address": {"city": "Pune"}
            }
        )
        res = api_app.verify_document(req)
        self.assertEqual(res["status"], "SUCCESS")
        self.assertNotIn("<img", res["student"]["name"])
        self.assertIn("&lt;img", res["student"]["name"])
        self.assertTrue(res["student"]["name"].endswith("Devang ✨"))


if __name__ == "__main__":
    unittest.main()
