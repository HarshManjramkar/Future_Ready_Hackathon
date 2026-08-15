import React, { useState, useEffect } from 'react';
import StatsGrid from './StatsGrid';
import RiskAnalysisWidget from './RiskAnalysisWidget';
import QuickActionHub from './QuickActionHub';

export default function DashboardOverview({
  setActiveTab,
  unreviewedCount,
  onTriggerTour,
  onShowArch
}) {
  const [riskData, setRiskData] = useState([]);
  const [stats, setStats] = useState({
    total_enrollment: 17,
    new_admissions: 0,
    attendance_percentage: 0.0,
    present_count: 0,
    kiosk_students_count: 17,
    schedule_conflicts: 0,
    unreviewed_inbox_count: unreviewedCount
  });

  useEffect(() => {
    fetchDashboardStats();
    fetchRiskData();
  }, [unreviewedCount]);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRiskData = async () => {
    try {
      const res = await fetch('/api/students/predict-risk');
      const data = await res.json();
      setRiskData(data.risk_factors || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-7 space-y-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-sky-400">School Operations Control</span>
        <h1 className="text-2xl font-extrabold mt-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Campus Operations & Live Invariant Engine
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          Real-time telemetry across Multimodal VLM intake, OR-Tools timetable status, and Smart Kiosk attendance gates.
        </p>
      </div>

      {/* 4-KPI Bento Grid */}
      <StatsGrid stats={stats} setActiveTab={setActiveTab} />

      {/* Predictive Risk Widget */}
      <RiskAnalysisWidget riskData={riskData} setActiveTab={setActiveTab} />

      {/* Quick Action Navigation Hub */}
      <QuickActionHub setActiveTab={setActiveTab} onTriggerTour={onTriggerTour} onShowArch={onShowArch} />
    </div>
  );
}
