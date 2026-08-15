"""
EduFlow Smart Kiosk Anti-Cheat Test Suite (bmad-tea & Virat Innovation Suite).
Tests Dual Coincidence verification, buddy-punching prevention, and token normalization.
"""
import unittest
import sys
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


class TestKioskAntiCheat(unittest.TestCase):
    """Deep security and anti-proxy verification tests for Smart Kiosk."""

    def setUp(self):
        api_app.reset_demo_state()

    def test_buddy_punching_blocked_when_no_face_detected(self):
        """Security Core: Card scanned with face_detected=False MUST be rejected."""
        req = api_app.AttendanceScanRequest(qr_code="9901", face_detected=False)
        res = api_app.register_attendance(req)
        
        self.assertEqual(res["status"], "REJECTED")
        self.assertFalse(res["green_flash"])
        self.assertIn("Anti-Cheat Alert", res["message"])
        
        # Verify student remains ABSENT
        student = next(s for s in api_app.ATTENDANCE_LOGS if s["id"] == "9901")
        self.assertEqual(student["attendance_status"], "ABSENT")

    def test_valid_attendance_with_face_and_raw_id(self):
        """Verify successful attendance when both face and raw ID are valid."""
        req = api_app.AttendanceScanRequest(qr_code="9901", face_detected=True)
        res = api_app.register_attendance(req)
        
        self.assertEqual(res["status"], "SUCCESS")
        self.assertTrue(res["green_flash"])
        self.assertEqual(res["student"]["attendance_status"], "PRESENT")
        self.assertNotEqual(res["student"]["check_in_time"], "--")

    def test_prefixed_qr_token_normalization(self):
        """Verify tokens with 'STU-' prefix normalize and match student ID."""
        req = api_app.AttendanceScanRequest(qr_code="STU-9902", face_detected=True)
        res = api_app.register_attendance(req)
        
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["student"]["id"], "9902")
        self.assertEqual(res["student"]["attendance_status"], "PRESENT")

    def test_json_payload_qr_token_normalization(self):
        """Verify JSON-formatted QR tokens like {'id': '9903'} extract correctly."""
        req = api_app.AttendanceScanRequest(qr_code='{"id": "9903", "grade": "10-A"}', face_detected=True)
        res = api_app.register_attendance(req)
        
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["student"]["id"], "9903")

    def test_unregistered_qr_rejection(self):
        """Verify unknown or invalid QR tokens are rejected with security alert."""
        req = api_app.AttendanceScanRequest(qr_code="UNREGISTERED_9999", face_detected=True)
        res = api_app.register_attendance(req)
        
        self.assertEqual(res["status"], "REJECTED")
        self.assertFalse(res["green_flash"])
        self.assertIn("unregistered or invalid", res["message"])

    def test_student_roster_endpoint(self):
        """Verify /api/students returns full list of attendance logs."""
        res = api_app.get_students()
        self.assertIn("students", res)
        self.assertEqual(len(res["students"]), len(api_app.ATTENDANCE_LOGS))


if __name__ == "__main__":
    unittest.main()
