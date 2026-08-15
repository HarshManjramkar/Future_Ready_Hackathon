# 🥒 Executable ATDD Specifications (bmad-testarch-atdd)
**Product**: EduFlow OS | **Author**: Murat (Test Architect Enterprise) | **Status**: Active / Approved

---

## 🏛️ Epic 1: Multimodal Paper Ingestion & Zero-Shot VLM Engine

### Scenario 1.1: Happy Path - Clean Handwritten Admission Form Extraction (US-1.1)
```gherkin
Feature: Multimodal Document Ingestion
  Scenario: High-confidence handwritten student admission form parsing
    Given a high-resolution image of a handwritten admission form "student_admissions_01.jpg"
    When the user drags and drops the file into Magic Dropzone "/api/document/process"
    Then the Gemini 1.5 Vision engine extracts "student_name", "guardian", and "aadhaar_number"
    And the extraction confidence score is >= 0.80
    And "requires_human_review" is set to false
    And the record is staged for instant registration
```

### Scenario 1.2: Alternative Path - Automated Teacher Leave Slip Routing (US-1.3)
```gherkin
  Scenario: Leave slip triggers automatic disruption solver
    Given an uploaded image identified as "TEACHER_LEAVE_FORM" for teacher "TEA-001" on "Monday"
    When the VLM pipeline parses the leave slip via "/api/document/process"
    Then the system identifies doc_type as "TEACHER_LEAVE_FORM"
    And automatically triggers the timetable disruption solver "/api/timetable/disruption"
    And returns substitute allocations for all affected periods
```

### Scenario 1.3: Negative/Edge Path - Smudged / Low-Confidence Form (US-1.2)
```gherkin
  Scenario: Illegible or smudged form routed to human review inbox
    Given a blurred or torn admission form with confidence score 0.62 (< 0.80)
    When the document is processed by "/api/document/process"
    Then the response flags "requires_human_review" as true
    And the item is appended to the Human Review Queue
    And an alert banner notifies the user to verify extraction
```

---

## ⚡ Epic 2: Combinatorial Timetable Engine & Disruption Solver

### Scenario 2.1: Happy Path - Conflict-Free Master Schedule Generation (US-2.1)
```gherkin
Feature: Combinatorial Timetable Engine
  Scenario: Fast generation of 5-day 8-period master timetable
    Given 15 faculty members with specific subject qualifications and 4 cohorts
    When the coordinator triggers schedule generation via "/api/timetable/generate"
    Then Google OR-Tools CP-SAT returns a full schedule in < 50 ms
    And zero teachers have overlapping assignments in the same period
    And no teacher exceeds max 4 periods per day
```

### Scenario 2.2: Alternative Path - 1-Click Sick Leave Substitute Reallocation (US-2.2)
```gherkin
  Scenario: Teacher absence instant substitute assignment
    Given teacher "TEA-002" (Mathematics) is marked absent on "Wednesday"
    When the disruption endpoint "/api/timetable/disruption" is invoked with {"teacher_id": "TEA-002", "day": "Wednesday"}
    Then affected periods are reassigned to available qualified math teachers
    And timetable UI receives dynamic update payload with reassignment badges
```

### Scenario 2.3: Negative/Edge Path - Mass Absence Exhausting Qualified Faculty (US-2.3)
```gherkin
  Scenario: Mass absence fallback to supervised study hall
    Given 5 teachers are absent concurrently and all qualified subject faculty are busy
    When the disruption solver executes
    Then unresolvable periods fallback to "SUB-LIBRARY" (Supervised Self-Study)
    And no unassigned void periods remain in student cohorts
```

---

## 📷 Epic 3: Edge Computer Vision Smart Kiosk ($0 Hardware)

### Scenario 3.1: Happy Path - Dual Coincidence Student Check-In (US-3.1)
```gherkin
Feature: Edge Computer Vision Smart Kiosk
  Scenario: Legitimate student check-in with face and QR code
    Given student "STU-9901" is registered in the database with status "ABSENT"
    And a human face bounding box is actively detected by edge CV at >= 50 FPS
    When the student presents QR token "STU-9901" to "/api/kiosk/attendance"
    Then attendance status updates to "PRESENT" with timestamp
    And the kiosk interface displays a green border flash and confetti animation
```

### Scenario 3.2: Negative Path - Anti-Cheat Buddy Punching Rejection (US-3.2)
```gherkin
  Scenario: Card-only scan without face in frame triggers anti-cheat alert
    Given a valid QR token "STU-9902" is presented to the webcam
    And no human face is detected in the video stream (face_detected = false)
    When attendance request is posted to "/api/kiosk/attendance"
    Then the server returns HTTP 400 with "Anti-Cheat Alert: Proxy Punch Blocked"
    And student attendance remains "ABSENT"
```

