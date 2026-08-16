import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, Landmark, Sparkles, ChevronRight, Shield, Lock } from 'lucide-react';

const problems = [
  {
    emoji: '📋',
    title: 'A teacher calls in sick — 847 students get no class',
    detail: 'Manual phone calls for hours. No central system. No substitute. Half a school day lost in chaos.'
  },
  {
    emoji: '📄',
    title: 'Admission forms pile up on paper, unread for weeks',
    detail: 'Medical records, emergency contacts, permission slips — sitting forgotten in physical trays.'
  },
  {
    emoji: '🪪',
    title: 'Attendance fraud goes completely undetected',
    detail: 'Students hand physical ID cards to friends. No face check. Absences faked freely every single day.'
  }
];

const solutions = [
  {
    emoji: '⚡',
    title: 'AI solver assigns the right substitute in 0.3 seconds',
    detail: 'Google OR-Tools CP-SAT finds a conflict-free replacement teacher with zero scheduling overlaps.'
  },
  {
    emoji: '🔍',
    title: 'Gemini Vision reads any paper form — zero manual entry',
    detail: 'Drag a scanned form photo. AI extracts all data fields, flags smudges, and registers student.'
  },
  {
    emoji: '📷',
    title: 'Face verification blocks buddy-punching at the door',
    detail: 'ID card scan + live webcam facial verification. Both must match. Zero fraud allowed.'
  }
];

export default function IntroScreen({ onComplete }) {
  const [phase, setPhase] = useState('gate'); // gate -> logo -> problem -> flash -> solution -> brand
  const [gatesOpened, setGatesOpened] = useState(false);
  const [exiting, setExiting] = useState(false);
  const canvasRef = useRef(null);

  // Background Canvas Ambient Particles Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.5 - 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${p.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgb(16, 185, 129)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Sequence Timers (Automated transitions -> Auto-Dashboard Entry)
  useEffect(() => {
    // Open 3D Gates after 300ms
    const gateTimer = setTimeout(() => setGatesOpened(true), 300);

    const timers = [
      gateTimer,
      setTimeout(() => setPhase('logo'), 3000),      // 3.0s: Gates swing open -> Logo appears
      setTimeout(() => setPhase('problem'), 6800),   // 6.8s: Problem Cards (What Problem)
      setTimeout(() => setPhase('flash'), 13500),    // 13.5s: Flash transition
      setTimeout(() => setPhase('solution'), 13800), // 13.8s: Solution Cards (What We Have Done)
      setTimeout(() => setPhase('brand'), 20500),    // 20.5s: Final Brand Reveal & Progress bar
      setTimeout(() => triggerExit(), 23500),       // 23.5s: Auto-exit to System Dashboard
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const triggerExit = () => {
    setExiting(true);
    setTimeout(onComplete, 950);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950 flex items-center justify-center overflow-hidden font-sans ${exiting ? 'opacity-0 transition-opacity duration-1000 pointer-events-none' : ''}`}>
      {/* Background Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Top Right Skip Intro Button */}
      <button 
        onClick={triggerExit}
        className="absolute top-6 right-6 z-40 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono rounded-xl border border-slate-700/60 shadow-lg transition cursor-pointer flex items-center gap-1.5"
      >
        <span>Skip Intro & Enter System</span>
        <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
      </button>

      {/* ── 3D SCHOOL ENTRANCE GATES ── */}
      <div className={`relative w-full h-full flex items-center justify-center gate-viewport ${gatesOpened ? 'gate-open' : ''}`}>
        {/* Left Gate Door */}
        <div className="gate-door-left absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-r-4 border-amber-500/40 z-20 flex flex-col justify-between p-12 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-white tracking-wide">VICTORY HIGH SCHOOL</h4>
              <p className="text-[10px] text-amber-400 font-mono">EST. 2026 • CBFC ACCREDITED</p>
            </div>
          </div>

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

        {/* Right Gate Door */}
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

        {/* ── PHASE 1: GATES OPENING REVEAL ── */}
        {phase === 'gate' && (
          <div className="z-10 text-center space-y-4" style={{ animation: 'introFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-2xl" style={{ animation: 'logoPulse 2s ease-in-out infinite' }}>
              <Landmark className="w-10 h-10" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
              Welcome to
            </p>
            <h1 className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Victory High School
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Campus Gates Opening...
            </p>
          </div>
        )}

        {/* ── PHASE 2: LOGO & PLATFORM REVEAL ── */}
        {phase === 'logo' && (
          <div className="z-10 text-center space-y-4 max-w-lg px-6" style={{ animation: 'introFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center mx-auto text-white shadow-2xl border border-white/20" style={{ animation: 'logoPulse 2s ease-in-out infinite' }}>
              <GraduationCap className="w-10 h-10" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">
              Future Ready Hackathon 2026
            </p>
            <h1 className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              EduFlow OS
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
              Autonomous AI School Management & Operations Portal
            </p>
            <p className="text-xs text-emerald-400 font-semibold font-mono">
              Victory High School • Digital Campus
            </p>
          </div>
        )}

        {/* ── PHASE 3: WHAT PROBLEM (THE CHALLENGE IN SCHOOLS TODAY) ── */}
        {phase === 'problem' && (
          <div className="z-10 max-w-2xl w-full px-6 space-y-6" style={{ animation: 'introFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono">
                The Challenge in Schools Today
              </p>
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Legacy Systems Break Down Every Single Morning
              </h2>
            </div>

            <div className="space-y-3">
              {problems.map((p, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 border-l-4 border-l-rose-500 flex items-start gap-4 shadow-xl" style={{ animation: `cardSlideIn 0.5s cubic-bezier(0.16,1,0.3,1) ${idx * 0.22}s both` }}>
                  <span className="text-2xl">{p.emoji}</span>
                  <div>
                    <h4 className="text-sm font-bold text-rose-300">{p.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FLASH TRANSITION ── */}
        {phase === 'flash' && (
          <div className="absolute inset-0 bg-slate-950 z-30" style={{ animation: 'flashPulse 0.3s ease-out both' }} />
        )}

        {/* ── PHASE 4: WHAT WE HAVE DONE (HOW EDUFLOW SOLVES IT) ── */}
        {phase === 'solution' && (
          <div className="z-10 max-w-2xl w-full px-6 space-y-6" style={{ animation: 'introFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                How EduFlow Solves It
              </p>
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Autonomous AI Operations Engine
              </h2>
            </div>

            <div className="space-y-3">
              {solutions.map((s, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 border-l-4 border-l-emerald-500 flex items-start gap-4 shadow-xl" style={{ animation: `cardSlideIn 0.5s cubic-bezier(0.16,1,0.3,1) ${idx * 0.22}s both` }}>
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">{s.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PHASE 5: FINAL BRAND REVEAL & AUTO DASHBOARD ENTRY ── */}
        {phase === 'brand' && (
          <div className="z-10 text-center space-y-5 max-w-md px-6" style={{ animation: 'introFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center mx-auto text-white shadow-2xl border border-white/20">
              <GraduationCap className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                EduFlow OS
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Entering Live Campus Dashboard...
              </p>
            </div>

            {/* Loading Progress Bar */}
            <div className="w-56 h-1 rounded-full bg-slate-800 mx-auto overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500" 
                style={{ animation: 'progressBar 2.4s cubic-bezier(0.16,1,0.3,1) forwards' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
