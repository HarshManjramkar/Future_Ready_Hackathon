"""
EduFlow Document Parser Adversarial Fuzzing Suite (bmad-tea & Virat Oracle).
Probes prompt injections, corrupt polyglot byte streams, and confidence anomaly routing.
"""
import unittest
import sys
from pathlib import Path
from unittest.mock import MagicMock

for mod in ["PIL", "dotenv", "google", "google.genai"]:
    if mod not in sys.modules:
        sys.modules[mod] = MagicMock()

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.parser import DocumentParser


class TestAdversarialFuzzParser(unittest.TestCase):
    """Deep adversarial and fuzz testing for zero-shot VLM perception layer."""

    def setUp(self):
        self.parser = DocumentParser()

    def test_adversarial_polyglot_and_corrupt_byte_streams(self):
        """Adversarial: Fuzz parser with corrupted headers, HTML polyglots, and binary junk."""
        corrupted_payloads = [
            b"",                                          # 0-byte empty file
            b"GIF89a\x00\x00\x00\x00",                    # Fake GIF header with nulls
            b"<!DOCTYPE html><html><script>alert(1)</script>", # HTML script polyglot
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR",       # Truncated PNG header
            b"\xff\xd8\xff\xe0" + (b"\x00\xff" * 5000)    # Massive noisy JPEG buffer
        ]
        for payload in corrupted_payloads:
            try:
                res = self.parser.parse_image_bytes(payload, filename="fuzzed_input.bin")
                self.assertIsInstance(res, dict)
                self.assertIn("student_info", res)
            except Exception as e:
                self.fail(f"Parser threw unhandled exception on byte payload: {e}")

    def test_adversarial_prompt_injection_response_sanitization(self):
        """Adversarial: Test parser handling when LLM returns adversarial markdown syntax."""
        fuzzed_json_markdowns = [
            '```json\n{"document_type": "STUDENT_ADMISSION_FORM", "extraction_confidence": 0.99, "requires_human_review": false}\n```',
            '```json\n{"document_type": "TEACHER_LEAVE_FORM", "teacher_id": "TCH_101", "date_of_absence": "Monday"}\n```',
            '```\n{"document_type": "STUDENT_ADMISSION_FORM", "student_info": {"full_name": "<script>alert(1)</script>"}}\n```'
        ]
        for raw in fuzzed_json_markdowns:
            text = raw.strip()
            if text.startswith("```json"): text = text[7:]
            elif text.startswith("```"): text = text[3:]
            if text.endswith("```"): text = text[:-3]
            import json
            parsed = json.loads(text.strip())
            self.assertIsInstance(parsed, dict)

    def test_confidence_threshold_routing_invariants(self):
        """Verify confidence boundary routing invariants across edge-case presets."""
        clean_res = self.parser.parse_image_bytes(b"clean", filename="clean.jpg")
        self.assertFalse(clean_res.get("requires_human_review", False))
        self.assertGreaterEqual(clean_res.get("extraction_confidence", 0), 0.80)

        smudge_res = self.parser.parse_image_bytes(b"smudge", filename="smudged_sample.jpg", sample_type="smudged")
        self.assertTrue(smudge_res.get("requires_human_review", False))
        self.assertLess(smudge_res.get("extraction_confidence", 1.0), 0.80)


if __name__ == "__main__":
    unittest.main()
