import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2, Zap } from 'lucide-react';

const problems = [
  { emoji: '📋', title: 'A teacher calls in sick — 800+ students lose class', detail: 'Hours of phone calls. No central substitute pool. Half a school day lost.' },
  { emoji: '📄', title: 'Paper admission forms pile up unread for weeks', detail: 'Medical records and slips sitting forgotten in physical filing trays.' },
  { emoji: '🪪', title: 'Attendance proxy fraud goes completely undetected', detail: 'Students swap physical ID cards. No biometric or face verification.' }
];

const solutions = [
  { emoji: '⚡', title: 'AI solver assigns optimal substitute in <0.05s', detail: 'Google OR-Tools CP-SAT finds conflict-free replacement with zero overlaps.' },
  { emoji: '🔍', title: 'Gemini Vision reads any paper form zero-shot', detail: 'Scanned image &rarr; instant structured JSON. Low-confidence auto-flagged to review.' },
  { emoji: '📷', title: 'Face verification blocks buddy-punching at $0 cost', detail: 'ID scan + live webcam face check. Both must match. 100% software solution.' }
];

export default function IntroProblemSolution({ onComplete, phase, setPhase }) {
  return (
    <div className="z-30 max-w-4xl w-full p-6 space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
          The Problem vs The Autonomous Fix
        </span>
        <h2 className="text-2xl font-extrabold text-white" style={{ fontFamily: 'var(--font-display)' }}>
          Why Schools Need an Autonomous Operating System
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problems Column */}
        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 space-y-4 bg-slate-950/80">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block">Manual School Operations</span>
          {problems.map((p, idx) => (
            <div key={idx} className="p-3 rounded-xl app-subcard space-y-1">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-2">
                <span>{p.emoji}</span> {p.title}
              </span>
              <p className="text-[11px] text-slate-400">{p.detail}</p>
            </div>
          ))}
        </div>

        {/* Solutions Column */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 space-y-4 bg-slate-950/80">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">EduFlow Autonomous Engine</span>
          {solutions.map((s, idx) => (
            <div key={idx} className="p-3 rounded-xl app-subcard space-y-1">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                <span>{s.emoji}</span> {s.title}
              </span>
              <p className="text-[11px] text-slate-400">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={onComplete}
          className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-xl flex items-center gap-2 mx-auto cursor-pointer transition transform hover:scale-105"
        >
          <span>Launch EduFlow Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
