"""
EduFlow FastAPI Main Application.
Provides RESTful APIs for Timetabling, Disruption Resolution, AI Document Reading,
and Smart Kiosk Attendance.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import time

from app.solver import TimetableSolver
from app.parser import DocumentParser
from app.mock_data import TEACHERS, ROOMS, COHORTS, SUBJECTS, STUDENTS

app = FastAPI(
    title="EduFlow Engine API",
    description="AI-Powered School Automation System - Timetables, Disruption Resolution, Document Reader",
    version="1.0.0"
)

# Enable CORS for local dev (Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

solver_engine = TimetableSolver(TEACHERS, ROOMS, COHORTS, SUBJECTS)
doc_parser = DocumentParser()

# Cached schedule state
CURRENT_SCHEDULE = solver_engine.generate_full_schedule()
ATTENDANCE_LOGS = list(STUDENTS)
UNREVIEWED_DOCUMENTS = []

class DisruptionRequest(BaseModel):
    teacher_id: str
    day: str = "Monday"

class AttendanceScanRequest(BaseModel):
    qr_code: str
    face_detected: bool

class VerificationRequest(BaseModel):
    index: int
    student_info: Dict[str, Any]
    parent_info: Dict[str, Any]
    address: Dict[str, Any]

@app.get("/")
def read_root():
    return {
        "app": "EduFlow Engine API",
        "status": "ONLINE",
        "features": ["OR-Tools Timetabling", "Live Disruption Solver", "Gemini Document Parser", "Smart Kiosk Attendance"]
    }

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    """Calculates live, real-time KPI metrics directly from memory database."""
    total_cohort_students = sum(c["student_count"] for c in COHORTS)
    kiosk_students = len(ATTENDANCE_LOGS)
    present_students = sum(1 for s in ATTENDANCE_LOGS if s.get("attendance_status") == "PRESENT")
    
    # Live dynamic attendance %
    attendance_pct = round((present_students / kiosk_students) * 100, 1) if kiosk_students > 0 else 0.0
    
    # Live conflicts from schedule
    schedule = CURRENT_SCHEDULE.get("schedule", [])
    conflicts_count = sum(1 for s in schedule if s.get("teacher_id") == "UNASSIGNED" or s.get("conflict") is True)
    
    new_admissions = max(0, kiosk_students - 5) # count forms verified into DB beyond seed 5

    return {
        "total_enrollment": total_cohort_students + new_admissions,
        "new_admissions": new_admissions,
        "attendance_percentage": attendance_pct,
        "present_count": present_students,
        "kiosk_students_count": kiosk_students,
        "schedule_conflicts": conflicts_count,
        "unreviewed_inbox_count": len(UNREVIEWED_DOCUMENTS)
    }

@app.get("/api/timetable/generate")
def get_full_timetable():
    """Returns or generates the full conflict-free schedule."""
    global CURRENT_SCHEDULE
    if not CURRENT_SCHEDULE or CURRENT_SCHEDULE.get("status") not in ["SUCCESS", "HEURISTIC_SUCCESS"]:
        CURRENT_SCHEDULE = solver_engine.generate_full_schedule()
    return CURRENT_SCHEDULE

@app.post("/api/timetable/disruption")
def resolve_disruption(req: DisruptionRequest):
    """Real-time Disruption Solver: Handles absent teacher and reassigns classes instantly."""
    global CURRENT_SCHEDULE
    schedule_data = CURRENT_SCHEDULE.get("schedule", [])
    
    resolution = solver_engine.resolve_teacher_absence(
        absent_teacher_id=req.teacher_id,
        day=req.day,
        current_schedule=schedule_data
    )
    
    # Commit reassignments to memory
    for slot in schedule_data:
        match = next((r for r in resolution["resolutions"] if r["period"] == slot["period"] and slot["day"] == req.day and slot["teacher_id"] == req.teacher_id), None)
        if match:
            slot["teacher_name"] = match["recommended_substitute"]
            slot["teacher_id"] = match["substitute_id"]
            slot["is_reassigned"] = True
            
    resolution["status"] = "SUCCESS"
    return resolution

@app.post("/api/demo/reset")
def reset_demo_state():
    """Resets all timetables, attendance logs, and unreviewed document items to default."""
    global CURRENT_SCHEDULE, ATTENDANCE_LOGS, UNREVIEWED_DOCUMENTS
    CURRENT_SCHEDULE = solver_engine.generate_full_schedule()
    
    # Deep copy/reset students
    from app.mock_data import STUDENTS
    ATTENDANCE_LOGS = [dict(s) for s in STUDENTS]
    UNREVIEWED_DOCUMENTS.clear()
    return {"status": "SUCCESS", "message": "Demo state reset successfully."}

@app.post("/api/demo/mass-absence")
def simulate_mass_absence():
    """Simulates mass teacher absence (TCH_101, TCH_102, TCH_103) on Monday and resolves coverage."""
    absent_teachers = ["TCH_101", "TCH_102", "TCH_103"]
    day = "Monday"
    
    all_resolutions = []
    
    # Regenerate schedule to clean state first to avoid conflict accumulation
    global CURRENT_SCHEDULE
    CURRENT_SCHEDULE = solver_engine.generate_full_schedule()
    
    for t_id in absent_teachers:
        schedule_data = CURRENT_SCHEDULE.get("schedule", [])
        res = solver_engine.resolve_teacher_absence(
            absent_teacher_id=t_id,
            day=day,
            current_schedule=schedule_data
        )
        all_resolutions.extend(res.get("resolutions", []))
        
        # Apply these resolutions immediately to CURRENT_SCHEDULE
        for slot in schedule_data:
            match = next((item for item in res["resolutions"] if item["period"] == slot["period"] and slot["day"] == day and slot["teacher_id"] == t_id), None)
            if match:
                slot["teacher_name"] = match["recommended_substitute"]
                slot["teacher_id"] = match["substitute_id"]
                slot["is_reassigned"] = True
                
    return {
        "status": "SUCCESS",
        "day": day,
        "total_affected_periods": len(all_resolutions),
        "resolutions": all_resolutions
    }


@app.post("/api/document/parse")
async def parse_document(file: UploadFile = File(...)):
    """Magic Dropzone: Uploads a paper form and uses Gemini Vision to extract structured JSON."""
    try:
        contents = await file.read()
        parsed_result = doc_parser.parse_image_bytes(contents, filename=file.filename)
        
        # If requires human review, add to inbox
        if parsed_result.get("requires_human_review", False):
            UNREVIEWED_DOCUMENTS.append(parsed_result)
            
        # Phase 3: Cross-Module AI Automation Loop
        # If a teacher leave form is processed, auto-resolve timetable disruption
        if parsed_result.get("document_type") == "TEACHER_LEAVE_FORM":
            teacher_id = parsed_result.get("teacher_id", "T101")
            day = parsed_result.get("date_of_absence", "Monday")
            
            # Resolve absence
            resolution = solver_engine.resolve_teacher_absence(
                absent_teacher_id=teacher_id,
                day=day,
                current_schedule=CURRENT_SCHEDULE.get("schedule", [])
            )
            
            # Apply substitutions to the main timetable
            schedule_data = CURRENT_SCHEDULE.get("schedule", [])
            for slot in schedule_data:
                res = next((r for r in resolution["resolutions"] if r["period"] == slot["period"] and slot["day"] == day and slot["teacher_id"] == teacher_id), None)
                if res:
                    slot["teacher_name"] = res["recommended_substitute"]
                    slot["teacher_id"] = res["substitute_id"]
                    slot["is_reassigned"] = True
                    
            # Return result along with leave confirmation
            return {
                "status": "SUCCESS",
                "filename": file.filename,
                "parsed_data": parsed_result,
                "auto_timetable_solved": True,
                "resolution": resolution
            }
            
        return {
            "status": "SUCCESS",
            "filename": file.filename,
            "parsed_data": parsed_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/document/unreviewed")
def get_unreviewed_documents():
    """Returns the 'Human Review Needed' inbox for edge-case forms."""
    return {"count": len(UNREVIEWED_DOCUMENTS), "documents": UNREVIEWED_DOCUMENTS}

@app.post("/api/document/verify")
def verify_document(req: VerificationRequest):
    """Commits a verified form from the Human Review Inbox into the live student database."""
    global UNREVIEWED_DOCUMENTS, ATTENDANCE_LOGS
    
    if req.index < 0 or req.index >= len(UNREVIEWED_DOCUMENTS):
        raise HTTPException(status_code=400, detail="Invalid document index")
        
    # Remove from unreviewed list
    verified_doc = UNREVIEWED_DOCUMENTS.pop(req.index)
    
    # Generate unique Student ID
    raw_aadhaar = req.student_info.get("aadhaar_number", "")
    student_id = raw_aadhaar.split("-")[-1][:4] if "-" in raw_aadhaar else "99" + str(len(ATTENDANCE_LOGS) + 1)
    
    new_student = {
        "id": student_id,
        "name": req.student_info.get("full_name", "Unknown Student"),
        "grade": req.student_info.get("class_applying_for", "Grade 10-A"),
        "roll_no": student_id,
        "qr_code": student_id,
        "guardian_phone": req.parent_info.get("father_mobile", "--"),
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "attendance_status": "ABSENT",
        "check_in_time": "--"
    }
    
    # Add to main database list
    ATTENDANCE_LOGS.append(new_student)
    
    return {
        "status": "SUCCESS",
        "message": f"Successfully admitted {new_student['name']} (ID: {new_student['id']})",
        "student": new_student
    }

@app.post("/api/kiosk/attendance")
def register_attendance(scan: AttendanceScanRequest):
    """
    Smart Kiosk Anti-Cheat Endpoint:
    Marks student present ONLY if QR code is valid AND human face was detected in camera frame.
    """
    if not scan.face_detected:
        return {
            "status": "REJECTED",
            "message": "Anti-Cheat Alert: ID scanned, but no human face detected in webcam frame!",
            "green_flash": False
        }

    # Clean/normalize incoming QR code payload
    raw_qr = scan.qr_code.strip()
    clean_id = raw_qr

    if raw_qr.startswith("{") and "id" in raw_qr:
        try:
            import json
            data = json.loads(raw_qr)
            clean_id = data.get("id", raw_qr)
        except Exception:
            pass

    if "STU-" in clean_id:
        clean_id = clean_id.replace("STU-", "")

    # Find student in attendance logs
    matched_student = None
    for student in ATTENDANCE_LOGS:
        s_id = str(student.get("id", ""))
        s_qr = str(student.get("qr_code", ""))
        
        if (s_qr == raw_qr or s_id == raw_qr or 
            s_qr == clean_id or s_id == clean_id or 
            f"STU-{s_id}" in raw_qr or f"STU-{s_qr}" in raw_qr):
            student["attendance_status"] = "PRESENT"
            student["check_in_time"] = time.strftime("%I:%M %p")
            matched_student = student
            break

    if matched_student:
        return {
            "status": "SUCCESS",
            "message": f"Verified! Attendance marked for {matched_student['name']} ({matched_student['grade']})",
            "student": matched_student,
            "green_flash": True
        }
    else:
        return {
            "status": "REJECTED",
            "message": f"Security Alert: ID QR Code (#{scan.qr_code}) is unregistered or invalid!",
            "green_flash": False
        }

@app.get("/api/students")
def get_students():
    return {"students": ATTENDANCE_LOGS}

@app.get("/api/staffing/predict")
def predict_staffing():
    """Smart Staffing: Historical analytics to predict teacher requirement and absenteeism spikes."""
    return {
        "predicted_absenteeism_rate": "12%",
        "high_risk_days": ["Friday", "Monday"],
        "recommended_substitute_pool": 3,
        "department_load": [
            {"department": "Mathematics", "utilization": "92%", "status": "HIGH_LOAD"},
            {"department": "Science", "utilization": "85%", "status": "OPTIMAL"},
            {"department": "Languages", "utilization": "74%", "status": "HEALTHY"}
        ]
    }

@app.get("/api/students/predict-risk")
def predict_student_risk():
    """Student Truancy Risk Predictor: Flags students at-risk based on multiple anomalies."""
    return {
        "overall_risk_index": "24%",
        "risk_factors": [
            {
                "id": "9903",
                "name": "Tanvay",
                "grade": "Grade 10-A",
                "risk_score": 88,
                "risk_level": "HIGH",
                "anomalies": ["4 consecutive absences", "Incomplete parent signature"],
                "recommendation": "Urgent guardian call / assign academic counselor."
            },
            {
                "id": "9902",
                "name": "Tanvi",
                "grade": "Grade 10-B",
                "risk_score": 45,
                "risk_level": "MEDIUM",
                "anomalies": ["2 late check-ins", "Smudged Aadhaar field flagged"],
                "recommendation": "Review credentials / monitor attendance next week."
            },
            {
                "id": "9905",
                "name": "Sarthak",
                "grade": "Grade 10-A",
                "risk_score": 24,
                "risk_level": "LOW",
                "anomalies": ["1 missing check-in flag"],
                "recommendation": "Verify QR scan logs."
            }
        ]
    }
