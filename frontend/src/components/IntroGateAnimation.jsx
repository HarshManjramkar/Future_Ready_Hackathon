import React from 'react';
import { Shield, Sparkles, Building2, ChevronRight, Lock } from 'lucide-react';

export default function IntroGateAnimation({ gatesOpened, openGates, phase }) {
  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden gate-viewport ${gatesOpened ? 'gate-open' : ''}`}>
      {/* 3D Left School Entrance Door */}
      <div className="gate-door-left absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-r-4 border-amber-500/40 z-20 flex flex-col justify-between p-12 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white tracking-wide">VICTORY HIGH SCHOOL</h4>
            <p className="text-[10px] text-amber-400 font-mono">EST. 2026 • CBFC ACCREDITED</p>
          </div>
        </div>

        {/* Door Crest & Pillar Design */}
        <div className="my-auto text-right pr-6 space-y-3 opacity-80">
          <div className="w-24 h-24 rounded-full bg-amber-500/5 border-2 border-amber-500/30 ml-auto flex items-center justify-center shadow-inner">
            <Shield className="w-12 h-12 text-amber-400/90" />
          </div>
          <p className="text-xs font-serif italic text-slate-400">"Excellence Through Intelligence"</p>
        </div>

        <div className="text-xs font-mono text-slate-500">
          SECURE MAIN GATES • NORTH WING
        </div>
      </div>

      {/* 3D Right School Entrance Door */}
      <div className="gate-door-right absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-950 via-slate-900 to-slate-950 border-l-4 border-amber-500/40 z-20 flex flex-col justify-between p-12 shadow-2xl">
        <div className="flex items-center justify-end gap-3">
          <div className="text-right">
            <h4 className="text-sm font-extrabold text-emerald-400 tracking-wide">EduFlow OS</h4>
            <p className="text-[10px] text-slate-400 font-mono">AUTONOMOUS CAMPUS ENGINE</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Right Door Crest & Pillar Design */}
        <div className="my-auto text-left pl-6 space-y-3 opacity-80">
          <div className="w-24 h-24 rounded-full bg-emerald-500/5 border-2 border-emerald-500/30 flex items-center justify-center shadow-inner">
            <Lock className="w-12 h-12 text-emerald-400/90" />
          </div>
          <p className="text-xs font-mono text-emerald-400/80">Google Gemini VLM • OR-Tools Engine</p>
        </div>

        <div className="text-xs font-mono text-slate-500 text-right">
          STATUS: ONLINE • SYSTEM ACTIVE
        </div>
      </div>

      {/* Center Gate Lock & Open Button */}
      {!gatesOpened && (
        <div className="z-30 text-center space-y-5 max-w-md px-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-500/50 flex items-center justify-center mx-auto text-amber-400 shadow-2xl animate-pulse">
            <Building2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              VICTORY HIGH SCHOOL
            </h2>
            <p className="text-xs text-amber-400 font-semibold mt-1 uppercase tracking-widest">
              Autonomous School Operating System
            </p>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
            Click below to swing open the 3D School Entrance Gates and initialize EduFlow OS.
          </p>

          <button
            onClick={openGates}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-2xl cursor-pointer transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Open School Gates & Enter Campus</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
