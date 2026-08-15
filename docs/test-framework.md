# 🏗️ Enterprise Test Architecture Framework Spec

## 1. Overview & Framework Topology
This framework establishes a unified, deterministic testing infrastructure across the **EduFlow OS** platform, satisfying the **BMad TEA (Test Architect Enterprise)** standard.

```
Future_Ready_Hackathon/
├── pytest.ini                    # Pytest discovery & marker configurations
├── .coveragerc                   # Coverage measurement rules (>= 90% threshold)
├── playwright.config.js          # Multi-browser & mobile viewport E2E runner config
├── tests/
│   ├── fixtures/
│   │   └── test_harness.py       # Reusable mock factories & isolated data fixtures
│   ├── test_solver_engine.py     # CP-SAT constraint optimization tests
│   ├── test_parser_engine.py     # Gemini Vision VLM schema & confidence tests
│   ├── test_api_integration.py   # FastAPI endpoints & memory DB mutation tests
│   ├── test_kiosk_anti_cheat.py  # Dual Coincidence edge CV security tests
│   ├── test_predictive_analytics.py # Staffing forecasting & truancy risk tests
│   ├── test_nfr_adversarial_perf.py # XSS/SQL injection, extreme payloads, stress tests
│   ├── test_data_integrity.py    # CBSE 7 core subjects & roster schema invariants
│   ├── test_bmad_scaffold.py     # BMad OS governance & constitutional invariants
│   └── e2e/
│       ├── e2e_runner.js         # Automated Headless Component E2E runner
│       ├── kiosk_attendance.spec.js
│       ├── timetable_disruption.spec.js
│       ├── document_dropzone.spec.js
│       └── responsive_themes.spec.js
```

---

## 2. Test Execution Command Matrix

| Test Layer | Execution Command | Purpose & Standard |
|---|---|---|
| **All Python Unit & Integration** | `python3 -m unittest discover tests` | Fast, deterministic execution (0.003s) |
| **Pytest Runner & Markers** | `pytest tests/ -m unit` or `pytest tests/ -m security` | Filtered targeted layer execution |
| **Coverage Analysis** | `coverage run -m unittest discover tests && coverage report` | Enforces 90%+ statement coverage gate |
| **Headless Component E2E** | `node tests/e2e/e2e_runner.js` | AST, DOM contracts, hooks, and responsive styles |
| **Playwright Full Browser E2E** | `npx playwright test` | Multi-browser headless/headed verification |
| **Governance & Quality Gates** | `bash scripts/ai_session_gate.sh` | Quality gate for LOC limits, AST, & syntax |

---

## 3. Fixture & Test Harness Lifecycle
The fixture harness in [`tests/fixtures/test_harness.py`](file:///Users/devang/Desktop/Future_Ready_Hackathon/tests/fixtures/test_harness.py) provides pure factory functions:
1. `create_mock_teacher(id, name, subjects, max_periods)`: Isolates teacher capacity limits.
2. `create_mock_student(id, name, grade, status)`: Builds deterministic student records.
3. `create_mock_admission_payload(name, aadhaar, confidence)`: Generates valid and edge-case VLM JSON payloads with dynamic confidence thresholds.

---

## 4. Test Pyramid Ratios
- **Unit & Algorithmic Layer**: ~50% (Solver constraints, parser prompt schema, data invariants).
- **Integration & Security Layer**: ~30% (REST APIs, memory DB mutation, anti-proxy dual coincidence).
- **E2E & Browser UI Layer**: ~20% (Playwright workflows, responsive viewports, theme switching).
