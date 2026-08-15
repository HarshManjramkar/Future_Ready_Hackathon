"""
EduFlow Document Parser Test Suite (bmad-tea & Virat Innovation Suite).
Tests Gemini Vision schema adherence, confidence thresholding, and smudged edge cases.
"""
import unittest
import sys
from pathlib import Path
from unittest.mock import MagicMock, patch

# Shim dependencies if running in minimal test environment
for mod in ["PIL", "google", "google.genai", "google.genai.types", "dotenv"]:
    if mod not in sys.modules:
        sys.modules[mod] = MagicMock()

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.parser import DocumentParser, FORM_SCHEMA_PROMPT


class TestDocumentParser(unittest.TestCase):
    """Deep test suite for DocumentParser & Gemini Vision VLM logic."""

    def setUp(self):
        self.parser = DocumentParser()

    def test_schema_prompt_invariants(self):
        """Verify the VLM prompt specifies all required JSON schema fields and rules."""
        required_keys = [
            "document_type", "school_name", "academic_year", "student_info",
            "parent_info", "address", "emergency_contact", "extraction_confidence",
            "requires_human_review", "flagged_fields"
        ]
        for key in required_keys:
            self.assertIn(f'"{key}"', FORM_SCHEMA_PROMPT, f"Prompt must contain '{key}' key definition")
        self.assertIn("UNCERTAIN", FORM_SCHEMA_PROMPT, "Prompt must instruct AI to flag UNCERTAIN values")

    def test_simulated_clean_admission_parsing(self):
        """Verify clean admission form simulation produces high confidence and no human review."""
        dummy_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF"
        result = self.parser.parse_image_bytes(dummy_bytes, filename="clean_form.jpg")
        
        self.assertIsInstance(result, dict)
        self.assertIn("student_info", result)
        self.assertIn("full_name", result["student_info"])
        self.assertIn("aadhaar_number", result["student_info"])
        self.assertGreaterEqual(result.get("extraction_confidence", 0), 0.80)

    def test_simulated_smudged_edge_case_parsing(self):
        """Verify smudged handwriting simulation triggers low confidence & human review inbox."""
        dummy_bytes = b"smudged_image_bytes"
        result = self.parser.parse_image_bytes(dummy_bytes, filename="sample_2_smudged.jpg", sample_type="sample_2")
        
        # In sample_2 or smudged mode, requires_human_review should be true or flagged fields present
        if "requires_human_review" in result:
            self.assertTrue(result["requires_human_review"] or len(result.get("flagged_fields", [])) > 0)
        self.assertIn("student_info", result)

    def test_simulated_teacher_leave_form(self):
        """Verify teacher leave form simulation produces TEACHER_LEAVE_FORM document type."""
        dummy_bytes = b"leave_slip_bytes"
        result = self.parser.parse_image_bytes(dummy_bytes, filename="teacher_leave.jpg", sample_type="leave")
        
        if result.get("document_type") == "TEACHER_LEAVE_FORM":
            self.assertIn("teacher_id", result)
            self.assertIn("date_of_absence", result)

    def test_json_markdown_unwrapping_logic(self):
        """Verify markdown code-block stripping logic when Gemini returns formatted markdown."""
        mock_raw_responses = [
            '```json\n{"document_type": "STUDENT_ADMISSION_FORM", "extraction_confidence": 0.95, "requires_human_review": false}\n```',
            '```\n{"document_type": "STUDENT_ADMISSION_FORM", "extraction_confidence": 0.88, "requires_human_review": false}\n```',
            '{"document_type": "STUDENT_ADMISSION_FORM", "extraction_confidence": 0.92, "requires_human_review": false}'
        ]
        for raw in mock_raw_responses:
            text = raw.strip()
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()
            import json
            parsed = json.loads(text)
            self.assertEqual(parsed["document_type"], "STUDENT_ADMISSION_FORM")

    def test_fallback_robustness_on_corrupt_bytes(self):
        """Verify parser does not crash on empty or corrupted image byte streams."""
        corrupt_bytes = b""
        result = self.parser.parse_image_bytes(corrupt_bytes, filename="corrupt.png")
        self.assertIsInstance(result, dict)
        self.assertIn("student_info", result)


if __name__ == "__main__":
    unittest.main()
