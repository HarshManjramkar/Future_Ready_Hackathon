#!/usr/bin/env bash
# ==============================================================================
# EduFlow OS - Automated Test Suite Runner
# Runs 60+ Unit, Integration, Constraint Solver, VLM Parser, and Security Tests
# ==============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "========================================================"
echo "⚡ EduFlow OS: Running Automated Test Suites"
echo "========================================================"

echo "--> 1. Running Python Unit, Integration & Solver Test Suite..."
python3 -m unittest discover tests

echo ""
echo "--> 2. Running Frontend & Browser Integrity Checks..."
bash scripts/playwright_browser_qa.sh

echo ""
echo "========================================================"
echo "✅ All EduFlow OS Test Suites Passed Cleanly!"
echo "========================================================"
exit 0
