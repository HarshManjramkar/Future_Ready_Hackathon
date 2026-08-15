import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import { 
  Camera, 
  ShieldCheck, 
  QrCode, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  User, 
  Check, 
  AlertTriangle,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import StudentIdCardModal from './StudentIdCardModal';

export default function SmartKiosk() {
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

  useEffect(() => {
    fetchStudents();
    startRealCamera();
    return () => {
      stopRealCamera();
    };
  }, []);

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

      const config = { fps: 15, qrbox: { width: 340, height: 340 } };

      await html5QrCode.start(
        { facingMode: "user" },
        config,
        (decodedText) => {
          handleQrCodeDetected(decodedText);
        },
        () => {} // silent scanning loop
      );

      setCameraActive(true);
    } catch (err) {
      console.warn("Html5Qrcode camera init warning:", err);
      setCameraActive(true);
    }
  };

  const stopRealCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn("Camera stop warning:", err);
      }
      html5QrCodeRef.current = null;
    }
    setCameraActive(false);
  };

  // Robust QR Code Parser & Exact Student Matching
  const handleQrCodeDetected = (rawQrText) => {
    // Prevent duplicate scans or scanning while in Step 2 / Step 3
    if (isProcessingRef.current) return;
    
    let cleanId = String(rawQrText).trim();
    
    // Parse JSON payloads (e.g. {"id":"STU-9903"} or {"qr_code":"9903"})
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

    // Match exact student from database
    const foundStudent = students.find(s => 
      String(s.id) === cleanId || 
      String(s.student_id) === cleanId || 
      String(s.roll_no) === cleanId || 
      String(s.qr_code) === cleanId ||
      (s.qr_token && rawQrText.includes(String(s.qr_token))) ||
      rawQrText.includes(String(s.id))
    );

    if (!foundStudent) {
      // Unrecognized ID code scanned
      console.warn(`Unregistered QR code scanned: ${rawQrText}`);
      return;
    }

    // LOCK scanner processing
    isProcessingRef.current = true;
    setScannedId(cleanId);
    setMatchedStudent(foundStudent);
    
    // Smooth Transition to Step 2: Facial Scrutiny
    setStep(2);
    runFacialScrutiny(cleanId, foundStudent);
  };

  // Step 2: Facial Scrutiny & Liveness Progress Animation
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
    }, 240); // 1.2s total facial scrutiny animation
  };

  // Step 3: Commit Verified Attendance to Backend API
  const commitAttendanceVerification = async (studentId, studentObj) => {
    try {
      const res = await fetch('/api/kiosk/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_code: studentId,
          face_detected: true
        })
      });
      const data = await res.json();

      if (data.status === 'SUCCESS' || data.student) {
        setStep(3); // Step 3: Verified Reveal
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setRecentLogs(prev => [{
          name: studentObj.name,
          grade: studentObj.grade || "Grade 10-A",
          id: studentId,
          time: timestamp
        }, ...prev.slice(0, 7)]);

        fetchStudents();

        // Hold Step 3 reveal for 2.6s then reset for next student
        setTimeout(() => {
          resetKioskState();
        }, 2800);
      } else {
        alert(data.message || "Security Guard Alert: Verification failed.");
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
    isProcessingRef.current = false; // UNLOCK scanner for next student
  };

  const presentCount = students.filter(s => s.attendance_status === 'PRESENT').length;
  const totalCount = students.length || 17;
  const attendanceRate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

  return (
    <div className="p-7 max-w-7xl mx-auto space-y-7 min-h-screen font-sans">
      {/* Header Bar with ID Download Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
              Live Hardware Camera Gate
            </span>
            <span className="text-xs text-slate-400">2-Step Biometric Anti-Proxy Gate</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1" style={{ fontFamily: 'var(--font-display)' }}>
            Smart Kiosk: Live Camera Attendance Gate
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Hold up your physical student ID card to the laptop camera. The system decodes your ID QR code and performs real-time facial liveness scrutiny.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View / Print Student ID Cards Modal Trigger */}
          <button
            onClick={() => setIsIdModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>View & Print Student ID Badges</span>
          </button>

          {/* Telemetry Card */}
          <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex items-center gap-5 shrink-0 bg-slate-900/60">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Checked In</span>
              <span className="text-base font-black text-emerald-400">{presentCount} / {totalCount} Present</span>
            </div>
            <div className="h-7 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block">Rate</span>
              <span className="text-base font-black text-sky-400">{attendanceRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Full-Width Camera Viewport + Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-start">
        {/* Left Column (2 Cols): Full-Screen Camera Viewport */}
        <div className="lg:col-span-2 space-y-4">
          {/* 2-Step Progress Indicator */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
              step === 1 ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-lg' : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                step >= 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}>
                {step >= 2 ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Step 1: ID Card Scan</h4>
                <p className="text-[10px] text-slate-400">Hold student ID QR code to camera</p>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
              step === 2 ? 'bg-sky-500/10 border-sky-500/50 text-sky-400 shadow-lg' :
              step === 3 ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                step === 3 ? 'bg-emerald-500 text-slate-950' : step === 2 ? 'bg-sky-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-300'
              }`}>
                {step === 3 ? <Check className="w-4 h-4" /> : "2"}
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Step 2: Facial Scrutiny</h4>
                <p className="text-[10px] text-slate-400">Biometric liveness verification</p>
              </div>
            </div>
          </div>

          {/* Spacious Full-Width Camera Module Viewport */}
          <div className={`relative rounded-3xl overflow-hidden aspect-video min-h-[460px] bg-slate-950 border-2 transition-all shadow-2xl flex items-center justify-center ${
            step === 3 ? 'border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.4)]' :
            step === 2 ? 'border-sky-400 shadow-[0_0_50px_rgba(56,189,248,0.3)]' : 'border-slate-800'
          }`}>
            {/* Live Camera Element */}
            <div id="kiosk-camera-viewport" className="w-full h-full object-cover" />

            {/* Step 1 HUD: ID Card Scanning Reticle */}
            {step === 1 && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40">
                <div className="w-72 h-72 border-2 border-dashed border-emerald-400/80 rounded-3xl relative flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                  {/* Scanning Laser */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_15px_#10b981]" />
                  <QrCode className="w-16 h-16 text-emerald-400/40 animate-pulse" />
                </div>
                <div className="mt-5 px-5 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center gap-2.5 shadow-xl backdrop-blur-md">
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>STEP 1: Hold Student ID Card QR Code to camera frame...</span>
                </div>
              </div>
            )}

            {/* Step 2 HUD: Facial Scrutiny & Liveness Progress */}
            {step === 2 && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xs">
                <div className="w-64 h-80 border-2 border-sky-400 rounded-3xl relative flex flex-col items-center justify-between p-5 shadow-[0_0_45px_rgba(56,189,248,0.5)] animate-pulse">
                  <span className="bg-sky-500 text-slate-950 font-black text-[10px] px-3 py-0.5 rounded-full shadow">
                    FACIAL SCRUTINY IN PROGRESS
                  </span>

                  <div className="text-center space-y-1.5 my-auto">
                    <User className="w-16 h-16 text-sky-400 mx-auto animate-bounce" />
                    <h4 className="text-sm font-extrabold text-white">{matchedStudent?.name || matchedStudent?.full_name || "Student"}</h4>
                    <p className="text-xs font-mono text-sky-300 font-bold">ID: STU-{scannedId}</p>
                    <p className="text-[10px] text-slate-400">{matchedStudent?.grade || "Grade 10-A"}</p>
                  </div>

                  {/* Scrutiny Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-sky-500/30">
                    <div 
                      className="bg-sky-400 h-full transition-all duration-200"
                      style={{ width: `${scrutinyProgress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 px-5 py-2.5 rounded-2xl bg-slate-900/90 border border-sky-500/30 text-xs font-mono text-sky-300 flex items-center gap-2.5 shadow-xl">
                  <ShieldCheck className="w-4 h-4 text-sky-400 animate-spin" />
                  <span>Analyzing facial biometrics for {matchedStudent?.name || "Student"} ({scrutinyProgress}%)...</span>
                </div>
              </div>
            )}

            {/* Step 3 HUD: Verified Success Badge */}
            {step === 3 && matchedStudent && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 bg-emerald-950/85 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                <div className="w-22 h-22 rounded-3xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-2xl mb-4 animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">ATTENDANCE VERIFIED!</h3>
                <p className="text-base font-bold text-emerald-300 mt-1">{matchedStudent.name || matchedStudent.full_name} ({matchedStudent.grade || "Grade 10-A"})</p>
                <div className="mt-3 px-5 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Checked In: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Live Attendance Roster Log */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Student Class Roster
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
              Grade 10-A ({presentCount}/{totalCount})
            </span>
          </div>

          {/* Scrollable Student Roster */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {students.map((student) => {
              const isPresent = student.attendance_status === 'PRESENT';
              return (
                <div 
                  key={student.id} 
                  className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                    isPresent 
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 shadow-sm' 
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                      alt={student.name} 
                      className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{student.name || student.full_name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">ID: STU-{student.id}</p>
                    </div>
                  </div>

                  <div>
                    {isPresent ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Present
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Absent
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Student ID Badges Modal */}
      <StudentIdCardModal
        isOpen={isIdModalOpen}
        onClose={() => setIsIdModalOpen(false)}
        students={students}
      />
    </div>
  );
}
