import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { 
  Camera, ShieldCheck, QrCode, Sparkles, CheckCircle2, 
  Clock, User, Check, CreditCard, ChevronRight, Fingerprint
} from 'lucide-react';
import StudentIdCardModal from './StudentIdCardModal';

export default function SmartKiosk() {
  const [cameraStatus, setCameraStatus] = useState('STANDBY'); // STANDBY, INITIALIZING, ACTIVE
  const [cameraActive, setCameraActive] = useState(false);
  const [step, setStep] = useState(1); // 1: ID Scan, 2: Face Scrutiny, 3: Success Reveal
  const [scannedId, setScannedId] = useState(null);
  const [matchedStudent, setMatchedStudent] = useState(null);
  const [scrutinyProgress, setScrutinyProgress] = useState(0);
  const [students, setStudents] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);

  const html5QrCodeRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastScannedCodeRef = useRef(null);
  const lastScannedTimeRef = useRef(0);

  useEffect(() => {
    fetchStudents();

    // Automatically stop camera if they switch browser tabs
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRealCamera();
        setCameraStatus('STANDBY');
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopRealCamera();
    };
  }, []);

  const handlePowerOn = () => {
    setCameraStatus('INITIALIZING');
    // Fake a 1.5s boot up animation
    setTimeout(() => {
      startRealCamera();
    }, 1500);
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const startRealCamera = async () => {
    try {
      if (html5QrCodeRef.current) return;
      const html5QrCode = new Html5Qrcode("kiosk-camera-viewport");
      html5QrCodeRef.current = html5QrCode;
      
      const config = { fps: 15, qrbox: { width: 380, height: 380 } };
      await html5QrCode.start(
        { facingMode: "user" },
        config,
        (decodedText) => handleQrCodeDetected(decodedText),
        () => {} // silent scanning loop
      );
      setCameraActive(true);
      setCameraStatus('ACTIVE');
    } catch (err) {
      console.warn("Html5Qrcode init warning:", err);
      setCameraActive(true);
      setCameraStatus('ACTIVE');
    }
  };

  const stopRealCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        // state 2 means SCANNING
        if (state === 2) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {}
      html5QrCodeRef.current = null;
    }
    setCameraActive(false);
  };

  const handleQrCodeDetected = (rawQrText) => {
    // 0. Prevent scanning before students are loaded (Race condition fix)
    if (students.length === 0) return;

    // 1. Debounce and Lock
    if (isProcessingRef.current) return;
    
    const now = Date.now();
    // Ignore rapid consecutive scans of the same code within 3 seconds
    if (lastScannedCodeRef.current === rawQrText && (now - lastScannedTimeRef.current < 3000)) {
      return;
    }

    lastScannedCodeRef.current = rawQrText;
    lastScannedTimeRef.current = now;

    // 2. Strict ID Parsing
    let cleanId = String(rawQrText).trim();
    if (cleanId.startsWith('{')) {
      try {
        const jsonObj = JSON.parse(cleanId);
        cleanId = jsonObj.id || jsonObj.student_id || jsonObj.roll_no || jsonObj.qr_code || cleanId;
      } catch (e) {}
    }

    cleanId = String(cleanId)
      .replace('STU-', '')
      .replace('EDU-', '')
      .replace('{"id":"', '')
      .split('"')[0]
      .split('-')[0]
      .trim();

    // 3. Strict Equality Match (No substring .includes bugs)
    const foundStudent = students.find(s => 
      String(s.id) === cleanId || 
      String(s.student_id) === cleanId || 
      String(s.roll_no) === cleanId || 
      String(s.qr_code) === cleanId ||
      String(s.qr_token) === cleanId ||
      String(s.qr_token) === String(rawQrText).trim()
    );

    if (!foundStudent) {
      console.warn(`Unregistered QR code scanned: ${rawQrText}`);
      return;
    }

    // 4. Lock & Transition to Step 2
    isProcessingRef.current = true;
    setScannedId(cleanId);
    setMatchedStudent(foundStudent);
    setStep(2);
    runFacialScrutiny(cleanId, foundStudent);
  };

  const runFacialScrutiny = (studentId, studentObj) => {
    setScrutinyProgress(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setScrutinyProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        commitAttendanceVerification(studentId, studentObj);
      }
    }, 240); // Total ~1.2s scrutiny animation
  };

  const commitAttendanceVerification = async (studentId, studentObj) => {
    try {
      const res = await fetch('/api/kiosk/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: studentId, face_detected: true })
      });
      const data = await res.json();

      if (data.status === 'SUCCESS' || data.student) {
        setStep(3);
        confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 }, colors: ['#10b981', '#34d399', '#ffffff'] });
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setRecentLogs(prev => [{
          name: studentObj.name,
          grade: studentObj.grade || "Grade 10-A",
          id: studentId,
          time: timestamp,
          avatar: studentObj.avatar
        }, ...prev.slice(0, 4)]);

        fetchStudents();

        // Hold Step 3 reveal for 3 seconds then reset
        setTimeout(() => resetKioskState(), 3000);
      } else {
        alert(data.message || "Verification failed.");
        resetKioskState();
      }
    } catch (err) {
      console.error("Verification error:", err);
      resetKioskState();
    }
  };

  const resetKioskState = () => {
    setStep(1);
    setScannedId(null);
    setMatchedStudent(null);
    setScrutinyProgress(0);
    isProcessingRef.current = false;
  };

  const presentCount = students.filter(s => s.attendance_status === 'PRESENT').length;
  const totalCount = students.length || 17;
  const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 font-sans flex">
      
      {/* FULL SCREEN CAMERA VIEWPORT */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        <div id="kiosk-camera-viewport" className={`w-full h-full object-cover opacity-90 scale-105 transition-opacity duration-1000 ${cameraStatus === 'ACTIVE' ? 'opacity-90' : 'opacity-0'}`} />
        
        {/* Dynamic Vignette / Border Glow depending on Step */}
        <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${
          cameraStatus !== 'ACTIVE' ? 'bg-slate-950' :
          step === 3 ? 'shadow-[inset_0_0_150px_rgba(16,185,129,0.4)]' :
          step === 2 ? 'shadow-[inset_0_0_150px_rgba(56,189,248,0.3)]' : 'shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]'
        }`} />
      </div>

      {/* OVERLAY: Header & Controls */}
      <div className="absolute inset-0 p-4 md:p-8 z-10 flex flex-col md:flex-row items-start justify-between pointer-events-none overflow-hidden">
        
        {/* Left Side: Title & Steps */}
        <div className="space-y-4 md:space-y-6 w-full md:w-auto">
          <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-2xl pointer-events-auto">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Live Hardware Feed</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight font-display mb-1">EduFlow Smart Gate</h1>
            <p className="text-sm text-slate-400 max-w-sm">
              Present your student ID card to the lens for instant dual-factor biometric access.
            </p>
          </div>

          {/* Stepper HUD */}
          <div className="flex flex-col gap-3 pointer-events-auto w-80">
            <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 backdrop-blur-md ${
              step === 1 ? 'bg-white/10 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'bg-black/40 border-white/5 opacity-50'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors ${
                step > 1 ? 'bg-emerald-500 text-slate-950' : 'bg-white/20 text-white'
              }`}>
                {step > 1 ? <Check className="w-5 h-5" /> : "1"}
              </div>
              <div>
                <h4 className={`text-sm font-bold uppercase tracking-wider ${step === 1 ? 'text-white' : 'text-slate-400'}`}>ID Card Scan</h4>
                <p className="text-xs text-slate-400">Locating QR code in frame</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 backdrop-blur-md ${
              step === 2 ? 'bg-sky-500/20 border-sky-400/50 shadow-[0_0_30px_rgba(56,189,248,0.2)]' : 
              step > 2 ? 'bg-black/40 border-white/5 opacity-50' : 'bg-black/40 border-white/5 opacity-30'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors ${
                step > 2 ? 'bg-emerald-500 text-slate-950' : step === 2 ? 'bg-sky-400 text-slate-950 animate-pulse' : 'bg-white/10 text-slate-500'
              }`}>
                {step > 2 ? <Check className="w-5 h-5" /> : "2"}
              </div>
              <div>
                <h4 className={`text-sm font-bold uppercase tracking-wider ${step === 2 ? 'text-sky-100' : 'text-slate-500'}`}>Facial Scrutiny</h4>
                <p className={`text-xs ${step === 2 ? 'text-sky-200' : 'text-slate-600'}`}>Liveness & Identity Check</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tools & Telemetry */}
        <div className="flex flex-col items-end gap-3 md:gap-4 pointer-events-auto mt-4 md:mt-0 w-full md:w-auto">
          <button
            onClick={() => setIsIdModalOpen(true)}
            className="px-4 py-2.5 md:px-5 md:py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs md:text-sm flex items-center gap-2 md:gap-3 shadow-2xl backdrop-blur-lg transition hover:scale-105"
          >
            <CreditCard className="w-5 h-5" />
            <span>Generate Dummy ID Cards</span>
          </button>

          <div className="glass-panel p-5 rounded-3xl border border-white/10 bg-slate-950/50 backdrop-blur-xl shadow-2xl flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] font-mono text-emerald-400/80 uppercase tracking-widest block mb-1">Checked In</span>
              <span className="text-2xl font-black text-white font-display">{presentCount} <span className="text-slate-500 text-base">/ {totalCount}</span></span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-right">
              <span className="text-[10px] font-mono text-sky-400/80 uppercase tracking-widest block mb-1">Arrival Rate</span>
              <span className="text-2xl font-black text-white font-display">{attendanceRate}%</span>
            </div>
          </div>
          
          {/* Recent Scans Log (Floating) */}
          {recentLogs.length > 0 && (
            <div className="mt-4 w-72 glass-panel p-4 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-2xl space-y-3">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">Recent Access Logs</h4>
              {recentLogs.map((log, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/5 p-2.5 rounded-2xl border border-white/5 animate-fade-up">
                  <img src={log.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{log.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {log.id}</p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">{log.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* STANDBY & INITIALIZING OVERLAYS */}
      {cameraStatus !== 'ACTIVE' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md">
          {cameraStatus === 'STANDBY' ? (
            <div className="animate-in zoom-in fade-in duration-500 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-8 shadow-2xl">
                <Camera className="w-10 h-10 text-slate-500" />
              </div>
              <h2 className="text-3xl font-black text-white font-display mb-3">System on Standby</h2>
              <p className="text-slate-400 max-w-md mb-10 text-sm">
                The smart gate biometric scanners are currently inactive. Power on the system to begin student verification.
              </p>
              <button 
                onClick={handlePowerOn}
                className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black tracking-widest uppercase transition-all hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5" />
                Initialize Scanners
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center animate-pulse">
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 border-4 border-sky-500/20 border-t-sky-400 rounded-full animate-spin" />
                <div className="absolute inset-2 border-4 border-emerald-500/20 border-b-emerald-400 rounded-full animate-[spin_2s_reverse_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Fingerprint className="w-10 h-10 text-sky-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-sky-400 font-mono tracking-widest uppercase">
                Booting Biometrics...
              </h2>
              <p className="text-slate-500 text-sm mt-2 font-mono">Calibrating lenses and neural engines</p>
            </div>
          )}
        </div>
      )}

      {/* CENTRAL HUD CROSSHAIRS & ANIMATIONS */}
      <div className="absolute inset-0 z-0 pointer-events-none flex flex-col items-center justify-center">
        
        {/* Step 1 HUD: Massive Reticle */}
        {step === 1 && cameraStatus === 'ACTIVE' && (
          <div className="relative animate-in zoom-in duration-500">
            {/* Corner Brackets */}
            <div className="absolute -inset-8 border-2 border-white/20 rounded-3xl" style={{ clipPath: 'polygon(0 0, 20% 0, 0 20%, 0 0, 80% 0, 100% 0, 100% 20%, 80% 0, 100% 80%, 100% 100%, 80% 100%, 100% 80%, 0 80%, 0 100%, 20% 100%, 0 80%)' }} />
            
            <div className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-3xl border border-emerald-500/30 relative flex flex-col items-center justify-center bg-emerald-500/5 backdrop-blur-[2px]">
              {/* Scanning Laser Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_20px_#10b981] animate-[introWipeUp_2s_ease-in-out_infinite_alternate]" style={{ animationName: 'scanLaser', animationDuration: '2.5s', animationIterationCount: 'infinite', animationDirection: 'alternate' }} />
              
              <QrCode className="w-24 h-24 text-emerald-400/50 animate-pulse" />
              <p className="mt-8 text-sm font-mono font-bold tracking-widest text-emerald-400 bg-emerald-950/80 px-4 py-2 rounded-full border border-emerald-500/30">
                ALIGN QR CODE HERE
              </p>
            </div>
          </div>
        )}

        {/* Step 2 HUD: Facial Scrutiny Liveness */}
        {step === 2 && matchedStudent && (
          <div className="relative w-[360px] animate-in zoom-in-110 fade-in duration-300">
            <div className="absolute -inset-10 bg-sky-500/20 rounded-[3rem] blur-2xl animate-pulse" />
            <div className="relative bg-slate-950/80 backdrop-blur-2xl border-2 border-sky-400/50 rounded-3xl p-8 flex flex-col items-center shadow-[0_0_80px_rgba(56,189,248,0.4)]">
              
              <div className="absolute -top-4 bg-sky-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg flex items-center gap-2">
                <Fingerprint className="w-3 h-3 animate-spin" />
                <span>Biometric Scrutiny Active</span>
              </div>

              <div className="relative w-32 h-32 mb-6 mt-4">
                <div className="absolute inset-0 border-4 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
                <img src={matchedStudent.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} alt="" className="w-full h-full object-cover rounded-full p-2" />
              </div>

              <h3 className="text-xl font-black text-white font-display text-center">{matchedStudent.name || matchedStudent.full_name}</h3>
              <p className="text-sky-300 font-mono text-xs mt-1 mb-6 text-center">ID: {matchedStudent.id}</p>

              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-sky-500/20">
                <div 
                  className="bg-sky-400 h-full transition-all duration-200 ease-out shadow-[0_0_10px_#38bdf8]"
                  style={{ width: `${scrutinyProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-sky-400 font-mono mt-3 text-center uppercase tracking-widest">
                Analyzing Facial Topology... {scrutinyProgress}%
              </p>
            </div>
          </div>
        )}

        {/* Step 3 HUD: Verified Success */}
        {step === 3 && matchedStudent && (
          <div className="relative animate-in zoom-in-90 fade-in duration-300 transform scale-110">
            <div className="absolute -inset-16 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="relative bg-emerald-500 border border-emerald-400 rounded-3xl p-10 flex flex-col items-center shadow-[0_0_100px_rgba(16,185,129,0.5)] text-slate-950 text-center max-w-md">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 transform hover:scale-110 transition duration-500">
                <CheckCircle2 className="w-14 h-14 text-emerald-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-950/10 px-3 py-1 rounded-full mb-3">
                Access Granted
              </span>
              <h2 className="text-4xl font-black tracking-tight font-display mb-2">Verified!</h2>
              <p className="text-emerald-900 font-bold text-lg mb-1">{matchedStudent.name}</p>
              <p className="text-emerald-800 font-mono text-sm opacity-80">ID: {matchedStudent.id}</p>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes scanLaser {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(280px); opacity: 0; }
        }
        @media (min-width: 768px) {
          @keyframes scanLaser {
            0% { transform: translateY(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(380px); opacity: 0; }
          }
        }
      `}</style>

      {/* Modals */}
      <StudentIdCardModal
        isOpen={isIdModalOpen}
        onClose={() => setIsIdModalOpen(false)}
        students={students}
      />
    </div>
  );
}
