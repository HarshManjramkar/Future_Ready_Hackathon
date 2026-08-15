# 🎯 Epics, User Stories & Acceptance Criteria

## Epic 1: Multimodal Paper Ingestion & Zero-Shot VLM Engine
- **US-1.1**: As an admissions clerk, I want to drag-and-drop handwritten admission forms into the browser so that data is extracted automatically into structured JSON.
  - *Given* a photo of a student admission form, *When* dropped in Magic Dropzone, *Then* student details, parent info, and Aadhaar numbers are parsed.
- **US-1.2**: As a school admin, I want low-confidence or smudged forms flagged for human review so that no corrupted data enters campus records.
  - *Given* an illegible or smudged handwriting sample, *When* processed, *Then* the system marks `requires_human_review: true` and adds to the review queue.
- **US-1.3**: As an academic coordinator, I want uploaded teacher leave slips to automatically trigger timetable disruption resolution.
  - *Given* an uploaded `TEACHER_LEAVE_FORM`, *When* parsed, *Then* the solver engine automatically computes and updates substitute assignments.

---

## Epic 2: Combinatorial Timetable Engine & Disruption Solver
- **US-2.1**: As an academic coordinator, I want to generate a full 5-day, 8-period master timetable that satisfies all teacher, room, and curriculum constraints.
  - *Given* teacher subjects and cohort specifications, *When* `/api/timetable/generate` is called, *Then* a conflict-free schedule is returned in $< 0.05\text{ s}$.
- **US-2.2**: As a coordinator, I want 1-click substitute resolution when a teacher calls in sick so that classes are covered by qualified teachers with zero overlaps.
  - *Given* a teacher absence event, *When* `/api/timetable/disruption` is invoked, *Then* available qualified substitutes are assigned without double-booking.
- **US-2.3**: As an administrator, I want to simulate mass teacher absences to verify campus resilience during flu season or emergencies.
  - *Given* multiple teacher absences on the same day, *When* mass disruption is triggered, *Then* all periods are covered or routed to supervised self-study.

---

## Epic 3: Edge Computer Vision Smart Kiosk ($0 Hardware)
- **US-3.1**: As a student, I want to flash my ID card QR code at the webcam terminal to mark attendance in under 1 second.
  - *Given* a valid ID QR code and face in frame, *When* scanned, *Then* attendance is marked `PRESENT` with a green flash and confetti.
- **US-3.2**: As a school principal, I want proxy attendance ("buddy punching") blocked if someone scans a card without a face in front of the camera.
  - *Given* a QR code scan with no human face detected, *When* received, *Then* the punch is rejected with an "Anti-Cheat Alert".

---

## Epic 4: Human Review & Verification Workflow
- **US-4.1**: As an administrative officer, I want an exception inbox displaying original form snippets side-by-side with editable fields so I can quickly correct mistakes.
  - *Given* a document in the inbox, *When* opened, *Then* side-by-side verification and 1-click commit is available.
- **US-4.2**: As an admissions officer, I want verified students to receive official IDs and appear immediately in the live attendance roster.
  - *Given* an approved form, *When* verified, *Then* the student is committed to memory with status `ABSENT` ready for kiosk check-in.

---

## Epic 5: Institutional Analytics, Truancy Risk & Staffing
- **US-5.1**: As a principal, I want a real-time executive Bento Grid displaying live enrollment, attendance %, and conflict counts.
  - *Given* changes in attendance or admissions, *When* viewed, *Then* KPIs update reactively.
- **US-5.2**: As a school counselor, I want predictive truancy risk scoring that flags multi-anomaly students with concrete recommendations.
  - *Given* attendance and doc scan logs, *When* analyzed, *Then* high/medium/low risk profiles are surfaced.

---

## Epic 6: Guided Onboarding & Interactive Architecture Walkthrough
- **US-6.1**: As an evaluator or visitor, I want an interactive 3D Gate sequence and step-by-step guided tour highlighting all core capabilities.
  - *Given* the first app load, *When* launched, *Then* the 3D gate intro and interactive spotlight tour guide the user through each feature.
