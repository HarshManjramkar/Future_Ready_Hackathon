# 📚 EduFlow OS: Comprehensive Technical Documentation

## 1. System Overview
EduFlow OS is a **Hybrid Edge-Cloud Autonomous Campus Engine** built for the Future Ready Hackathon. The platform revolutionizes campus administration by cleanly decoupling perception (AI-powered unstructured data extraction), decision-making (mathematical constraint optimization), and edge security (client-side anti-proxy verification) into reactive, loosely coupled modules.

### Core Stack Highlights
* **AI Engine:** Gemini 3.5 Flash Vision VLM
* **Optimization Engine:** Google OR-Tools CP-SAT Solver
* **Frontend:** React 19 (with Vite, Tailwind CSS v4)
* **Backend:** FastAPI (Python)
* **Edge Security:** MediaPipe WASM Edge Face Detection

---

## 2. Frontend Architecture (React 19)
The presentation layer is built on the latest **React 19** stack, optimized for minimal latency and high reactivity.

* **Framework:** React 19 bootstrapped with Vite for instant HMR and optimized production builds.
* **Styling:** Tailwind CSS v4 coupled with `framer-motion` and `lucide-react` icons for a modular Bento Grid design, 3D Gate Entrance Sequence, and a highly responsive Command Palette.
* **Component Architecture:** Key components like `SmartKiosk.jsx`, `DropzoneExtractionView.jsx`, and `ReactiveTimetable.jsx` cleanly isolate concerns, utilizing React 19 hooks and concurrent rendering for smooth real-time dashboard updates without blocking the main thread.

---

## 3. Backend Architecture (FastAPI)
The **FastAPI** backend orchestrates API requests, real-time timetable disruption logic, and AI inference routing.

* **Performance:** Leverages ASGI async architecture and GZip middleware to maintain ultra-low latencies.
* **API Endpoints:** Cleanly segmented into RESTful endpoints (e.g., `/api/timetable/generate`, `/api/document/process`, `/api/kiosk/verify-id`).
* **State Management:** Uses an in-memory `state.py` for high-throughput demo capability, instantly serving the `CURRENT_SCHEDULE` and `ATTENDANCE_LOGS` without database bottleneck overhead.

---

## 4. AI Integration: Gemini 3.5 Multimodal VLM
EduFlow OS employs a zero-shot document parsing engine (`parser.py`) powered by **Gemini 3.5 Flash Vision**. 

* **Classification-Guided Schema Extraction:** The AI classifies documents (e.g., `TEACHER_LEAVE_FORM`, `ADMISSION_FORM`) and dynamically extracts handwritten text, smudged checkboxes, and nested schemas.
* **Model Routing:** The backend dynamically routes requests through models like `gemini-3.6-flash`, `gemini-3.7-flash`, and `gemini-3.5-flash` ensuring maximum uptime.
* **Calibrated Uncertainty:** The VLM assigns an `extraction_confidence` score. If confidence falls below 85% or any field is illegible (`UNCERTAIN`), the system automatically diverts the document to a Human Review Inbox (`UNREVIEWED_DOCUMENTS`) for 1-click administrative verification.

---

## 5. Constraint Optimization: Google OR-Tools CP-SAT
The backend utilizes the **Google OR-Tools CP-SAT** solver (`solver.py`) for multi-commodity integer constraints scheduling and real-time disruption handling.

* **Hard Constraints & Heuristics:** Enforces teacher specialization matching, zero double-booking, and maximum daily workload limits (e.g., $N \le 5$ periods).
* **Real-Time Disruption Solver:** When a teacher submits a physical leave form, the document is parsed by Gemini 3.5. The backend instantly invokes the OR-Tools solver which computes a conflict-free reassignment in under **50ms**.
* **Dynamic Load Tracking:** The solver evaluates the available substitute pool dynamically, prioritizing specialists with lower daily period counts to prevent faculty burnout.

---

## 6. Smart Kiosk & Anti-Fraud Checks
The Smart Kiosk redefines student attendance with zero-hardware dual-factor edge security.

* **Step 1: ID Card QR Validation:** Students scan their digital or physical ID card QR code. The system verifies the token against the active roster, preventing duplicate check-ins (`ALREADY_PRESENT`).
* **Step 2: MediaPipe WASM Edge Face Detection:** Once the ID is verified, the system triggers the webcam. Using **MediaPipe WASM** via client-side scripts, it runs high-accuracy face tracking at ~60 FPS entirely within the browser. 
* **Anti-Proxy Logic:** Attendance is only marked if there is a **Dual Coincidence**: 
  $$\text{Attendance} = (\text{Face Detected} == \text{True}) \land (\text{QR Token Valid} == \text{True})$$
* **Zero Cloud GPU Cost & Privacy:** By processing computer vision locally via WebAssembly, the system ensures $0.00 cloud compute cost and guarantees biometric privacy since no video frames are uploaded to the server. If a QR is scanned but no face is detected, the scan is instantly blocked with a `Security Alert / Anti-Cheat` flag.

---

## 7. Cross-Module Automation Loop
1. **Trigger:** A teacher submits a physical leave form via the Magic Dropzone.
2. **Perception:** FastAPI sends the image to Gemini 3.5, which extracts data and detects `document_type == "TEACHER_LEAVE_FORM"`.
3. **Optimization:** The backend instantly invokes the OR-Tools CP-SAT solver to re-allocate classes based on constraints.
4. **Reactive UX:** The React 19 frontend consumes the state stream, updating the dashboard and timetable UI immediately.
5. **Security:** Substitutes and students proceed to classes, validating their presence through the zero-cost MediaPipe Smart Kiosk.