### Scenario 3.3: Alternative Path - Unregistered / Corrupt QR Token
```gherkin
  Scenario: Unrecognized QR token scan with face present
    Given a human face is detected in the video stream
    When an unregistered or corrupted QR code "UNKNOWN-TOKEN" is scanned
    Then the kiosk rejects the check-in with "Unregistered ID Card"
    And no database mutation occurs
```

---

## 🔍 Epic 4: Human Review & Verification Workflow

### Scenario 4.1: Happy Path - Exception Inbox Verification & DB Commit (US-4.1, US-4.2)
```gherkin
Feature: Human Review Verification
  Scenario: Side-by-side verification and one-click student registration
    Given a flagged document at queue index 0 with low confidence fields
    When the admin edits the corrected fields and clicks "Verify & Commit" via "/api/document/verify"
    Then the student record is written to live campus memory
    And an official student ID ("STU-99xx") is generated
    And the student appears in the roster ready for kiosk check-in
```

### Scenario 4.2: Negative Path - Commit with Invalid / Missing Required Fields
```gherkin
  Scenario: Attempting verification commit with empty required student name
    Given an unreviewed document in the inbox
    When the reviewer attempts to commit with empty "student_name"
    Then the validation schema rejects the request with HTTP 422
    And field-level error "Student name is required" is highlighted
```

---

## 📊 Epic 5: Institutional Analytics, Truancy Risk & Staffing

### Scenario 5.1: Happy Path - Reactive Bento Grid KPI Aggregation (US-5.1)
```gherkin
Feature: Predictive Analytics & Staffing Insights
  Scenario: Real-time dashboard KPI synchronization
    Given 50 students registered with 35 checked in and 1 schedule conflict
    When the executive dashboard calls "/api/dashboard/stats"
    Then total_enrollment returns 50, attendance_rate returns "70.0%", and conflicts returns 1
```

### Scenario 5.2: Alternative Path - Truancy Multi-Factor Risk Assessment (US-5.2)
```gherkin
  Scenario: High truancy risk calculation and counselor recommendation
    Given a student with attendance rate < 75% and unverified admission flag
    When truancy engine evaluates "/api/students/predict-risk"
    Then the student risk_level is classified as "HIGH" (score >= 70)
    And an intervention action "Urgent Counselor Follow-up" is attached
```

---

## 🚀 Epic 6: Guided Onboarding & Interactive Walkthrough

### Scenario 6.1: Happy Path - 3D Gate Entrance & Spotlight Tour (US-6.1)
```gherkin
Feature: Guided Onboarding & Feature Discovery
  Scenario: First-time visitor guided walkthrough
    Given a user visiting the EduFlow OS root interface
    When the application loads for the first time
    Then the interactive 3D Gate entrance sequence is rendered
    And sequential spotlight tooltips guide through Ingestion, Solver, Kiosk, and Bento Grid
```

### Scenario 6.2: Alternative Path - Dismissal and Resumption via Command Palette
```gherkin
  Scenario: Skipping onboarding tour and re-opening via keyboard shortcut
    Given an active onboarding tour
    When the user clicks "Skip Tour" or presses "Escape"
    Then the spotlight overlay is removed
    And pressing "CMD+K" -> "Start Tour" restarts the walkthrough from step 1
```

---

## 📋 Traceability & Quality Gate Matrix
| Epic | Happy Scenario | Alternative Scenario | Negative / Error Scenario | Automated Test Harness |
|---|---|---|---|---|
| **Epic 1: Ingestion** | `test_valid_admission_form_extraction` | `test_leave_slip_triggers_disruption` | `test_low_confidence_routes_to_review` | `pytest tests/test_ocr_vlm.py` |
| **Epic 2: Timetable** | `test_conflict_free_master_generation` | `test_sick_leave_substitute_reallocation` | `test_mass_absence_fallback_to_library` | `pytest tests/test_timetable_solver.py` |
| **Epic 3: Smart Kiosk** | `test_dual_coincidence_present_punch` | `test_unregistered_qr_token_rejection` | `test_buddy_punching_anti_cheat_alert` | `pytest tests/test_kiosk_cv.py` |
| **Epic 4: Review** | `test_verify_and_commit_student` | `test_inbox_queue_synchronization` | `test_commit_with_missing_fields_fails` | `pytest tests/test_review_inbox.py` |
| **Epic 5: Analytics** | `test_bento_grid_stats_aggregation` | `test_truancy_risk_high_classification` | `test_zero_division_empty_attendance` | `pytest tests/test_analytics.py` |
| **Epic 6: Onboarding** | `test_3d_gate_and_tour_rendering` | `test_tour_retrigger_command_palette` | `test_invalid_tour_step_bounds_handling` | `playwright tests/e2e_tour.spec.js` |
