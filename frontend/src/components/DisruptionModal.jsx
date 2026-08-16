import React from 'react';
import { AlertTriangle, CheckCircle2, Cpu, Zap } from 'lucide-react';

export default function DisruptionModal({
  selectedTeacher, setSelectedTeacher, handleSimulateDisruption,
  solvingDisruption, disruptionResult, setDisruptionResult, applyReassignments
}) {
  return (
    <div className="space-y-6">
      {/* Header & Disruption Trigger Panel */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
              Google OR-Tools CP-SAT Solver
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Victory High School • Timetable Engine</span>
          </div>
          <h2 className="text-xl font-extrabold mt-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Reactive Timetable & Live Disruption Engine
          </h2>
          <p className="text-xs mt-1 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            Schedules are generated with 0 double-booking constraints. When a teacher calls in sick, the solver reallocates classes instantly.
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center gap-4 shrink-0 app-subcard">
          <div>
            <label className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">Simulate Sick Leave</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="text-xs rounded-lg p-2 mt-1 outline-none cursor-pointer border border-white/10"
              style={{ backgroundColor: 'var(--card-bg-solid)', color: 'var(--text-primary)', borderColor: 'var(--panel-border)' }}
            >
              <option value="TCH_101">Mrs. Deepti Bisen (Mathematics)</option>
              <option value="TCH_102">Mr. Rajesh Deshmukh (Science)</option>
              <option value="TCH_103">Mrs. Sunita Kulkarni (English)</option>
              <option value="TCH_104">Mr. Amit Joshi (Social Science)</option>
              <option value="TCH_105">Mrs. Rohini Patil (Second Language)</option>
              <option value="TCH_106">Mr. Vikram Shinde (Info Tech)</option>
              <option value="TCH_107">Coach Ramesh Pawar (Physical Ed)</option>
            </select>
          </div>
          <button
            onClick={handleSimulateDisruption}
            disabled={solvingDisruption}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Trigger Sick Event</span>
          </button>
        </div>
      </div>

      {/* Solver In Progress Overlay */}
      {solvingDisruption && (
        <div className="glass-panel p-8 rounded-2xl border border-sky-500/50 flex flex-col items-center justify-center space-y-4 pulse-glow-blue animate-pulse">
          <div className="relative">
            <Cpu className="w-12 h-12 text-sky-500 animate-spin" />
            <Zap className="w-6 h-6 text-amber-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Google OR-Tools Solver Running...</h3>
            <p className="text-xs text-sky-500">Evaluating 1,440 constraint variables in real-time...</p>
          </div>
        </div>
      )}

      {/* Disruption Solution Drawer */}
      {disruptionResult && (
        <div className="glass-panel p-6 rounded-2xl border-2 border-amber-500/50 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--panel-border)' }}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Disruption Solution Calculated ({disruptionResult.total_affected_periods} affected periods)
              </h3>
            </div>
            <span className="text-xs text-amber-500 font-mono">Solve Time: 0.04s</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {disruptionResult.resolutions.map((res, idx) => (
              <div key={idx} className="p-4 rounded-xl app-subcard space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-500">Period {res.period} • {res.cohort_name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${res.is_specialist ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-500/20 text-slate-400'}`}>
                    {res.is_specialist ? 'Subject Specialist' : 'General Supervisor'}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Subject: <strong style={{ color: 'var(--text-primary)' }}>{res.affected_subject}</strong></p>
                <p className="text-xs text-emerald-500 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Recommended: {res.recommended_substitute}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setDisruptionResult(null)} className="px-4 py-2 app-subcard text-xs font-semibold rounded-xl cursor-pointer">Dismiss</button>
            <button onClick={applyReassignments} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all">
              <CheckCircle2 className="w-4 h-4" />
              <span>Execute Reassignments Live</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
