import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Camera, QrCode, CheckCircle2, Check, CreditCard, AlertTriangle, Loader2 } from 'lucide-react';
import StudentIdCardModal from './StudentIdCardModal';

// ─── face-api.js model URL (tiny face detector, ~190KB) ─────────────────────
const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
const CIRCUMFERENCE = 2 * Math.PI * 54; // r=54 circle

export default function SmartKiosk() {
  const [cameraStatus, setCameraStatus]   = useState('STANDBY');
  const [modelStatus, setModelStatus]     = useState('loading');
  const [step, setStep]                   = useState(1);
  const [faceProgress, setFaceProgress]   = useState(0);   // 0–100
  const [faceDetected, setFaceDetected]   = useState(false);
  const [students, setStudents]           = useState([]);
  const [recentLogs, setRecentLogs]       = useState([]);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);

  const videoRef       = useRef(null);
  const streamRef      = useRef(null);
  const qrDetRef       = useRef(null);
  const qrRafRef       = useRef(null);
  const faceRafRef     = useRef(null);
  const studentsRef    = useRef([]);
  const isProcessing   = useRef(false);
  const lastScan       = useRef({ code: null, time: 0 });
  const studentRef     = useRef(null);
  const cleanIdRef     = useRef(null);
  const consecutiveRef = useRef(0);
  const faceApiReady   = useRef(false);
  const REQUIRED       = 15;

  useEffect(() => { studentsRef.current = students; }, [students]);

  useEffect(() => {
    fetchStudents();
    if (!('BarcodeDetector' in window)) { setCameraStatus('UNSUPPORTED'); return; }
    qrDetRef.current = new BarcodeDetector({ formats: ['qr_code'] });

    // Load face-api TinyFaceDetector weights
    (async () => {
      try {
        if (!window.faceapi) throw new Error('face-api.js not in window');
        await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        faceApiReady.current = true;
        setModelStatus('ready');
      } catch (e) {
        console.error('[FaceDetect]', e);
        setModelStatus('failed');
      }
    })();

    const onHide = () => { if (document.hidden) _stopCamera(); };
    document.addEventListener('visibilitychange', onHide);
    _startCamera();
    return () => { document.removeEventListener('visibilitychange', onHide); _stopCamera(); };
  }, []);

  const _startCamera = async () => {
    if (streamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current;
      if (!v) { stream.getTracks().forEach(t => t.stop()); return; }
      v.srcObject = stream;
      v.onloadedmetadata = async () => {
        try { await v.play(); setCameraStatus('ACTIVE'); _startQrLoop(); }
        catch (e) { if (e.name !== 'AbortError') console.warn(e); }
      };
    } catch (e) { console.error(e); setCameraStatus('STANDBY'); }
  };

  const _stopCamera = () => {
    [qrRafRef, faceRafRef].forEach(r => { if (r.current) { cancelAnimationFrame(r.current); r.current = null; } });
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (videoRef.current) { videoRef.current.onloadedmetadata = null; videoRef.current.srcObject = null; }
    setCameraStatus('STANDBY');
  };

  const _startQrLoop = () => {
    let last = 0;
    const loop = async (ts) => {
      qrRafRef.current = requestAnimationFrame(loop);
      if (ts - last < 120 || isProcessing.current) return;
      last = ts;
      const v = videoRef.current;
      if (!v || !qrDetRef.current || (v.readyState ?? 0) < 2) return;
      try {
        const hits = await qrDetRef.current.detect(v);
        if (hits.length) _handleQr(hits[0].rawValue);
      } catch (_) {}
    };
    qrRafRef.current = requestAnimationFrame(loop);
  };

  const _startFaceLoop = (cid) => {
    consecutiveRef.current = 0;
    setFaceProgress(0);
    setFaceDetected(false);
    let last = 0;

    const loop = async (ts) => {
      faceRafRef.current = requestAnimationFrame(loop);
      if (ts - last < 100) return;
      last = ts;
      const v = videoRef.current;
      if (!v || (v.readyState ?? 0) < 2) return;
      if (!faceApiReady.current || !window.faceapi) return;

      let hasFace = false;
      try {
        // Increased inputSize from 224 to 416 for much better full-frame accuracy
        const result = await window.faceapi.detectSingleFace(
          v, new window.faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 })
        );
        hasFace = !!result;
      } catch { return; }

      if (hasFace) {
        consecutiveRef.current = Math.min(REQUIRED, consecutiveRef.current + 1);
        const pct = Math.round((consecutiveRef.current / REQUIRED) * 100);
        setFaceProgress(pct);
        setFaceDetected(true);
        if (consecutiveRef.current >= REQUIRED) {
          cancelAnimationFrame(faceRafRef.current); faceRafRef.current = null;
          setFaceProgress(100);
          setTimeout(() => _commitAttendance(cid), 600);
        }
      } else {
        consecutiveRef.current = Math.max(0, consecutiveRef.current - 2);
        const pct = Math.round((consecutiveRef.current / REQUIRED) * 100);
        setFaceProgress(pct);
        if (consecutiveRef.current === 0) setFaceDetected(false);
      }
    };
    faceRafRef.current = requestAnimationFrame(loop);
  };

  const _handleQr = (raw) => {
    if (!studentsRef.current.length || isProcessing.current) return;
    const now = Date.now();
    if (lastScan.current.code === raw && now - lastScan.current.time < 4000) return;
    lastScan.current = { code: raw, time: now };

    let cid = raw.trim();
    if (cid.startsWith('{')) { try { cid = String(JSON.parse(cid).id || cid); } catch (_) {} }
    cid = cid.replace(/^(STU|EDU)-?/i, '').split('-')[0].trim();

    const student = studentsRef.current.find(s =>
      [s.id, s.student_id, s.roll_no, s.qr_code].map(String).includes(cid) ||
      String(s.qr_token) === raw.trim()
    );
    if (!student) { console.warn(`Unknown QR: ${raw} → ${cid}`); return; }

    isProcessing.current = true;
    cleanIdRef.current = cid;
    studentRef.current = student;
    if (qrRafRef.current) { cancelAnimationFrame(qrRafRef.current); qrRafRef.current = null; }

    fetch('/api/kiosk/verify-id', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qr_code: cid }),
    }).catch(() => {});

    setStep(2);
    _startFaceLoop(cid);
  };

  const _commitAttendance = async (cid) => {
    const s = studentRef.current;
    try {
      const res  = await fetch('/api/kiosk/attendance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: cid, face_detected: true }),
      });
      const data = await res.json();
      if (data.status === 'SUCCESS' || data.student) {
        setStep(3);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 }, colors: ['#10b981', '#34d399', '#fff'] });
        const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setRecentLogs(prev => [{ name: s?.name, id: cid, time: t, avatar: s?.avatar }, ...prev.slice(0, 4)]);
        fetchStudents();
        setTimeout(_reset, 4000);
      } else _reset();
    } catch { _reset(); }
  };

  const _reset = () => {
    setStep(1); setFaceProgress(0); setFaceDetected(false);
    consecutiveRef.current = 0;
    studentRef.current = null; cleanIdRef.current = null;
    isProcessing.current = false; lastScan.current = { code: null, time: 0 };
    if (cameraStatus === 'ACTIVE') setTimeout(_startQrLoop, 400);
  };

  const fetchStudents = async () => {
    try { const d = await fetch('/api/students').then(r => r.json()); setStudents(d.students || []); } catch (_) {}
  };

  const s            = studentRef.current;
  const presentCount = students.filter(s => s.attendance_status === 'PRESENT').length;
  const totalCount   = students.length || 17;
  const rate         = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '0.0';

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 font-sans select-none">

      {/* ── Raw video ── */}
      <video ref={videoRef} muted playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${cameraStatus === 'ACTIVE' ? 'opacity-90' : 'opacity-0'}`}
        style={{ zIndex: 0 }} />

      {/* ── Ambient layer — tints whole frame on step change ── */}
      <div className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          zIndex: 1,
          background:
            step === 3 ? 'radial-gradient(ellipse 100% 80% at 50% 50%, rgba(16,185,129,0.22) 0%, transparent 70%)' :
            step === 2 ? 'radial-gradient(ellipse 100% 80% at 50% 50%, rgba(56,189,248,0.08) 0%, transparent 70%)' :
            'radial-gradient(ellipse 80% 80% at 50% 110%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)',
        }} />

      {/* ── Central overlay — all step UX lives here ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>

        {/* ─── STEP 1: QR corner brackets ─── */}
        <div className="absolute transition-all duration-500"
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)',
            opacity: step === 1 ? 1 : 0,
            transform: step === 1 ? 'scale(1)' : 'scale(0.9)',
          }}>
          <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
            {/* Corner brackets */}
            {[['top-0 left-0','border-t border-l','rounded-tl-xl'],
              ['top-0 right-0','border-t border-r','rounded-tr-xl'],
              ['bottom-0 left-0','border-b border-l','rounded-bl-xl'],
              ['bottom-0 right-0','border-b border-r','rounded-br-xl']
            ].map(([pos, borders, radius], i) => (
              <div key={i} className={`absolute ${pos} w-9 h-9 ${borders} ${radius} border-white/40`} />
            ))}
            {/* Scan laser */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-x-4 h-px bg-gradient-to-r from-transparent via-emerald-400/90 to-transparent"
                style={{ animation: 'laser 2.2s ease-in-out infinite alternate', filter: 'drop-shadow(0 0 4px #10b981)' }} />
            </div>
            {/* Centre icon */}
            <QrCode className="w-10 h-10 text-white/15" strokeWidth={1} />
          </div>
          {/* Label */}
          <p className="text-center mt-5 text-[10px] font-mono tracking-[0.35em] text-white/30 uppercase">
            Hold ID card QR here
          </p>
        </div>

        {/* ─── STEP 2: Apple Face ID circle ─── */}
        <div className="absolute flex flex-col items-center gap-0 transition-all duration-600"
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)',
            opacity: step === 2 ? 1 : 0,
            transform: step === 2 ? 'scale(1) translateY(0)' : step > 2 ? 'scale(0.85) translateY(-30px)' : 'scale(1.1) translateY(20px)',
          }}>

          {/* Ambient subtle white glow to create focus on face */}
          <div className="absolute inset-0 w-[400px] h-[400px] bg-white opacity-5 rounded-full blur-[60px] pointer-events-none -z-10"
               style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', transition: 'opacity 0.6s' }} />

          {/* Face ID circle via SVG */}
          <div className="relative" style={{ width: 400, height: 400 }}>
            <svg width="400" height="400" viewBox="0 0 400 400" className="absolute inset-0"
              style={{ transform: 'rotate(-90deg)' }}>
              {/* Track circle */}
              <circle cx="200" cy="200" r="180"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="2"
              />
              {/* Progress arc */}
              <circle cx="200" cy="200" r="180"
                fill="none"
                stroke={faceDetected ? '#38bdf8' : 'rgba(255,255,255,0.18)'}
                strokeWidth={faceDetected ? '3.5' : '1.5'}
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 180}`}
                strokeDashoffset={`${2 * Math.PI * 180 * (1 - faceProgress / 100)}`}
                style={{
                  transition: 'stroke-dashoffset 0.12s linear, stroke 0.4s ease, stroke-width 0.4s ease',
                  filter: faceDetected && faceProgress > 10 ? 'drop-shadow(0 0 8px rgba(56,189,248,0.8))' : 'none',
                }}
              />
              {/* 4 subtle dots at cardinal points — very Face ID */}
              {[0, 90, 180, 270].map(deg => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <circle key={deg}
                    cx={200 + 180 * Math.sin(rad)}
                    cy={200 - 180 * Math.cos(rad)}
                    r="4"
                    fill={faceDetected ? '#38bdf8' : 'rgba(255,255,255,0.25)'}
                    style={{ transition: 'fill 0.4s ease' }}
                  />
                );
              })}
            </svg>

            {/* Face silhouette placeholder when no face */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Subtle face outline — visible only when not detected */}
              <svg width="150" height="170" viewBox="0 0 80 90"
                style={{ opacity: faceDetected ? 0 : 0.10, transition: 'opacity 0.5s ease' }}>
                <ellipse cx="40" cy="38" rx="26" ry="30" fill="none" stroke="white" strokeWidth="1" />
                <ellipse cx="40" cy="80" rx="34" ry="16" fill="none" stroke="white" strokeWidth="1" />
              </svg>

              {/* Progress percentage — shows only when face detected */}
              {faceDetected && faceProgress > 0 && (
                <div className="absolute flex flex-col items-center"
                  style={{ animation: 'fadeIn 0.3s ease' }}>
                  <span className="text-5xl font-black text-white tabular-nums" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                    {faceProgress}<span className="text-2xl text-white/50">%</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Student name — subtle, below circle */}
          <div className="flex flex-col items-center mt-6 gap-1.5"
            style={{ opacity: step === 2 ? 1 : 0, transition: 'opacity 0.5s ease 0.2s' }}>
            <p className="text-white/90 font-semibold text-sm tracking-wide">{s?.name}</p>
            <p className="text-white/30 font-mono text-[9px] tracking-[0.25em] uppercase">
              {faceDetected ? 'Hold still…' : modelStatus === 'loading' ? 'Preparing…' : 'Move closer'}
            </p>
          </div>
        </div>

        {/* ─── STEP 3: Success — full-frame subtle ─── */}
        <div className="absolute flex flex-col items-center gap-4 transition-all duration-600"
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)',
            opacity: step === 3 ? 1 : 0,
            transform: step === 3 ? 'scale(1)' : 'scale(0.85)',
          }}>
          {/* Big checkmark in a circle */}
          <div className="relative w-28 h-28">
            <svg width="112" height="112" viewBox="0 0 112 112" className="absolute inset-0"
              style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="56" cy="56" r="52" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="2" />
              <circle cx="56" cy="56" r="52" fill="none" stroke="#10b981" strokeWidth="2.5"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="w-10 h-10 text-emerald-400" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <p className="text-2xl font-black text-white tracking-tight">Welcome, {s?.name?.split(' ')[0]}</p>
            <p className="text-emerald-400/70 font-mono text-[10px] tracking-[0.25em] uppercase">Attendance marked · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>

      {/* ── HUD: top-left ── */}
      <div className="absolute top-5 left-5 md:top-7 md:left-7 pointer-events-auto" style={{ zIndex: 20 }}>
        <div className="p-3.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/8 shadow-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-emerald-400/80">Live</span>
          </div>
          <h1 className="text-base font-black text-white tracking-tight">EduFlow Gate</h1>
          {/* Step breadcrumb */}
          <div className="flex items-center gap-1.5 mt-2.5">
            {[
              { n: 1, label: 'ID' },
              { n: 2, label: 'Face' },
            ].map(({ n, label }, i) => (
              <React.Fragment key={n}>
                <div className="flex items-center gap-1">
                  <div className={`w-4 h-4 rounded-full text-[7px] font-black flex items-center justify-center transition-all duration-500 ${
                    step > n ? 'bg-emerald-500 text-slate-950' :
                    step === n ? 'bg-white text-slate-950' :
                    'bg-white/10 text-slate-500'
                  }`}>
                    {step > n ? <Check className="w-2 h-2" strokeWidth={3} /> : n}
                  </div>
                  <span className={`text-[8px] font-medium transition-colors duration-500 ${step === n ? 'text-white' : 'text-slate-500'}`}>{label}</span>
                </div>
                {i < 1 && <div className={`w-3 h-px transition-all duration-700 ${step > n ? 'bg-emerald-500' : 'bg-white/12'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── HUD: top-right ── */}
      <div className="absolute top-5 right-5 md:top-7 md:right-7 flex flex-col items-end gap-2.5 pointer-events-auto" style={{ zIndex: 20 }}>
        <button onClick={() => setIsIdModalOpen(true)}
          className="animate-pulse px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/50 font-bold text-xs flex items-center gap-2 backdrop-blur-lg transition-all hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <CreditCard className="w-4 h-4" /><span>Get Demo ID Cards</span>
        </button>

        <div className="px-4 py-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/8 shadow-xl flex items-center gap-3.5">
          <div className="text-right">
            <span className="text-[7px] font-mono text-slate-500 uppercase tracking-[0.2em] block">Present</span>
            <span className="text-xl font-black text-white">{presentCount}<span className="text-slate-500 text-[10px]">/{totalCount}</span></span>
          </div>
          <div className="w-px h-6 bg-white/8" />
          <div className="text-right">
            <span className="text-[7px] font-mono text-slate-500 uppercase tracking-[0.2em] block">Rate</span>
            <span className="text-xl font-black text-white">{rate}%</span>
          </div>
        </div>

        {/* Recent log — minimal */}
        {recentLogs.length > 0 && (
          <div className="w-52 space-y-1">
            {recentLogs.slice(0, 3).map((log, i) => (
              <div key={i} className="flex items-center gap-2 bg-black/35 backdrop-blur-xl px-2.5 py-1.5 rounded-xl border border-white/6">
                <img src={log.avatar} alt="" className="w-5 h-5 rounded-full object-cover shrink-0" />
                <p className="text-[9px] font-medium text-white/70 truncate flex-1">{log.name}</p>
                <span className="text-[8px] font-mono text-emerald-400/70 shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Model loading / failed indicator (very subtle, bottom center) ── */}
      {step === 2 && modelStatus !== 'ready' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none" style={{ zIndex: 20 }}>
          {modelStatus === 'loading'
            ? <><Loader2 className="w-3 h-3 text-white/30 animate-spin" /><span className="text-[8px] font-mono text-white/25 tracking-widest uppercase">Loading model</span></>
            : <><AlertTriangle className="w-3 h-3 text-amber-400/50" /><span className="text-[8px] font-mono text-white/25 tracking-widest uppercase">Face detection unavailable</span></>
          }
        </div>
      )}

      {/* ── Standby / Unsupported ── */}
      {cameraStatus !== 'ACTIVE' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md" style={{ zIndex: 30 }}>
          {cameraStatus === 'UNSUPPORTED' ? (
            <div className="flex flex-col items-center text-center max-w-xs gap-3">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <p className="text-white font-black text-lg">Open in Chrome or Edge</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 text-center">
              <Camera className="w-8 h-8 text-white/20" />
              <div>
                <p className="text-white font-black text-xl mb-1">Scanner Paused</p>
                <p className="text-white/30 text-sm">Left this tab</p>
              </div>
              <button onClick={_startCamera}
                className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/18 text-white font-semibold text-sm border border-white/12 transition-all flex items-center gap-2">
                <Camera className="w-3.5 h-3.5" /> Resume
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes laser {
          0%   { top: 0; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <StudentIdCardModal isOpen={isIdModalOpen} onClose={() => setIsIdModalOpen(false)} students={students} />
    </div>
  );
}
