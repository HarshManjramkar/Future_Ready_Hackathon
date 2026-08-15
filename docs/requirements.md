# 📐 Requirements Traceability & Verification Matrix

## 1. Requirements Overview
This document cross-references user needs, functional requirements, and automated validation tests across EduFlow OS.

---

## 2. Requirements-to-Component Traceability Matrix

| Requirement ID | Module / Component | Implementation File | Verification Test / Gate |
|---|---|---|---|
| **FR-01 (Doc Ingestion)** | Magic Dropzone | [`backend/app/parser.py`](file:///Users/devang/Desktop/Future_Ready_Hackathon/backend/app/parser.py), [`MagicDropzone.jsx`](file:///Users/devang/Desktop/Future_Ready_Hackathon/frontend/src/components/MagicDropzone.jsx) | `POST /api/document/process` zero-shot extraction test |
| **FR-02 (Timetable Engine)** | Disruption Solver | [`backend/app/solver.py`](file:///Users/devang/Desktop/Future_Ready_Hackathon/backend/app/solver.py), [`ReactiveTimetable.jsx`](file:///Users/devang/Desktop/Future_Ready_Hackathon/frontend/src/components/ReactiveTimetable.jsx) | `POST /api/timetable/disruption` CP-SAT solver benchmarks |
| **FR-03 (Anti-Cheat Kiosk)** | Smart Kiosk | [`backend/app/main.py`](file:///Users/devang/Desktop/Future_Ready_Hackathon/backend/app/main.py), [`SmartKiosk.jsx`](file:///Users/devang/Desktop/Future_Ready_Hackathon/frontend/src/components/SmartKiosk.jsx) | `POST /api/kiosk/attendance` Dual Coincidence test suite |
| **FR-04 (Human Review)** | Verification Inbox | [`backend/app/main.py`](file:///Users/devang/Desktop/Future_Ready_Hackathon/backend/app/main.py), [`HumanReviewInbox.jsx`](file:///Users/devang/Desktop/Future_Ready_Hackathon/frontend/src/components/HumanReviewInbox.jsx) | `POST /api/document/verify` and `GET /api/document/unreviewed` |
| **FR-05 (Predictive Risk)** | Analytics Engine | [`backend/app/main.py`](file:///Users/devang/Desktop/Future_Ready_Hackathon/backend/app/main.py), [`SmartStaffing.jsx`](file:///Users/devang/Desktop/Future_Ready_Hackathon/frontend/src/components/SmartStaffing.jsx) | `GET /api/students/predict-risk` schema validation |
| **FR-06 (Institutional UX)** | Overview & Tour | [`DashboardOverview.jsx`](file:///Users/devang/Desktop/Future_Ready_Hackathon/frontend/src/components/DashboardOverview.jsx), [`IntroScreen.jsx`](file:///Users/devang/Desktop/Future_Ready_Hackathon/frontend/src/components/IntroScreen.jsx) | Playwright E2E UI Smoke & Gate Check |

---

## 3. Data Integrity & Boundary Constraints
1. **Zero Data Duplication**: Attendance logs and enrolled students maintain unique IDs (`STU-9901` through `STU-9905`, plus dynamic admissions).
2. **Deterministic Fallbacks**: If external LLM API keys are missing or offline, the parser falls back gracefully to structured OCR simulations without crashing.
3. **Hardware Independence**: Kiosk runs entirely within standard web browsers using HTML5 `getUserMedia` and Canvas 2D image processing.

---

## 4. Acceptance Criteria Summary
- **AC-01**: Form drag-and-drop renders parsed JSON in $< 3$ seconds.
- **AC-02**: Disruption solver assigns qualified substitute with 0 period overlaps.
- **AC-03**: QR card scan without camera face detection triggers immediate red anti-cheat banner.
- **AC-04**: Verified document increments total enrollment count dynamically.
