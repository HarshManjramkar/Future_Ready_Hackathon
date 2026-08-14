import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Calendar,
  FileText,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  BrainCircuit,
  CornerDownRight,
  Cpu,
  Clock,
  Check
} from 'lucide-react';

export default function DashboardOverview({
  setActiveTab,
  unreviewedCount,
  activeTheme,
  setActiveTheme,
  onTriggerTour,
  onShowArch
}) {
  const [riskData, setRiskData] = useState([]);
  const [loadingRisk, setLoadingRisk] = useState(true);
  const [timeStr, setTimeStr] = useState('');

  const [stats, setStats] = useState({
    total_enrollment: 125,
    new_admissions: 0,
    attendance_percentage: 0.0,
    present_count: 0,
    kiosk_students_count: 5,
    schedule_conflicts: 0,
    unreviewed_inbox_count: unreviewedCount
  });

  useEffect(() => {
    fetchRiskData();
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const fetchRiskData = async () => {
    try {
      const res = await fetch('/api/students/predict-risk');
      const data = await res.json();
      setRiskData(data.risk_factors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRisk(false);
    }
  };

  const themes = [
    { id: 'emerald',  name: 'Emerald Forest', dot: '#10b981' },
    { id: 'midnight', name: 'Midnight',        dot: '#6366f1' },
    { id: 'stone',    name: 'Warm Stone',      dot: '#0f766e' },
  ];

  const riskColor = (level) => {
    if (level === 'HIGH')   return { text: '#f87171', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.2)',   bar: '#ef4444' };
    if (level === 'MEDIUM') return { text: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)', bar: '#f59e0b' };
    return                         { text: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)', bar: '#10b981' };
  };

  return (
    <div className="p-7 space-y-6 max-w-7xl mx-auto">

      {/* ── SECTION HEADER ── */}
      <div className="animate-fade-up">
        <p className="editorial-label mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
          School Management System
        </p>
        <h1 className="display-heading text-xl" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          School Operations Overview
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.6, fontFamily: 'var(--font-body)' }}>
          Monday, August 2026 &nbsp;·&nbsp; Victory High School
        </p>
      </div>

      {/* ── BENTO GRID ROW 1: KPI STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up-delay-1">
        {/* Hero Stat: Attendance */}
        <div className="bento-cell-hero lg:col-span-1 p-5 flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="editorial-label" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>Today's Attendance</span>
            <UserCheck className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
          </div>
          <div>
            <p className="display-heading text-2xl mt-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {stats.attendance_percentage}<span className="text-lg">%</span>
            </p>
            <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: 'var(--accent-color)', fontFamily: 'var(--font-body)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              {stats.present_count} / {stats.kiosk_students_count} Face-Verified
            </p>
          </div>
        </div>

        {/* Stat: Enrollment */}
        <div className="bento-cell p-5 flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="editorial-label" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>Enrollment</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="display-heading text-2xl mt-3" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {stats.total_enrollment}
            </p>
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-secondary)', opacity: 0.5, fontFamily: 'var(--font-body)' }}>
              +{stats.new_admissions} verified admissions
            </p>
          </div>
        </div>

        {/* Stat: Scheduling Conflicts */}
        <div className="bento-cell p-5 flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="editorial-label" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>Schedule Conflicts</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="display-heading text-2xl mt-3" style={{ color: stats.schedule_conflicts > 0 ? '#f87171' : '#34d399', fontFamily: 'var(--font-display)' }}>
              {stats.schedule_conflicts}
            </p>
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-secondary)', opacity: 0.5, fontFamily: 'var(--font-body)' }}>
              {stats.schedule_conflicts > 0 ? 'Action Needed' : 'Auto-solver active'}
            </p>
          </div>
        </div>

        {/* Stat: Admin Inbox */}
        <div className="bento-cell p-5 flex flex-col justify-between min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="editorial-label" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>Admin Inbox</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="display-heading text-2xl mt-3" style={{ color: stats.unreviewed_inbox_count > 0 ? '#fbbf24' : 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {stats.unreviewed_inbox_count}
            </p>
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-secondary)', opacity: 0.5, fontFamily: 'var(--font-body)' }}>
              Forms pending review
            </p>
          </div>
        </div>
      </div>

      {/* ── BENTO GRID ROW 2: RISK + CONTROL PANELS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up-delay-2">

        {/* Academic Risk Panel — spans 2 cols */}
        <div className="lg:col-span-2 bento-cell p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)' }}>
                <BrainCircuit className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                  Academic Risk Monitor
                </h3>
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
                  Predictive truancy flags · Updated live
                </p>
              </div>
            </div>
            <span className="editorial-label px-2.5 py-1 rounded-full"
              style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              AI Active
            </span>
          </div>

          {loadingRisk ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {riskData.map((factor) => {
                const c = riskColor(factor.risk_level);
                return (
                  <div key={factor.id} className="p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                          {factor.name}
                        </span>
                        <span className="editorial-label px-2 py-0.5 rounded-full"
                          style={{ color: c.text, background: `${c.bg}`, border: `1px solid ${c.border}` }}>
                          {factor.risk_level} Risk
                        </span>
                      </div>
                      <div className="risk-bar-track w-full max-w-xs">
                        <div className="risk-bar-fill" style={{ width: `${factor.risk_score}%`, background: c.bar }} />
                      </div>
                      <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>
                        <CornerDownRight className="w-3 h-3 shrink-0" />
                        <span style={{ fontFamily: 'var(--font-body)' }}>{factor.recommendation}</span>
                      </div>
                    </div>
                    <p className="display-heading text-lg shrink-0" style={{ color: c.text, fontFamily: 'var(--font-display)' }}>
                      {factor.risk_score}%
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: 2 micro bento cells stacked */}
        <div className="flex flex-col gap-4">

          {/* Live Clock + System Status */}
          <div className="bento-cell p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="editorial-label" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>System Clock</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <p className="display-heading text-lg" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {timeStr || '--:--:--'}
            </p>
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: '#34d399' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span style={{ fontFamily: 'var(--font-mono)' }}>Backend Online</span>
            </div>
          </div>

          {/* Theme Switcher */}
          <div className="bento-cell p-5 flex flex-col gap-3 flex-1">
            <div className="flex items-center justify-between">
              <span className="editorial-label" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>Appearance</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="space-y-2">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTheme(t.id)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer transition-all"
                  style={{
                    background: activeTheme === t.id ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${activeTheme === t.id ? 'var(--accent-color)' : 'var(--panel-border)'}`,
                    color: activeTheme === t.id ? 'var(--accent-color)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.dot }} />
                    {t.name}
                  </div>
                  {activeTheme === t.id && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BENTO GRID ROW 3: ALERT BANNER + QUICK ACTIONS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up-delay-3">

        {/* Proactive Alert Banner */}
        <div className="lg:col-span-2 bento-cell p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ borderLeft: '3px solid #f59e0b' }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: 'rgba(245,158,11,0.12)' }}>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="editorial-label" style={{ color: '#fbbf24' }}>Timetable Event</span>
                <span className="editorial-label" style={{ color: 'var(--text-secondary)', opacity: 0.4 }}>· Substitute Loop</span>
              </div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                Dr. Ramesh Verma Leave Notice Detected
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)', opacity: 0.6, fontFamily: 'var(--font-body)' }}>
                Substitute allocated for Monday Periods 1 & 3 with zero scheduling overlaps.
              </p>
            </div>
          </div>
          <button onClick={() => setActiveTab('timetable')}
            className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer shrink-0"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)', fontFamily: 'var(--font-body)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}
          >
            Open Solver <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Nav Links */}
        <div className="bento-cell p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <span className="editorial-label" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>Navigate To</span>
          </div>
          {[
            { label: 'Document Scanner', tab: 'dropzone', accent: 'var(--accent-color)' },
            { label: 'Timetable & Substitutes', tab: 'timetable', accent: '#6366f1' },
            { label: 'Attendance Kiosk', tab: 'kiosk', accent: '#34d399' },
          ].map(link => (
            <button key={link.tab}
              onClick={() => setActiveTab(link.tab)}
              className="w-full p-3 rounded-xl text-left flex items-center justify-between text-xs font-medium cursor-pointer transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = link.accent; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--panel-border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            >
              {link.label}
              <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: link.accent }} />
            </button>
          ))}
        </div>
      </div>

      {/* ── BENTO GRID ROW 4: GUIDED TOUR + ARCH SPEC ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up-delay-4">

        {/* Guided Tour */}
        <div className="bento-cell-hero p-6 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                <Zap className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
              </div>
              <span className="editorial-label" style={{ color: 'var(--accent-color)' }}>60-Second Demo</span>
            </div>
            <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
              Interactive Guided Tour
            </h3>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)', opacity: 0.5, fontFamily: 'var(--font-body)' }}>
              Step-by-step walkthrough of all AI-powered school operations.
            </p>
          </div>
          <button onClick={onTriggerTour}
            className="w-full py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer"
            style={{ background: 'var(--accent-color)', color: '#fff', fontFamily: 'var(--font-body)' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Launch Tour
          </button>
        </div>

        {/* Architecture Spec */}
        <div className="bento-cell p-6 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <span className="editorial-label text-indigo-400">System Architecture</span>
            </div>
            <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
              Technical Specification
            </h3>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)', opacity: 0.5, fontFamily: 'var(--font-body)' }}>
              OR-Tools constraints, Gemini Vision prompts, and CV privacy parameters.
            </p>
          </div>
          <button onClick={onShowArch}
            className="w-full py-2.5 rounded-xl font-semibold text-sm transition cursor-pointer"
            style={{ background: 'rgba(99,102,241,0.12)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.3)', fontFamily: 'var(--font-body)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
          >
            View Spec Document
          </button>
        </div>
      </div>

    </div>
  );
}
