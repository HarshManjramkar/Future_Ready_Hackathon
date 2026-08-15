"""
EduFlow Timetable Solver Test Suite (bmad-tea & Virat Innovation Suite).
Tests constraint satisfaction, substitution logic, workload limits, and performance.
"""
import unittest
import sys
import time
from pathlib import Path
from unittest.mock import MagicMock

# Shim dependencies if running without full venv
for mod in ["ortools", "ortools.sat", "ortools.sat.python", "ortools.sat.python.cp_model"]:
    if mod not in sys.modules:
        sys.modules[mod] = MagicMock()

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.solver import TimetableSolver
from app.mock_data import TEACHERS, ROOMS, COHORTS, SUBJECTS


class TestTimetableSolver(unittest.TestCase):
    """Deep test suite for Google OR-Tools CP-SAT Timetable Solver."""

    def setUp(self):
        self.solver = TimetableSolver(TEACHERS, ROOMS, COHORTS, SUBJECTS)

    def test_generate_full_schedule_structure(self):
        """Verify full 5-day, 8-period timetable satisfies structural invariants."""
        res = self.solver.generate_full_schedule()
        self.assertEqual(res["status"], "SUCCESS")
        schedule = res["schedule"]
        self.assertEqual(len(schedule), 40, "Schedule must have exactly 40 slots (5 days x 8 periods)")
        
        days_found = set(slot["day"] for slot in schedule)
        self.assertEqual(days_found, {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"})
        for slot in schedule:
            self.assertIn("period", slot)
            self.assertIn("teacher_id", slot)
            self.assertIn("subject_name", slot)
            self.assertIn("room_name", slot)

    def test_single_teacher_absence_math_specialist(self):
        """Verify teacher absence on Monday reassigns classes to qualified substitutes."""
        base_schedule = self.solver.generate_full_schedule()["schedule"]
        resolution = self.solver.resolve_teacher_absence("TCH_101", "Monday", base_schedule)
        
        self.assertEqual(resolution["absent_teacher_id"], "TCH_101")
        self.assertEqual(resolution["day"], "Monday")
        self.assertGreaterEqual(resolution["total_affected_periods"], 1)
        
        for res in resolution["resolutions"]:
            self.assertNotEqual(res["substitute_id"], "TCH_101")
            self.assertTrue(len(res["recommended_substitute"]) > 0)
            self.assertIn("Period", res["action"])

    def test_legacy_id_mapping(self):
        """Verify legacy short IDs (T101, T102, T103) resolve correctly to TCH_10x."""
        base_schedule = self.solver.generate_full_schedule()["schedule"]
        for legacy_id, expected_id in [("T101", "TCH_101"), ("T102", "TCH_102"), ("T103", "TCH_103")]:
            res = self.solver.resolve_teacher_absence(legacy_id, "Monday", base_schedule)
            self.assertEqual(res["absent_teacher_id"], expected_id)

    def test_all_days_absence(self):
        """Verify absence resolution across all 5 school days."""
        base_schedule = self.solver.generate_full_schedule()["schedule"]
        for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]:
            res = self.solver.resolve_teacher_absence("TCH_102", day, base_schedule)
            self.assertEqual(res["day"], day)
            self.assertIsInstance(res["resolutions"], list)

    def test_fallback_to_library_when_no_teacher_available(self):
        """Verify edge case: when all candidates are busy or capped, fallback to Library."""
        # Create a constrained schedule where all other teachers are marked busy
        mock_schedule = [
            {"period": 1, "day": "Monday", "teacher_id": "TCH_101", "teacher_name": "Mrs. Deepti Bisen",
             "subject_id": "SUB_102", "subject_name": "Mathematics", "cohort_name": "Grade 10-A"}
        ]
        for t in TEACHERS:
            if t["id"] != "TCH_101":
                mock_schedule.append({
                    "period": 1, "day": "Monday", "teacher_id": t["id"], "teacher_name": t["name"],
                    "subject_id": "SUB_101", "subject_name": "Class", "cohort_name": "Grade 9"
                })

        res = self.solver.resolve_teacher_absence("TCH_101", "Monday", mock_schedule)
        self.assertEqual(len(res["resolutions"]), 1)
        first_res = res["resolutions"][0]
        self.assertEqual(first_res["substitute_id"], "SUB-LIBRARY")
        self.assertIn("Library", first_res["recommended_substitute"])

    def test_heuristic_fallback(self):
        """Verify heuristic schedule generation produces complete valid grid."""
        res = self.solver._heuristic_fallback()
        self.assertEqual(res["status"], "HEURISTIC_SUCCESS")
        self.assertGreater(len(res["schedule"]), 0)

    def test_solver_performance_benchmark(self):
        """NFR Benchmark: 50 consecutive absence resolutions must execute in < 0.05s average."""
        base_schedule = self.solver.generate_full_schedule()["schedule"]
        start_time = time.time()
        iterations = 50
        for _ in range(iterations):
            self.solver.resolve_teacher_absence("TCH_101", "Monday", base_schedule)
        avg_time = (time.time() - start_time) / iterations
        self.assertLess(avg_time, 0.05, f"Solver too slow: {avg_time:.4f}s avg per solve")


if __name__ == "__main__":
    unittest.main()
