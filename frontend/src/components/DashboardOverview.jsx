import React, { useState, useEffect } from 'react';
import { Sparkles, Check } from 'lucide-react';
import StatsGrid from './StatsGrid';
import RiskAnalysisWidget from './RiskAnalysisWidget';

export default function DashboardOverview({
  setActiveTab,
  unreviewedCount,
  onTriggerTour,
  onShowArch,
  activeTheme,
  setActiveTheme
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

  const themes = [
    { id: 'emerald', name: 'Emerald Forest', dot: '#10b981' },
    { id: 'midnight', name: 'Midnight Tactical', dot: '#6366f1' },
    { id: 'stone', name: 'Warm Stone', dot: '#f59e0b' }
  ];

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
      {/* Section Header with Theme Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">School Operations Control</span>
          <h1 className="text-2xl font-extrabold mt-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Campus Operations & Live Invariant Engine
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Real-time telemetry across Multimodal VLM intake, OR-Tools timetable status, and Smart Kiosk attendance gates.
          </p>
        </div>

        {/* Theme Switcher Card */}
        <div className="glass-panel p-3.5 rounded-2xl flex items-center gap-2 border border-slate-800 shrink-0">
          <div className="flex items-center gap-1.5 px-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="editorial-label text-[10px]" style={{ color: 'var(--text-secondary)' }}>Theme:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTheme && setActiveTheme(t.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTheme === t.id 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' 
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.dot }} />
                <span>{t.name.split(' ')[0]}</span>
                {activeTheme === t.id && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4-KPI Bento Grid */}
      <StatsGrid stats={stats} setActiveTab={setActiveTab} />

      {/* Predictive Risk Widget */}
      <RiskAnalysisWidget riskData={riskData} setActiveTab={setActiveTab} />
    </div>
  );
}
