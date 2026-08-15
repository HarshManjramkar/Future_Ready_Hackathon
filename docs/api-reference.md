# 📡 EduFlow OS: REST API & Integration Reference

## Base URL
- **Local Dev**: `http://localhost:8000` or `http://localhost:5173/api`
- **Prefix**: `/api`

---

## Endpoint Catalog

### 1. Operations & Health
- **`GET /`**
  - Description: Engine health check and capabilities.
  - Response: `{"app": "EduFlow Engine API", "status": "ONLINE", "features": [...]}`
- **`GET /api/dashboard/stats`**
  - Description: Aggregated real-time metrics across all 4 engine modules.
  - Response:
    ```json
    {
      "total_enrollment": 17,
      "new_admissions": 0,
      "attendance_percentage": 94.1,
      "present_count": 16,
      "kiosk_students_count": 17,
      "schedule_conflicts": 0,
      "unreviewed_inbox_count": 0
    }
    ```

---

### 2. Timetable & Disruption Solver (OR-Tools CP-SAT)
- **`GET /api/timetable/generate`**
  - Description: Generates or retrieves the conflict-free 5-day, 8-period CBSE timetable.
  - Response: `{"status": "SUCCESS", "schedule": [...], "solve_time_seconds": 0.018}`
- **`POST /api/timetable/disruption`**
  - Description: Reallocates periods in real-time when a faculty member reports absence.
  - Request: `{"teacher_id": "TCH_101", "day": "Monday"}`
  - Response: `{"status": "SUCCESS", "absent_teacher_id": "TCH_101", "total_affected_periods": 2, "resolutions": [...]}`
- **`POST /api/demo/mass-absence`**
  - Description: Simulates simultaneous absence of 3 faculty members (`TCH_101`, `TCH_102`, `TCH_103`).
- **`POST /api/demo/reset`**
  - Description: Resets in-memory schedule, attendance, and inbox queues to initial seed state.

---

### 3. Multimodal VLM Document Processing (Gemini Vision)
- **`POST /api/document/process` (or `/api/document/parse`)**
  - Description: Ingests image bytes, executes zero-shot VLM parsing, calibrates uncertainty, and routes.
  - Payload: Multipart Form Data (`file: binary`, `sample_type?: string`).
- **`GET /api/document/unreviewed`**
  - Description: Lists documents flagged for administrative human-in-the-loop review.
- **`POST /api/document/verify`**
  - Description: Commits human-verified fields to the live student database and pops the inbox item.
  - Request:
    ```json
    {
      "index": 0,
      "student_info": {"full_name": "Tanvi Patil", "aadhaar_number": "9902-1234"},
      "parent_info": {"father_mobile": "+91 76207 79722"},
      "address": {"city": "Pune"}
    }
    ```

---

### 4. Smart Kiosk Attendance (Anti-Proxy Gate)
- **`POST /api/kiosk/attendance`**
  - Description: Validates dual coincidence of QR code scan and client-side face liveness.
  - Request: `{"qr_code": "9901", "face_detected": true}`
  - Responses:
    - **Valid**: `{"status": "SUCCESS", "message": "Verified!", "green_flash": true, "student": {...}}`
    - **Proxy Fraud Alert**: `{"status": "REJECTED", "message": "Anti-Cheat Alert: ID scanned, but no human face detected!", "green_flash": false}`
- **`GET /api/students`**
  - Description: Returns active roster with live attendance status and check-in timestamps.

---

### 5. Staffing & Student Truancy Intelligence
- **`GET /api/staffing/predict`**
  - Description: Returns predicted absenteeism percentage, high-risk days, and department workloads.
- **`GET /api/students/predict-risk`**
  - Description: Computes per-student academic and truancy risk scores with anomaly explanations.
