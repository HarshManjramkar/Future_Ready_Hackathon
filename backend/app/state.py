"""
EduFlow Live Campus State Management & Memory Database.
Maintains persistent in-memory schedule, attendance logs, and unreviewed document queue.
"""
from copy import deepcopy
from typing import Dict, Any, List
from app.solver import TimetableSolver
from app.parser import DocumentParser
from app.mock_data import TEACHERS, ROOMS, COHORTS, SUBJECTS, STUDENTS

import json
import os

solver_engine = TimetableSolver(TEACHERS, ROOMS, COHORTS, SUBJECTS)
doc_parser = DocumentParser()

# In-memory reactive state
try:
    with open(os.path.join(os.path.dirname(__file__), "initial_schedule.json"), "r") as f:
        CURRENT_SCHEDULE: Dict[str, Any] = json.load(f)
except Exception:
    CURRENT_SCHEDULE: Dict[str, Any] = {}
ATTENDANCE_LOGS: List[Dict[str, Any]] = [deepcopy(s) for s in STUDENTS]
UNREVIEWED_DOCUMENTS: List[Dict[str, Any]] = []


def reset_memory_state() -> Dict[str, Any]:
    """Resets all live state in-place to baseline CBSE Grade 10 initial state."""
    global CURRENT_SCHEDULE, ATTENDANCE_LOGS, UNREVIEWED_DOCUMENTS
    fresh_schedule = solver_engine.generate_full_schedule()
    CURRENT_SCHEDULE.clear()
    CURRENT_SCHEDULE.update(fresh_schedule)
    
    ATTENDANCE_LOGS.clear()
    for s in STUDENTS:
        student_copy = deepcopy(s)
        student_copy["attendance_status"] = "ABSENT"
        student_copy["check_in_time"] = "--"
        ATTENDANCE_LOGS.append(student_copy)
        
    UNREVIEWED_DOCUMENTS.clear()
    return {"status": "SUCCESS", "message": "Demo state reset successfully."}
