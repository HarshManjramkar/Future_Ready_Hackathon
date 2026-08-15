# 🚀 EduFlow OS: Deployment & Operations Guide

## 1. Quickstart Run Instructions

### Prerequisites
- Python 3.10+ (tested up to Python 3.14)
- Node.js 18+ (tested on Node v20/v26)
- Optional: Gemini API Key (`GEMINI_API_KEY`) for live online zero-shot vision extraction.

### Backend Setup
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App will launch on http://localhost:5173
```

---

## 2. Automated Quality Gates & Compliance

Before pushing any changes or finalizing submissions, run the following automated quality suites:

```bash
# 1. Full Automated Python Test Suite (60 tests)
python3 -m unittest discover -s tests -p "test_*.py"

# 2. AI Session Quality Gate (LOC limits, Python/JSON AST, Security rules)
bash scripts/ai_session_gate.sh

# 3. Platinum Governance Check (Constitution, Sentrux boundaries, Semgrep packs)
bash scripts/platinum_governance_check.sh
```

---

## 3. Production Deployment Notes

### Vercel / Cloudflare Pages (Frontend)
- Frontend is configured with `frontend/vercel.json` and Vite build optimizations for instant CDN edge distribution.

### Docker Containerization (Backend)
- Standalone FastAPI container with OR-Tools CP-SAT C++ core bindings for <0.04s execution in constrained serverless/container environments.

### Security & Privacy Compliance
- **Zero Cloud Biometrics**: Facial verification executes completely within the browser client container (`tracking.js`), maintaining full compliance with student privacy regulations.
