import React from 'react';
import { Landmark, Sparkles } from 'lucide-react';

export default function IntroGateAnimation({ gatesOpened, openGates, phase }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Left School Gate Door */}
      <div className={`absolute top-0 left-0 w-1/2 h-full bg-slate-950/95 border-r border-emerald-500/30 transition-transform duration-1000 z-20 flex items-center justify-end pr-12 ${
        gatesOpened ? '-translate-x-full' : 'translate-x-0'
      }`}>
        <div className="text-right space-y-2 opacity-60">
          <Landmark className="w-16 h-16 text-emerald-500 ml-auto" />
          <p className="text-xs font-mono text-emerald-400">VICTORY HIGH SCHOOL</p>
        </div>
      </div>

      {/* Right School Gate Door */}
      <div className={`absolute top-0 right-0 w-1/2 h-full bg-slate-950/95 border-l border-emerald-500/30 transition-transform duration-1000 z-20 flex items-center justify-start pl-12 ${
        gatesOpened ? 'translate-x-full' : 'translate-x-0'
      }`}>
        <div className="text-left space-y-2 opacity-60">
          <Sparkles className="w-16 h-16 text-emerald-500" />
          <p className="text-xs font-mono text-emerald-400">EST. 2026 • AUTONOMOUS CAMPUS</p>
        </div>
      </div>

      {/* Center Gate Opener Button */}
      {!gatesOpened && (
        <div className="z-30 text-center space-y-4">
          <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse mx-auto w-16 h-16 flex items-center justify-center">
            <Landmark className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Welcome to EduFlow OS
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Autonomous School Operations • Google Gemini VLM • OR-Tools Optimization
          </p>
          <button
            onClick={openGates}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg cursor-pointer transition transform hover:scale-105"
          >
            Enter School Campus &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
