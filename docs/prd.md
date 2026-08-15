# 📖 Product Requirements Document (PRD): EduFlow OS

## 1. Product Overview & Strategic Objectives
EduFlow OS is an autonomous operations platform engineered for K-12 institutions. Its objective is to eliminate administrative delays, automate timetable disruption management in $< 50\text{ ms}$, digitize handwritten paperwork with zero-shot VLMs, and eliminate attendance buddy-punching at zero hardware cost.

---

## 2. User Personas

```
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│ Principal Dr. Sharma    │  │ Coordinator Meenakshi   │  │ Student Tanvay          │
│ • Executive visibility  │  │ • Morning schedule fixes│  │ • Fast gate check-in   │
│ • Risk & staff insights │  │ • Conflict-free subs    │  │ • Verified identity     │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

- **Dr. R. Sharma (Principal)**: Needs single-pane-of-glass overview of school operations, truancy anomalies, and teacher capacity.
- **Mrs. Meenakshi (Academic Coordinator)**: Needs to resolve 7:30 AM teacher absences instantly without manual phone calls.
- **Mr. Deshmukh (Faculty Member)**: Needs balanced workload and clear substitute notifications without accidental double-bookings.
- **Tanvay (Class 10 Student)**: Needs rapid, secure morning check-in using student ID without manual roll calls.

---

## 3. Core User Journeys

### Journey 1: Morning Teacher Sick Leave (Sub-Second Self-Healing)
1. At 7:30 AM, teacher absence is registered via web UI or uploaded leave slip.
2. OR-Tools CP-SAT engine evaluates teacher qualifications, room capacities, and current period commitments.
3. System outputs conflict-free reassignments in $< 50\text{ ms}$ and updates live timetable.
4. Timetable UI highlights reassigned slots with badge and toast notification.

### Journey 2: Admission Paperwork Ingestion
1. Parent submits handwritten physical admission form.
2. Staff drags photo into **Magic Dropzone**.
3. Gemini 1.5 Vision parses student info, parent contacts, Aadhaar, and address.
4. Clean forms save directly to DB; smudged or ambiguous fields route to **Human Review Inbox**.
5. Staff performs 1-click verification, which generates student ID (`STU-99xx`) and admission badge.

### Journey 3: Student Gate Check-in
1. Student walks up to kiosk webcam terminal with ID card.
2. Edge CV detects live face bounding box at 60 FPS while scanner decodes QR code token.
3. If both match, system marks `PRESENT`, logs check-in timestamp, and triggers celebratory confetti.
4. If a friend flashes a card without their face in frame, system rejects and triggers Anti-Cheat Alert.

---

## 4. Key Performance Indicators (KPIs)
- **Schedule Resolution Speed**: $< 50\text{ ms}$ vs 60 min manual coordination.
- **OCR/VLM Ingestion Time**: $< 3.0\text{ s}$ per physical form vs 15 min manual typing.
- **Proxy Punch Elimination**: 100% buddy punching blocked by dual coincidence validation.
- **System Uptime & Fallback**: 100% availability through deterministic fallback heuristics.
