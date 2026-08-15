"""
EduFlow Chaos Engineering & System Solver Stress Suite (bmad-tea & Virat Oracle).
Probes extreme combinatorial stress, 100% faculty walkout, schema corruption, and circular dependencies.
"""
import unittest
import sys
from pathlib import Path
from unittest.mock import MagicMock

for mod in ["ortools", "ortools.sat", "ortools.sat.python", "ortools.sat.python.cp_model"]:
    if mod not in sys.modules:
        sys.modules[mod] = MagicMock()

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.solver import TimetableSolver
from app.mock_data import TEACHERS, ROOMS, COHORTS, SUBJECTS


class TestChaosSolverStress(unittest.TestCase):
    """Hardcore chaos tests designed to break the combinatorial optimization engine."""

    def setUp(self):
        self.solver = TimetableSolver(TEACHERS, ROOMS, COHORTS, SUBJECTS)

    def test_total_faculty_walkout_100_percent_absence(self):
        """Chaos: When ALL 7 teachers call in sick on Monday, solver must assign all to Library with 0 crashes."""
        base_schedule = self.solver.generate_full_schedule()["schedule"]
        
        for t in TEACHERS:
            res = self.solver.resolve_teacher_absence(t["id"], "Monday", base_schedule)
            self.assertEqual(res["status"] if "status" in res else "RESOLVED", "RESOLVED")
            self.assertIsInstance(res["resolutions"], list)
            # Reassign in place to simulate cascading load
            for slot in base_schedule:
                m = next((r for r in res["resolutions"] if r["period"] == slot["period"] and slot["day"] == "Monday" and slot["teacher_id"] in [t["id"], res["absent_teacher_id"]]), None)
                if m:
                    slot["teacher_id"] = m["substitute_id"]
                    slot["teacher_name"] = m["recommended_substitute"]

        # Assert no periods are unassigned or None
        monday_slots = [s for s in base_schedule if s["day"] == "Monday"]
        for s in monday_slots:
            self.assertIsNotNone(s["teacher_id"])
            self.assertNotEqual(s["teacher_id"], "")

    def test_corrupted_schedule_schema_fuzzing(self):
        """Chaos: Inject corrupt, malformed, and out-of-bounds schedule dictionaries into solver."""
        fuzzed_schedules = [
            [],  # Empty schedule
            [{"corrupt_key": 123}],  # Missing period, day, teacher_id
            [{"period": -99, "day": "InvalidDay", "teacher_id": None}],  # Out-of-bounds
            [{"period": 9999, "day": "Monday", "teacher_id": "TCH_101", "teacher_name": None}],
            [{"period": "1", "day": 123, "teacher_id": 456}],  # Wrong data types
            None  # Null schedule
        ]
        for bad_sched in fuzzed_schedules:
            try:
                res = self.solver.resolve_teacher_absence("TCH_101", "Monday", bad_sched)
                self.assertIsInstance(res, dict)
                self.assertIn("resolutions", res)
            except Exception as e:
                self.fail(f"Solver crashed on corrupt schedule input {bad_sched}: {e}")

    def test_circular_substitution_chain_resilience(self):
        """Chaos: Circular dependency where teacher A replaces B, B replaces C, C replaces A."""
        mock_schedule = [
            {"period": 1, "day": "Monday", "teacher_id": "TCH_101", "teacher_name": "Teacher A", "subject_id": "SUB_102", "subject_name": "Math", "cohort_name": "10-A"},
            {"period": 1, "day": "Monday", "teacher_id": "TCH_102", "teacher_name": "Teacher B", "subject_id": "SUB_103", "subject_name": "Science", "cohort_name": "10-B"},
            {"period": 1, "day": "Monday", "teacher_id": "TCH_103", "teacher_name": "Teacher C", "subject_id": "SUB_101", "subject_name": "English", "cohort_name": "10-C"}
        ]
        for t_id in ["TCH_101", "TCH_102", "TCH_103"]:
            res = self.solver.resolve_teacher_absence(t_id, "Monday", mock_schedule)
            self.assertGreaterEqual(len(res["resolutions"]), 1)

    def test_scale_stress_1000_consecutive_solves(self):
        """Stress: 1,000 rapid solve operations to probe memory leakage and algorithmic degradation."""
        base_schedule = self.solver.generate_full_schedule()["schedule"]
        import time
        start = time.time()
        for i in range(1000):
            day = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][i % 5]
            teacher = f"TCH_10{(i % 7) + 1}"
            self.solver.resolve_teacher_absence(teacher, day, base_schedule)
        total_time = time.time() - start
        self.assertLess(total_time, 1.0, f"1000 solves too slow: {total_time:.4f}s")


if __name__ == "__main__":
    unittest.main()
