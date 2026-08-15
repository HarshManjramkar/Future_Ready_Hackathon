"""
EduFlow API Integration & State Mutation Test Suite (bmad-tea & Virat Innovation Suite).
Tests FastAPI endpoints, live campus memory database, and cross-module automation.
"""
import unittest
import sys
from pathlib import Path
from unittest.mock import MagicMock

# Transparent passthrough decorator for FastAPI mocks
def mock_decorator(*args, **kwargs):
    def decorator(fn):
        return fn
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

# Reload app.main to bind clean decorated functions
if "app.main" in sys.modules:
    del sys.modules["app.main"]

import app.main as api_app


class TestAPIIntegration(unittest.TestCase):
    """Deep integration tests for EduFlow REST API endpoints and state lifecycle."""

    def setUp(self):
        # Reset state before each test
        api_app.reset_demo_state()

    def test_root_endpoint(self):
        """Verify API root endpoint returns system status and feature list."""
        res = api_app.read_root()
        self.assertEqual(res["status"], "ONLINE")
        self.assertIn("OR-Tools Timetabling", res["features"])
        self.assertIn("Smart Kiosk Attendance", res["features"])

    def test_dashboard_stats_calculation(self):
        """Verify live calculation of KPI metrics from memory database."""
        stats = api_app.get_dashboard_stats()
        self.assertIn("total_enrollment", stats)
        self.assertIn("attendance_percentage", stats)
        self.assertIn("kiosk_students_count", stats)
        self.assertGreater(stats["total_enrollment"], 0)
        self.assertIsInstance(stats["attendance_percentage"], float)

    def test_full_timetable_endpoint(self):
        """Verify /api/timetable/generate returns 40 period schedule."""
        res = api_app.get_full_timetable()
        self.assertIn(res.get("status"), ["SUCCESS", "HEURISTIC_SUCCESS"])
        self.assertEqual(len(res["schedule"]), 40)

    def test_resolve_disruption_state_mutation(self):
        """Verify POST /api/timetable/disruption mutates CURRENT_SCHEDULE in memory."""
        req = api_app.DisruptionRequest(teacher_id="TCH_101", day="Monday")
        res = api_app.resolve_disruption(req)
        
        self.assertEqual(res["status"], "SUCCESS")
        self.assertGreaterEqual(len(res["resolutions"]), 1)
        
        # Verify slot in memory now has is_reassigned flag
        schedule = api_app.CURRENT_SCHEDULE["schedule"]
        reassigned = [s for s in schedule if s.get("is_reassigned") is True and s["day"] == "Monday"]
        self.assertGreaterEqual(len(reassigned), 1)

    def test_mass_absence_simulation(self):
        """Verify POST /api/demo/mass-absence handles multiple teacher absences on Monday."""
        res = api_app.simulate_mass_absence()
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["day"], "Monday")
        self.assertGreaterEqual(res["total_affected_periods"], 3)

    def test_document_verification_lifecycle(self):
        """Verify Human Review Inbox verification lifecycle and student creation."""
        # Inject dummy unreviewed document
        api_app.UNREVIEWED_DOCUMENTS.clear()
        api_app.UNREVIEWED_DOCUMENTS.append({
            "document_type": "STUDENT_ADMISSION_FORM",
            "student_info": {"full_name": "Aarav Sharma", "aadhaar_number": "1234-5678-9999", "class_applying_for": "Grade 10-A"},
            "parent_info": {"father_mobile": "+91 9876543210"},
            "address": {"city": "Pune"}
        })
        
        self.assertEqual(len(api_app.get_unreviewed_documents()["documents"]), 1)
        
        # Verify valid index commit
        req = api_app.VerificationRequest(
            index=0,
            student_info={"full_name": "Aarav Sharma", "aadhaar_number": "1234-5678-9999", "class_applying_for": "Grade 10-A"},
            parent_info={"father_mobile": "+91 9876543210"},
            address={"city": "Pune"}
        )
        res = api_app.verify_document(req)
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(len(api_app.UNREVIEWED_DOCUMENTS), 0)
        self.assertTrue(any(s["name"] == "Aarav Sharma" for s in api_app.ATTENDANCE_LOGS))

    def test_verify_document_invalid_index_rejection(self):
        """Verify verification with out-of-bounds index raises 400."""
        req = api_app.VerificationRequest(index=99, student_info={}, parent_info={}, address={})
        with self.assertRaises(Exception):
            api_app.verify_document(req)


if __name__ == "__main__":
    unittest.main()
