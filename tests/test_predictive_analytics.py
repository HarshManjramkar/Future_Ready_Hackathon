"""
EduFlow Predictive Analytics Test Suite (bmad-tea & Virat Innovation Suite).
Tests Staffing Capacity forecasting and Student Truancy Risk models.
"""
import unittest
import sys
from pathlib import Path
from unittest.mock import MagicMock

def mock_decorator(*args, **kwargs):
    def decorator(fn):
        return fn
    return decorator

if "fastapi" not in sys.modules:
    fastapi_mock = MagicMock()
    fastapi_mock.FastAPI.return_value.get = mock_decorator
    fastapi_mock.FastAPI.return_value.post = mock_decorator
    sys.modules["fastapi"] = fastapi_mock
    sys.modules["fastapi.middleware"] = MagicMock()
    sys.modules["fastapi.middleware.cors"] = MagicMock()

if "pydantic" not in sys.modules:
    pydantic_mock = MagicMock()
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
    pydantic_mock.BaseModel = BaseModel
    sys.modules["pydantic"] = pydantic_mock

for mod in ["ortools", "ortools.sat", "ortools.sat.python", "ortools.sat.python.cp_model", "PIL", "dotenv"]:
    if mod not in sys.modules:
        sys.modules[mod] = MagicMock()

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

if "app.main" in sys.modules:
    del sys.modules["app.main"]

import app.main as api_app


class TestPredictiveAnalytics(unittest.TestCase):
    """Deep validation of predictive algorithms and risk categorization."""

    def test_staffing_predictions_schema_and_values(self):
        """Verify staffing capacity forecasting metrics and department utilization."""
        res = api_app.predict_staffing()
        
        self.assertIn("predicted_absenteeism_rate", res)
        self.assertIn("high_risk_days", res)
        self.assertIsInstance(res["high_risk_days"], list)
        self.assertIn("Monday", res["high_risk_days"])
        self.assertGreater(res["recommended_substitute_pool"], 0)
        
        dept_loads = res.get("department_load", [])
        self.assertGreaterEqual(len(dept_loads), 3)
        for dept in dept_loads:
            self.assertIn("department", dept)
            self.assertIn("utilization", dept)
            self.assertIn(dept["status"], ["HIGH_LOAD", "OPTIMAL", "HEALTHY"])

    def test_student_risk_predictions_schema_and_boundaries(self):
        """Verify multi-factor truancy anomaly scoring and risk classifications."""
        res = api_app.predict_student_risk()
        
        self.assertIn("overall_risk_index", res)
        factors = res.get("risk_factors", [])
        self.assertGreaterEqual(len(factors), 3)
        
        for factor in factors:
            self.assertIn("id", factor)
            self.assertIn("name", factor)
            self.assertIn("grade", factor)
            self.assertIn("risk_score", factor)
            self.assertTrue(0 <= factor["risk_score"] <= 100)
            self.assertIn(factor["risk_level"], ["HIGH", "MEDIUM", "LOW"])
            self.assertIsInstance(factor["anomalies"], list)
            self.assertGreater(len(factor["anomalies"]), 0)
            self.assertTrue(len(factor["recommendation"]) > 5)

    def test_risk_score_to_level_mapping_invariants(self):
        """Verify risk score intervals correctly correspond to risk level categories."""
        res = api_app.predict_student_risk()
        for factor in res.get("risk_factors", []):
            score = factor["risk_score"]
            level = factor["risk_level"]
            if score >= 70:
                self.assertEqual(level, "HIGH")
            elif score >= 40:
                self.assertEqual(level, "MEDIUM")
            else:
                self.assertEqual(level, "LOW")


if __name__ == "__main__":
    unittest.main()
