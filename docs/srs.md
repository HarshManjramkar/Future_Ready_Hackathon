# 📋 Software Requirements Specification (SRS): EduFlow OS

## 1. Introduction & Scope
EduFlow OS is a full-stack automated operations platform for primary and secondary educational institutions. It delivers zero-shot document digitization, real-time combinatorial schedule optimization, anti-proxy edge attendance, and predictive risk analytics.

---

## 2. Overall Description & User Classes
- **Administrator / Principal**: Views campus overview, real-time KPI metrics, truancy risk alerts, and staffing projections.
- **Academic Coordinator**: Manages class timetables, triggers teacher absence reallocations, and oversees substitution logs.
- **Admissions / Registrar Officer**: Uploads paper forms to Magic Dropzone and verifies flagged edge-case records in the Human Review Inbox.
- **Kiosk Station / Gate Monitor**: Browser-based webcam terminal at school entrance for student check-in.

---

## 3. Functional Requirements (FR)

### FR-01: Multimodal Document Parsing (Magic Dropzone)
- **FR-01.1**: The system shall accept image uploads (`.jpg`, `.png`, `.jpeg`) of handwritten forms without requiring rigid layout templates.
- **FR-01.2**: Google Gemini 1.5 Vision VLM shall extract structured student, parent, address, and emergency contact details.
- **FR-01.3**: When extraction confidence is $< 0.80$ or fields are smudged, the system shall mark `requires_human_review: true` and route to the inbox.
- **FR-01.4**: If the uploaded document is a `TEACHER_LEAVE_FORM`, the system shall automatically trigger timetable disruption resolution.

### FR-02: Constraint-Based Timetable Engine & Disruption Solver
- **FR-02.1**: The system shall generate a conflict-free 5-day, 8-period schedule using Google OR-Tools CP-SAT.
- **FR-02.2**: The solver shall enforce hard constraints: (a) no teacher double-booking, (b) subject qualification matching, (c) room type matching, (d) max daily period limits.
- **FR-02.3**: Upon single or mass teacher absence events, the disruption solver shall reassign qualified substitute teachers in $< 0.05$ seconds.
- **FR-02.4**: If no qualified teacher is available, the system shall fallback to Study Hall / Library supervision.

### FR-03: Edge Computer Vision Smart Kiosk Attendance
- **FR-03.1**: The kiosk shall run client-side face tracking at 60 FPS using browser webcam streams (`tracking.js` / MediaPipe).
- **FR-03.2**: Dual Coincidence Rule: Attendance is marked `PRESENT` ONLY when both a valid Student ID QR code AND a human face bounding box are present in the frame.
- **FR-03.3**: If an ID card is scanned without a human face detected, the system shall reject the punch with an "Anti-Cheat Alert".

### FR-04: Human Review & Verification Inbox
- **FR-04.1**: Flagged documents shall display high-resolution image crops alongside editable JSON extraction forms.
- **FR-04.2**: One-click verification shall commit corrected records directly to live campus memory and generate unique student IDs.

### FR-05: Predictive Analytics & Staffing Projections
- **FR-05.1**: The system shall compute overall attendance %, total enrollment, and conflict counters in real time.
- **FR-05.2**: The system shall analyze truancy patterns and multi-factor anomalies to flag at-risk students with actionable recommendations.
- **FR-05.3**: The system shall forecast department workload and absenteeism risk days.

---

## 4. Non-Functional Requirements (NFR)

| Category | Requirement | Metric / Standard |
|---|---|---|
| **Performance** | Timetable Disruption Solve Time | $< 50\text{ ms}$ execution latency |
| **Performance** | Document Parsing Latency | $< 3.0\text{ s}$ per standard image |
| **Edge Frame Rate** | Face Detection Frame Rate | $\ge 50\text{ FPS}$ on standard browser |
| **Security** | Anti-Proxy Attendance Verification | 100% rejection of card-only scans |
| **Reliability** | Solver Graceful Degradation | Deterministic heuristic fallback if solver times out |
| **Portability** | Browser Compatibility | Modern Chromium, Firefox, Safari (zero client binary install) |
| **Accessibility** | UI Standard & Theme Support | Responsive Bento Grid, Dark/Emerald/Midnight themes, Keyboard CMD+K |

---

## 5. External Interface & API Contract Summary
- `GET /api/dashboard/stats`: Returns live enrollment, attendance %, and conflict counts.
- `GET /api/timetable/generate`: Fetches master conflict-free schedule.
- `POST /api/timetable/disruption`: Body `{ "teacher_id": str, "day": str }` -> returns substitute allocations.
- `POST /api/document/process`: Multipart image upload -> returns extracted JSON and auto-solve payload.
- `POST /api/kiosk/attendance`: Body `{ "qr_code": str, "face_detected": bool }` -> anti-cheat validation.
- `POST /api/document/verify`: Body `{ "index": int, "student_info": dict, ... }` -> commits student record.
- `GET /api/staffing/predict` & `GET /api/students/predict-risk`: Returns predictive analytics.
