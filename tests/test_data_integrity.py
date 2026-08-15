"""
EduFlow Data Integrity & CBSE Seed Model Test Suite (bmad-tea & Virat Innovation Suite).
Validates schema consistency, invariant properties, and constraint boundaries of seed data.
"""
import unittest
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.mock_data import TEACHERS, ROOMS, COHORTS, SUBJECTS, STUDENTS


class TestDataIntegrity(unittest.TestCase):
    """Deep data integrity checks for curriculum, staff rosters, and student records."""

    def test_teachers_data_integrity(self):
        """Verify teacher records have unique IDs, qualifications, and valid workload caps."""
        self.assertEqual(len(TEACHERS), 7)
        teacher_ids = set()
        for t in TEACHERS:
            self.assertNotIn(t["id"], teacher_ids, f"Duplicate teacher ID: {t['id']}")
            teacher_ids.add(t["id"])
            self.assertTrue(len(t["name"]) > 0)
            self.assertIn("subjects", t)
            self.assertIsInstance(t["subjects"], list)
            self.assertGreaterEqual(t.get("max_daily_periods", 0), 1)
            self.assertIn("substitute_capable_subjects", t)

    def test_rooms_data_integrity(self):
        """Verify room definitions satisfy physical capacity and unique identifier rules."""
        self.assertEqual(len(ROOMS), 4)
        room_ids = set()
        for r in ROOMS:
            self.assertNotIn(r["id"], room_ids, f"Duplicate room ID: {r['id']}")
            room_ids.add(r["id"])
            self.assertTrue(len(r["name"]) > 0)
            self.assertGreaterEqual(r["capacity"], 30)

    def test_subjects_curriculum_coverage(self):
        """Verify complete CBSE Class 10 subject coverage (7 core subjects)."""
        self.assertEqual(len(SUBJECTS), 7)
        subject_names = [s["name"] for s in SUBJECTS]
        for keyword in ["English", "Mathematics", "Science", "Social Science", "Physical Education"]:
            self.assertTrue(any(keyword in name for name in subject_names), f"Missing subject containing '{keyword}'")

    def test_students_roster_integrity(self):
        """Verify 17 student records contain valid initial status and unique identifiers."""
        self.assertEqual(len(STUDENTS), 17)
        student_ids = set()
        for s in STUDENTS:
            self.assertNotIn(s["id"], student_ids, f"Duplicate student ID: {s['id']}")
            student_ids.add(s["id"])
            self.assertIn(s["attendance_status"], ["PRESENT", "ABSENT"])
            self.assertTrue(len(s["name"]) > 0)
            self.assertIn("grade", s)
            self.assertIn("qr_code", s)


if __name__ == "__main__":
    unittest.main()
