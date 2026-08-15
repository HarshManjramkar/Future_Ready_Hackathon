"""
EduFlow Enterprise Test Harness & Fixture Factory (bmad-testarch-framework).
Provides reusable test state factories, fixture generators, and isolated mock environments.
"""
from typing import Dict, Any, List


def create_mock_teacher(
    teacher_id: str = "TCH_999",
    name: str = "Dr. Test Educator",
    subjects: List[str] = None,
    max_periods: int = 5
) -> Dict[str, Any]:
    """Generates an isolated mock teacher object."""
    return {
        "id": teacher_id,
        "name": name,
        "primary_subject_id": "SUB_102",
        "subjects": subjects or ["SUB_102", "Mathematics"],
        "max_daily_periods": max_periods,
        "substitute_capable_subjects": subjects or ["SUB_102", "Mathematics", "Science"]
    }


def create_mock_student(
    student_id: str = "9999",
    name: str = "Test Student",
    grade: str = "Grade 10-A",
    status: str = "ABSENT"
) -> Dict[str, Any]:
    """Generates an isolated mock student record."""
    return {
        "id": student_id,
        "name": name,
        "grade": grade,
        "roll_no": student_id,
        "qr_code": student_id,
        "guardian_phone": "+91 9999988888",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "attendance_status": status,
        "check_in_time": "--"
    }


def create_mock_admission_payload(
    name: str = "Pooja Deshmukh",
    aadhaar: str = "1234-5678-9905",
    confidence: float = 0.95
) -> Dict[str, Any]:
    """Generates a standard VLM extraction payload."""
    return {
        "document_type": "STUDENT_ADMISSION_FORM",
        "school_name": "Delhi Public School",
        "academic_year": "2026-2027",
        "student_info": {
            "full_name": name,
            "dob": "15/08/2010",
            "gender": "Female",
            "blood_group": "B+",
            "nationality": "Indian",
            "class_applying_for": "Grade 10-A",
            "previous_school": "Modern High School",
            "aadhaar_number": aadhaar
        },
        "parent_info": {
            "father_name": "Suresh Deshmukh",
            "father_occupation": "Engineer",
            "father_mobile": "+91 9822012345",
            "mother_name": "Sunita Deshmukh",
            "mother_occupation": "Professor",
            "mother_mobile": "+91 9822012346",
            "email": "deshmukh.family@example.com"
        },
        "address": {
            "street": "Flat 402, Green Valley",
            "city": "Pune",
            "state": "Maharashtra",
            "pin_code": "411048"
        },
        "emergency_contact": {
            "person": "Suresh Deshmukh",
            "relationship": "Father",
            "phone": "+91 9822012345"
        },
        "documents_submitted": ["Birth Certificate", "Aadhaar Card", "Transfer Certificate"],
        "extraction_confidence": confidence,
        "requires_human_review": confidence < 0.80,
        "flagged_fields": [] if confidence >= 0.80 else ["aadhaar_number", "dob"]
    }
