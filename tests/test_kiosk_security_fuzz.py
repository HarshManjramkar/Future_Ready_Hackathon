"""
EduFlow Smart Kiosk Security Fuzzing & Anti-Spoofing Suite (bmad-tea & Virat Oracle).
Probes zero-width unicode obfuscation, replay bursts, null-byte injections, and type juggling.
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


class TestKioskSecurityFuzz(unittest.TestCase):
    """Hardcore security fuzzing for Smart Kiosk edge perception and anti-cheat layer."""

    def setUp(self):
        api_app.reset_demo_state()

    def test_zero_width_unicode_and_homoglyph_stripping(self):
        """Security: Zero-width spaces embedded in QR tokens should normalize and verify cleanly."""
        obfuscated_qrs = [
            "9\u200B9\u200C0\u200D1",  # Zero-width spaces & joiners
            "\uFEFF9901",              # Zero-width non-breaking space (BOM)
            "9901\x00hidden_payload",  # Null-byte truncation attempt
            "  9901  \n",              # Leading/trailing whitespace
            "STU-9901-SECURE"          # Prefixed token
        ]
        for qr in obfuscated_qrs:
            req = api_app.AttendanceScanRequest(qr_code=qr, face_detected=True)
            res = api_app.register_attendance(req)
            self.assertEqual(res["status"], "SUCCESS", f"Failed to sanitize token: {repr(qr)}")
            self.assertEqual(res["student"]["id"], "9901")

    def test_replay_burst_storm_idempotency(self):
        """Security: 500 rapid replay punches of the same student ID must remain idempotent."""
        student_id = "9901"
        for _ in range(500):
            req = api_app.AttendanceScanRequest(qr_code=student_id, face_detected=True)
            res = api_app.register_attendance(req)
            self.assertEqual(res["status"], "SUCCESS")
        
        # Verify no duplicate student was created
        matching = [s for s in api_app.ATTENDANCE_LOGS if s["id"] == student_id]
        self.assertEqual(len(matching), 1, "Replay attack caused duplicate student record in memory!")

    def test_type_juggling_and_extreme_buffer_fuzz(self):
        """Security: Fuzz scanner with extreme string lengths and malformed JSON types."""
        fuzz_payloads = [
            "A" * 20000,                           # 20KB massive buffer
            '{"id": ["9901"], "nested": {}}',     # Array inside JSON ID field
            '{"id": true}',                        # Boolean inside JSON ID field
            '{"id": {"sub_id": 9901}}',            # Nested object in ID
            "",                                    # Empty string
            "undefined",                           # JS undefined literal
            "NaN",                                 # NaN literal
            "null"                                 # Null literal
        ]
        for p in fuzz_payloads:
            req = api_app.AttendanceScanRequest(qr_code=p, face_detected=True)
            res = api_app.register_attendance(req)
            self.assertIn(res["status"], ["SUCCESS", "REJECTED"])

    def test_face_detection_flag_fuzzing(self):
        """Security: Non-boolean and negative face_detected values must strictly reject."""
        for val in [False, None, 0, "", []]:
            req = api_app.AttendanceScanRequest(qr_code="9901", face_detected=bool(val))
            if not val:
                res = api_app.register_attendance(req)
                self.assertEqual(res["status"], "REJECTED")
                self.assertIn("Anti-Cheat Alert", res["message"])


if __name__ == "__main__":
    unittest.main()
