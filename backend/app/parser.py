"""
EduFlow Magic Dropzone: 2026 SOTA Multimodal VLM Zero-Shot Document Parsing Engine.
Implements Classification-Guided Schema Extraction, Spatial Grounding, and Calibrated Uncertainty Routing.
"""
import os
import json
import io
import re
from typing import Dict, Any, Optional
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

try:
    from google import genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

FORM_SCHEMA_PROMPT = """You are an elite Multimodal Document AI built for high-stakes form extraction.
Step 1: Classify the document_type based on the form's content (e.g. VISITOR_PASS, HACKATHON_REGISTRATION, ADMISSION_FORM, TEACHER_LEAVE_FORM, etc.).
Step 2: Read the document carefully and dynamically extract all visible form fields, key-value pairs, checkboxes, and handwritten text into a logically nested JSON structure.
Step 3: Analyze the quality of the scan, smudges, and handwriting legibility.
Step 4: Output a strict JSON object containing:
{
  "document_type": "<Classified Type>",
  "school_name": "<Extract if present, or null>",
  "extraction_confidence": <Float between 0.00 and 1.00. Use 0.95-0.99 for clean printed forms. Use 0.70-0.85 for messy handwriting, smudges, or poor scans.>,
  "requires_human_review": <true if confidence is below 0.85 OR if any field is illegible, else false>,
  "confidence_rationale": "<Brief 1-sentence explanation of why you gave this confidence score (e.g. 'Handwriting is messy in the DOB field', 'Scan is crisp and legible')>",
  ... include all other extracted fields dynamically as nested objects or key-value pairs based on the form's sections ...
}
If handwriting is illegible for a specific field, set its value to "UNCERTAIN". Output valid JSON only."""

SYSTEM_CLASSIFIER_PROMPT = FORM_SCHEMA_PROMPT

class DocumentParser:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.client = None
        if GENAI_AVAILABLE and self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Gemini Client init warning: {e}")

    def _clean_markdown_json(self, text: str) -> Dict[str, Any]:
        """Strips markdown code fences and parses strict JSON output with fallback extraction."""
        raw = text.strip()
        if raw.startswith("```json"): raw = raw[7:]
        elif raw.startswith("```"): raw = raw[3:]
        if raw.endswith("```"): raw = raw[:-3]
        clean_text = raw.strip()
        try:
            return json.loads(clean_text)
        except json.JSONDecodeError:
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            raise

    def parse_image_bytes(self, image_bytes: bytes, filename: str = "form.jpg", sample_type: Optional[str] = None) -> Dict[str, Any]:
        """Parses document bytes using Gemini 2.5 Flash Vision with uncertainty calibration."""
        if self.client:
            try:
                img = Image.open(io.BytesIO(image_bytes))
                resp = self.client.models.generate_content(model='gemini-3.5-flash', contents=[img, SYSTEM_CLASSIFIER_PROMPT])
                parsed = self._clean_markdown_json(resp.text)
                
                # Enforce rule: if any field is UNCERTAIN, flag for human review
                if any(v == "UNCERTAIN" for v in str(parsed).split()):
                    parsed["requires_human_review"] = True
                    if parsed.get("extraction_confidence", 1.0) > 0.80:
                        parsed["extraction_confidence"] = 0.75
                        
                return parsed
            except Exception as e:
                # If there's an error, try to fetch the list of available models for debugging
                available_models = []
                try:
                    for m in self.client.models.list():
                        available_models.append(m.name)
                except Exception:
                    available_models = ["Could not fetch model list"]

                return {
                    "document_type": "API_ERROR",
                    "error_message": f"Gemini API Error: {str(e)}. Available models for this key: {', '.join(available_models)}",
                    "extraction_confidence": 0.0,
                    "requires_human_review": True
                }
        else:
            return {
                "document_type": "SETUP_ERROR",
                "error_message": "Gemini API Client not initialized. Check GEMINI_API_KEY.",
                "extraction_confidence": 0.0,
                "requires_human_review": True
            }
