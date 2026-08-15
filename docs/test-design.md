# 📐 Formal Test Design Specification (bmad-testarch-test-design)

## 1. Overview
This document formalizes test design using **Equivalence Partitioning (ECP)**, **Boundary Value Analysis (BVA)**, **Decision Tables**, and **State Transition Testing** across EduFlow OS.

---

## 2. Equivalence Partitioning (ECP) & Boundary Value Analysis (BVA)

### Domain 1: Vision Extraction Confidence & Routing
| Partition Class | Range / Value | Boundary Test Points | Expected Behavior |
|---|---|---|---|
| **Valid High Confidence** | $0.80 \le C \le 1.00$ | $0.80, 0.81, 0.95, 1.00$ | Direct commit, `requires_human_review = false` |
| **Edge / Smudged Low** | $0.00 \le C < 0.80$ | $0.00, 0.50, 0.79$ | Route to Human Review Inbox (`requires_human_review = true`) |
| **Invalid / Corrupt** | $C < 0.00 \lor C > 1.00$ | $-0.01, 1.01$ | Clamped to valid range or parse fallback |

### Domain 2: Truancy Risk Scoring Intervals
| Partition Class | Score Interval | Boundary Test Points | Assigned Risk Level |
|---|---|---|---|
| **Low Risk** | $0 \le S \le 39$ | $0, 24, 39$ | `LOW` (routine monitor) |
| **Medium Risk** | $40 \le S \le 69$ | $40, 45, 69$ | `MEDIUM` (credential review) |
| **High Risk** | $70 \le S \le 100$ | $70, 88, 100$ | `HIGH` (urgent counselor alert) |

---

## 3. Combinatorial Decision Tables

### Table 1: Smart Kiosk Anti-Cheat Dual Coincidence Check
| Condition 1: Face Detected | Condition 2: QR Token Valid | Condition 3: ID Registered in DB | Action 1: Status | Action 2: Green Flash | Action 3: Log Attendance |
|---|---|---|---|---|---|
| **TRUE** | **TRUE** | **TRUE** | `SUCCESS` | `TRUE` | Marked `PRESENT` + Confetti |
| **FALSE** | **TRUE** | **TRUE** | `REJECTED` | `FALSE` | `ABSENT` + Anti-Cheat Alert |
| **TRUE** | **FALSE** | **ANY** | `REJECTED` | `FALSE` | `ABSENT` + Unregistered Toast |
| **FALSE** | **FALSE** | **ANY** | `REJECTED` | `FALSE` | `ABSENT` + Anti-Cheat Alert |

### Table 2: Timetable Substitution Assignment Matrix
| Subject Specialist Free | Under Max Daily Periods (<5) | Action: Substitute Assignment |
|---|---|---|
| **TRUE** | **TRUE** | Assigned Subject Specialist (Score 10) |
| **FALSE** | **TRUE** | Assigned General Qualified Teacher (Score 5) |
| **FALSE** | **FALSE (All busy/capped)** | Assigned Study Hall / Library Supervisor (`SUB-LIBRARY`) |

---

## 4. State Transition Testing (FSM)

```
[ UNREVIEWED_QUEUE ] ──( 1-Click Verify )──> [ LIVE_STUDENT_DB ] (Status: ABSENT)
                                                    │
                                         ( Face + QR Coincidence )
                                                    ▼
                                          [ STATUS: PRESENT ]
```

1. **Document FSM**: `UNPROCESSED` $\rightarrow$ `PARSED` $\rightarrow$ `UNREVIEWED_QUEUE` $\rightarrow$ `VERIFIED_STUDENT_DB`
2. **Attendance FSM**: `ABSENT` $\rightarrow$ `PRESENT` (via verified scan) $\rightarrow$ `ABSENT` (via demo reset)
3. **Schedule FSM**: `FULL_SCHEDULE` $\rightarrow$ `DISRUPTION_EVENT` $\rightarrow$ `SOLVER_ENGINE` $\rightarrow$ `REASSIGNED_SCHEDULE`
