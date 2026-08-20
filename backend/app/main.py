"""
EduFlow FastAPI Main Application.
Provides RESTful APIs for Timetabling, Disruption Resolution, AI Document Reading, and Smart Kiosk Attendance.
"""
import time
import html
import json
import re
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.mock_data import COHORTS, STUDENTS
from app.state import solver_engine, doc_parser, CURRENT_SCHEDULE, ATTENDANCE_LOGS, UNREVIEWED_DOCUMENTS, reset_memory_state
import base64

app = FastAPI(title="EduFlow Engine API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

try:
    from starlette.middleware.gzip import GZipMiddleware
    app.add_middleware(GZipMiddleware, minimum_size=1000)
except Exception:
    pass

class DisruptionRequest(BaseModel):
    teacher_id: str
    day: str = "Monday"

class AttendanceScanRequest(BaseModel):
    qr_code: str
    face_detected: bool

class VerifyIdRequest(BaseModel):
    qr_code: str

class VerificationRequest(BaseModel):
    index: int
    verified_data: Dict[str, Any]

@app.get("/")
@app.get("/health")
def read_root():
    return {"app": "EduFlow Engine API", "status": "ONLINE", "features": ["OR-Tools Timetabling", "Live Disruption Solver", "Gemini Document Parser", "Smart Kiosk Attendance"]}

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    total_cohort = sum(c.get("student_count", 0) for c in COHORTS)
    kiosk_students = len(ATTENDANCE_LOGS)
    present_count = sum(1 for s in ATTENDANCE_LOGS if s.get("attendance_status") == "PRESENT")
    attendance_pct = round((present_count / kiosk_students) * 100, 1) if kiosk_students > 0 else 0.0
    schedule = CURRENT_SCHEDULE.get("schedule", [])
    conflicts = sum(1 for s in schedule if s.get("teacher_id") == "UNASSIGNED" or s.get("conflict") is True)
    new_admissions = max(0, kiosk_students - len(STUDENTS))
    return {
        "total_enrollment": total_cohort + new_admissions, "new_admissions": new_admissions,
        "attendance_percentage": attendance_pct, "present_count": present_count,
        "kiosk_students_count": kiosk_students, "schedule_conflicts": conflicts,
        "unreviewed_inbox_count": len(UNREVIEWED_DOCUMENTS)
    }

@app.get("/api/timetable/generate")
def get_full_timetable():
    if not CURRENT_SCHEDULE or CURRENT_SCHEDULE.get("status") not in ["SUCCESS", "HEURISTIC_SUCCESS"]:
        fresh = solver_engine.generate_full_schedule()
        CURRENT_SCHEDULE.clear()
        CURRENT_SCHEDULE.update(fresh)
    return CURRENT_SCHEDULE

@app.post("/api/timetable/disruption")
def resolve_disruption(req: DisruptionRequest):
    schedule_data = CURRENT_SCHEDULE.get("schedule", [])
    resolution = solver_engine.resolve_teacher_absence(req.teacher_id, req.day, schedule_data)
    for slot in schedule_data:
        orig_t_id = slot.get("original_teacher_id", slot.get("teacher_id"))
        m = next((r for r in resolution["resolutions"] if r["period"] == slot["period"] and slot["day"] == req.day and (slot["teacher_id"] in [req.teacher_id, resolution["absent_teacher_id"]] or orig_t_id in [req.teacher_id, resolution["absent_teacher_id"]])), None)
        if m:
            slot["original_teacher_id"] = orig_t_id
            slot["teacher_name"] = m["recommended_substitute"]
            slot["teacher_id"] = m["substitute_id"]
            slot["is_reassigned"] = True
    resolution["status"] = "SUCCESS"
    return resolution

@app.post("/api/demo/reset")
def reset_demo_state():
    return reset_memory_state()

@app.post("/api/demo/mass-absence")
def simulate_mass_absence():
    fresh = solver_engine.generate_full_schedule()
    CURRENT_SCHEDULE.clear()
    CURRENT_SCHEDULE.update(fresh)
    absent_teachers, day, all_resolutions = ["TCH_101", "TCH_102", "TCH_103"], "Monday", []
    for t_id in absent_teachers:
        res = solver_engine.resolve_teacher_absence(t_id, day, CURRENT_SCHEDULE.get("schedule", []))
        all_resolutions.extend(res.get("resolutions", []))
        for slot in CURRENT_SCHEDULE.get("schedule", []):
            orig_t_id = slot.get("original_teacher_id", slot.get("teacher_id"))
            m = next((item for item in res["resolutions"] if item["period"] == slot["period"] and slot["day"] == day and (slot["teacher_id"] in [t_id, res["absent_teacher_id"]] or orig_t_id in [t_id, res["absent_teacher_id"]])), None)
            if m:
                slot["original_teacher_id"] = orig_t_id
                slot["teacher_name"] = m["recommended_substitute"]
                slot["teacher_id"] = m["substitute_id"]
                slot["is_reassigned"] = True
    return {"status": "SUCCESS", "day": day, "total_affected_periods": len(all_resolutions), "resolutions": all_resolutions}

@app.post("/api/document/process")
@app.post("/api/document/parse")
def parse_document(file: UploadFile = File(...), sample_type: Optional[str] = Form(None)):
    try:
        contents = file.file.read()
        parsed = doc_parser.parse_image_bytes(contents, filename=file.filename, sample_type=sample_type)
        if parsed.get("requires_human_review", False):
            encoded = base64.b64encode(contents).decode("utf-8")
            parsed["image_data"] = f"data:{file.content_type};base64,{encoded}"
            UNREVIEWED_DOCUMENTS.append(parsed)
        if parsed.get("document_type") == "TEACHER_LEAVE_FORM":
            t_id, day = parsed.get("teacher_id", "TCH_101"), parsed.get("date_of_absence", "Monday")
            res = solver_engine.resolve_teacher_absence(t_id, day, CURRENT_SCHEDULE.get("schedule", []))
            for slot in CURRENT_SCHEDULE.get("schedule", []):
                orig_t_id = slot.get("original_teacher_id", slot.get("teacher_id"))
                m = next((r for r in res["resolutions"] if r["period"] == slot["period"] and slot["day"] == day and (slot["teacher_id"] in [t_id, res["absent_teacher_id"]] or orig_t_id in [t_id, res["absent_teacher_id"]])), None)
                if m:
                    slot["original_teacher_id"] = orig_t_id
                    slot["teacher_name"], slot["teacher_id"], slot["is_reassigned"] = m["recommended_substitute"], m["substitute_id"], True
            return {"status": "SUCCESS", "filename": file.filename, "parsed_data": parsed, "auto_timetable_solved": True, "resolution": res}
        return {"status": "SUCCESS", "filename": file.filename, "parsed_data": parsed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/document/unreviewed")
def get_unreviewed_documents():
    return {"count": len(UNREVIEWED_DOCUMENTS), "documents": UNREVIEWED_DOCUMENTS}

@app.post("/api/document/verify")
def verify_document(req: VerificationRequest):
    if req.index < 0 or req.index >= len(UNREVIEWED_DOCUMENTS):
        raise HTTPException(status_code=400, detail="Invalid document index")
    UNREVIEWED_DOCUMENTS.pop(req.index)
    
    # Check if it's an admission form to add a student
    vd = req.verified_data
    if vd.get("document_type", "") == "TEACHER_LEAVE_FORM" or not vd.get("student_info"):
        return {"status": "SUCCESS", "message": "Document verified and dismissed."}
        
    student_info = vd.get("student_info") or {}
    parent_info = vd.get("parent_info") or {}
    
    raw_aadhaar = str(student_info.get("aadhaar_number", ""))
    clean_aadhaar = re.sub(r'[^0-9A-Za-z-]', '', raw_aadhaar)
    student_id = clean_aadhaar.split("-")[-1][:4] if "-" in clean_aadhaar else "99" + str(len(ATTENDANCE_LOGS) + 1)
    new_student = {
        "id": student_id, "name": html.escape(str(student_info.get("full_name", "Admitted Student")).strip()),
        "grade": html.escape(str(student_info.get("class_applying_for", "Grade 10-A")).strip()),
        "roll_no": student_id, "qr_code": student_id,
        "guardian_phone": html.escape(str(parent_info.get("father_mobile", "--")).strip()),
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "attendance_status": "ABSENT", "check_in_time": "--"
    }
    ATTENDANCE_LOGS.append(new_student)
    return {"status": "SUCCESS", "message": f"Successfully admitted {new_student['name']} (ID: {new_student['id']})", "student": new_student}

# ── STEP 1: QR Identity Lookup ──────────────────────────────────────────────
@app.post("/api/kiosk/verify-id")
def verify_student_id(req: VerifyIdRequest):
    """Step 1 of 2-factor check-in: validate QR code, return student info.
    Does NOT mark attendance — that happens in Step 2 after face scrutiny."""
    raw = str(req.qr_code).split("\x00")[0].strip()
    clean = re.sub(r'[\u200B-\u200D\uFEFF]', '', raw)
    if clean.startswith("{"):
        try:
            payload = json.loads(clean)
            clean = str(payload.get("id") or payload.get("student_id") or payload.get("roll_no") or payload.get("qr_code") or clean)
        except Exception: pass
    clean = clean.replace("STU-", "").replace("EDU-", "").split("-")[0].strip()

    matched = next((
        s for s in ATTENDANCE_LOGS
        if str(s.get("id")) in [raw, clean]
        or str(s.get("qr_code")) in [raw, clean]
        or str(s.get("qr_token")) in [raw, clean]
    ), None)

    if not matched:
        return {"status": "REJECTED", "message": f"QR code '{req.qr_code}' is not registered."}

    # Already checked in today?
    if matched.get("attendance_status") == "PRESENT":
        return {"status": "ALREADY_PRESENT", "message": f"{matched['name']} is already checked in.", "student": matched}

    return {"status": "ID_VERIFIED", "message": f"ID verified for {matched['name']}. Proceed to facial scrutiny.", "student": matched}


# ── STEP 2: Face Confirmed → Mark Attendance ─────────────────────────────────
@app.post("/api/kiosk/attendance")
def register_attendance(scan: AttendanceScanRequest):
    """Step 2 of 2-factor check-in: face detected, mark attendance as PRESENT."""
    if not scan.face_detected:
        return {"status": "REJECTED", "message": "Anti-Cheat Alert: No face confirmed for biometric step!", "green_flash": False}
    raw = str(scan.qr_code).split("\x00")[0].strip()
    clean = re.sub(r'[\u200B-\u200D\uFEFF]', '', raw)
    if clean.startswith("{"):
        try:
            payload = json.loads(clean)
            clean = str(payload.get("id") or payload.get("student_id") or payload.get("roll_no") or payload.get("qr_code") or clean)
        except Exception: pass
    clean = clean.replace("STU-", "").replace("EDU-", "").split("-")[0].strip()
    matched = next((s for s in ATTENDANCE_LOGS if str(s.get("id")) in [raw, clean] or str(s.get("qr_code")) in [raw, clean] or str(s.get("qr_token")) in [raw, clean]), None)
    if matched:
        matched["attendance_status"] = "PRESENT"
        matched["check_in_time"] = time.strftime("%I:%M %p")
        return {"status": "SUCCESS", "message": f"✓ Dual-factor verified! Attendance marked for {matched['name']} ({matched['grade']})", "student": matched, "green_flash": True}
    return {"status": "REJECTED", "message": f"Security Alert: ID QR Code (#{scan.qr_code}) is unregistered or invalid!", "green_flash": False}

@app.get("/api/students")
def get_students():
    return {"students": ATTENDANCE_LOGS}

@app.get("/api/staffing/predict")
def predict_staffing():
    return {"predicted_absenteeism_rate": "12%", "high_risk_days": ["Friday", "Monday"], "recommended_substitute_pool": 3,
            "department_load": [{"department": "Mathematics", "utilization": "92%", "status": "HIGH_LOAD"},
                                {"department": "Science", "utilization": "85%", "status": "OPTIMAL"},
                                {"department": "Languages", "utilization": "74%", "status": "HEALTHY"}]}

@app.get("/api/students/predict-risk")
def predict_student_risk():
    return {"overall_risk_index": "24%", "risk_factors": [
        {"id": "9903", "name": "Tanvay", "grade": "Grade 10-A", "risk_score": 88, "risk_level": "HIGH", "anomalies": ["4 consecutive absences", "Incomplete parent signature"], "recommendation": "Urgent guardian call / assign academic counselor."},
        {"id": "9902", "name": "Tanvi", "grade": "Grade 10-B", "risk_score": 45, "risk_level": "MEDIUM", "anomalies": ["2 late check-ins", "Smudged Aadhaar field flagged"], "recommendation": "Review credentials / monitor attendance next week."},
        {"id": "9905", "name": "Sarthak", "grade": "Grade 10-A", "risk_score": 24, "risk_level": "LOW", "anomalies": ["1 missing check-in flag"], "recommendation": "Verify QR scan logs."}
    ]}

class NotifyRequest(BaseModel):
    phone_number: str
    student_name: str
    document_type: str

@app.post("/api/document/notify-parent")
async def notify_parent(req: NotifyRequest):
    import asyncio, time
    await asyncio.sleep(1.5) # Simulate network delay
    print(f"[TWILIO MOCK] WhatsApp Sent to {req.phone_number} for {req.student_name}'s {req.document_type}")
    return {"status": "SUCCESS", "message_id": f"SM{int(time.time())}abc123"}
