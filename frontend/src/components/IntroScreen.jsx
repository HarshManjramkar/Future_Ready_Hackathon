import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, Landmark, Sparkles, ArrowRight } from 'lucide-react';

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
        ctx.shadowColor = '#10b981';
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

  // Sequence Timers (+2.5 to +3s per phase for relaxed reading)
  useEffect(() => {
    // Open 3D Gates after 300ms
    const gateTimer = setTimeout(() => setGatesOpened(true), 300);

    const timers = [
      gateTimer,
      setTimeout(() => setPhase('logo'), 3000),      // 3.0s: Gates swing open -> Logo appears
      setTimeout(() => setPhase('problem'), 6800),   // 6.8s: Problem Cards (6.7s reading time)
      setTimeout(() => setPhase('flash'), 13500),    // 13.5s: Flash transition
      setTimeout(() => setPhase('solution'), 13800), // 13.8s: Solution Cards (6.7s reading time)
      setTimeout(() => setPhase('brand'), 20500),    // 20.5s: Final Brand Reveal & Progress bar
      setTimeout(() => triggerExit(), 23500),       // 23.5s: Auto-exit
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const triggerExit = () => {
    setExiting(true);
    setTimeout(onComplete, 950);
  };

  const wrapStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: '#020710',
    backgroundImage: 'radial-gradient(rgba(16,185,129,0.08) 1.5px, transparent 1.5px)',
    backgroundSize: '24px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontFamily: "'IBM Plex Sans','Inter',system-ui,sans-serif",
    animation: exiting ? 'introWipeUp 0.95s cubic-bezier(0.76,0,0.24,1) forwards' : 'none',
  };

  return (
    <div style={wrapStyle} className={`gate-viewport ${gatesOpened ? 'gate-open' : ''}`}>

      {/* Particle Canvas Background */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
      />

      {/* Radial Depth Light Glow behind doors */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        background: 'radial-gradient(ellipse 900px 600px at 50% 50%, rgba(16,185,129,0.08), rgba(3,11,20,0.95))',
      }} />

      {/* Skip Button */}
      <button
        onClick={triggerExit}
        style={{
          position: 'absolute', top: 22, right: 26, zIndex: 30,
          display: 'flex', itemsCenter: 'center', gap: 6,
          padding: '6px 16px', borderRadius: 999,
          border: '1px solid rgba(16,185,129,0.3)',
          background: 'rgba(3,28,21,0.8)',
          color: '#34d399',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; e.currentTarget.style.color = '#ffffff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(3,28,21,0.8)'; e.currentTarget.style.color = '#34d399'; }}
      >
        <span>Enter System</span>
        <ArrowRight size={13} />
      </button>

      {/* Progress indicators */}
      <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 7, zIndex: 30 }}>
        {['gate', 'logo', 'problem', 'solution', 'brand'].map((p, i) => {
          const activeIdx = ['gate', 'logo', 'problem', 'solution', 'brand'].indexOf(phase === 'flash' ? 'problem' : phase);
          return (
            <div key={p} style={{
              width: activeIdx === i ? 22 : 6, height: 6, borderRadius: 999,
              background: activeIdx === i ? '#10b981' : 'rgba(255,255,255,0.15)',
              transition: 'all 0.4s ease',
              boxShadow: activeIdx === i ? '0 0 8px #10b981' : 'none'
            }} />
          );
        })}
      </div>

      {/* ── 3D SCHOOL GATE OVERLAY DOORS ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
        display: 'flex', width: '100%', height: '100%', overflow: 'hidden'
      }}>
        {/* Left Gate Door */}
        <div className="gate-door-left" style={{
          width: '50%', height: '100%',
          background: 'linear-gradient(135deg, #02120e 0%, #061e17 100%)',
          borderRight: '3px solid #10b981',
          boxShadow: '15px 0 50px rgba(0,0,0,0.8)',
          position: 'relative',
          display: 'flex', flexDirection: 'column', justify: 'space-between', padding: '40px 30px'
        }}>
          {/* Iron Grill Bars pattern */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.15,
            backgroundImage: 'repeating-linear-gradient(90deg, #10b981, #10b981 2px, transparent 2px, transparent 40px)',
          }} />
          {/* Left Crest Half */}
          <div style={{
            position: 'absolute', right: -25, top: '50%', transform: 'translateY(-50%)',
            width: 50, height: 50, borderRadius: '50%',
            background: '#10b981', border: '3px solid #34d399',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16,185,129,0.5)'
          }}>
            <Landmark size={24} color="#02140f" />
          </div>
        </div>

        {/* Right Gate Door */}
        <div className="gate-door-right" style={{
          width: '50%', height: '100%',
          background: 'linear-gradient(225deg, #02120e 0%, #061e17 100%)',
          borderLeft: '3px solid #10b981',
          boxShadow: '-15px 0 50px rgba(0,0,0,0.8)',
          position: 'relative',
          display: 'flex', flexDirection: 'column', justify: 'space-between', padding: '40px 30px'
        }}>
          {/* Iron Grill Bars pattern */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.15,
            backgroundImage: 'repeating-linear-gradient(90deg, #10b981, #10b981 2px, transparent 2px, transparent 40px)',
          }} />
          {/* Right Crest Half */}
          <div style={{
            position: 'absolute', left: -25, top: '50%', transform: 'translateY(-50%)',
            width: 50, height: 50, borderRadius: '50%',
            background: '#10b981', border: '3px solid #34d399',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16,185,129,0.5)'
          }}>
            <Sparkles size={24} color="#02140f" />
          </div>
        </div>
      </div>

      {/* ── CENTRAL CONTENT LAYERS ── */}
      <div style={{ position: 'relative', zIndex: 20, width: '100%', display: 'flex', justifyContent: 'center' }}>

        {/* ── GATE WELCOME ARCHWAY PHASE ── */}
        {phase === 'gate' && (
          <div style={{ textAlign: 'center', animation: 'introFadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div style={{
              width: 90, height: 90, borderRadius: 28, margin: '0 auto 24px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 70px rgba(16,185,129,0.5)',
              border: '2px solid rgba(52,211,153,0.4)',
              animation: 'logoPulse 2s ease-in-out infinite'
            }}>
              <Landmark size={48} color="white" strokeWidth={1.8} />
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#34d399', margin: '0 0 10px' }}>
              Welcome to
            </p>
            <h1 style={{ fontSize: 42, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
              Victory High School
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
              Campus Gates Opening...
            </p>
          </div>
        )}

        {/* ── LOGO & PLATFORM REVEAL PHASE ── */}
        {phase === 'logo' && (
          <div style={{ textAlign: 'center', animation: 'introFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24, margin: '0 auto 20px',
              background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 60px rgba(16,185,129,0.45)',
              border: '2px solid rgba(255,255,255,0.2)',
              animation: 'logoPulse 2s ease-in-out infinite',
            }}>
              <GraduationCap size={42} color="white" strokeWidth={1.8} />
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#10b981', margin: '0 0 10px' }}>
              Future Ready Hackathon 2026
            </p>
            <h1 style={{ fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              EduFlow OS
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', fontWeight: 400, margin: '0 0 6px' }}>
              Autonomous AI School Management & Operations Portal
            </p>
            <p style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>
              Victory High School • Smart Operations
            </p>
          </div>
        )}

        {/* ── PROBLEM PHASE (READING TIME: ~6.7 seconds) ── */}
        {phase === 'problem' && (
          <div style={{ width: '100%', maxWidth: 680, padding: '0 28px', animation: 'introFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f87171', margin: '0 0 8px' }}>
                The Challenge in Schools Today
              </p>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', margin: 0 }}>
                Legacy Systems Break Down Every Single Morning
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {problems.map((p, i) => (
                <div key={i} style={{
                  padding: '16px 20px',
                  background: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.22)',
                  borderLeft: '4px solid #ef4444',
                  borderRadius: 16,
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  animation: `cardSlideIn 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.22}s both`,
                }}>
                  <span style={{ fontSize: 22, lineHeight: '1.2', flexShrink: 0 }}>{p.emoji}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#fca5a5', margin: '0 0 4px' }}>{p.title}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>{p.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FLASH TRANSITION ── */}
        {phase === 'flash' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: '#030b14',
            animation: 'flashPulse 0.3s ease-out both',
          }} />
        )}

        {/* ── SOLUTION PHASE (READING TIME: ~6.7 seconds) ── */}
        {phase === 'solution' && (
          <div style={{ width: '100%', maxWidth: 680, padding: '0 28px', animation: 'introFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#34d399', margin: '0 0 8px' }}>
                How EduFlow Solves It
              </p>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', margin: 0 }}>
                Autonomous AI Operations Engine
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {solutions.map((s, i) => (
                <div key={i} style={{
                  padding: '16px 20px',
                  background: 'rgba(16,185,129,0.07)',
                  border: '1px solid rgba(16,185,129,0.22)',
                  borderLeft: '4px solid #10b981',
                  borderRadius: 16,
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  animation: `cardSlideIn 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.22}s both`,
                }}>
                  <span style={{ fontSize: 22, lineHeight: '1.2', flexShrink: 0 }}>{s.emoji}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#6ee7b7', margin: '0 0 4px' }}>{s.title}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.6 }}>{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FINAL BRAND REVEAL PHASE ── */}
        {phase === 'brand' && (
          <div style={{ textAlign: 'center', animation: 'introFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div style={{
              width: 76, height: 76, borderRadius: 22, margin: '0 auto 20px',
              background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 90px rgba(16,185,129,0.5)',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              <GraduationCap size={40} color="white" strokeWidth={1.8} />
            </div>

            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
              EduFlow OS
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: '0 0 24px' }}>
              Entering Live Campus Dashboard...
            </p>

            {/* Loading bar */}
            <div style={{
              width: 220, height: 3, borderRadius: 999,
              background: 'rgba(255,255,255,0.08)',
              margin: '0 auto', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 999,
                background: 'linear-gradient(90deg, #10b981, #6366f1)',
                animation: 'progressBar 2.4s cubic-bezier(0.16,1,0.3,1) forwards',
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
