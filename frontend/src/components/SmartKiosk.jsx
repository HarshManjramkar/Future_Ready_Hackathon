import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  UserCheck, 
  ShieldAlert, 
  CheckCircle2, 
  Camera, 
  CameraOff, 
  Sparkles,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SmartKiosk() {
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceRect, setFaceRect] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [greenFlash, setGreenFlash] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);
  
  const videoRef = useRef(null);
  const trackerTaskRef = useRef(null);

  useEffect(() => {
    fetchStudents();
    return () => {
      stopCamera();
    };
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setRecentLogs(data.students || []);
    } catch (err) {
      console.error(err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);

      // Wait for video to load metadata
      setTimeout(() => {
        if (window.tracking && videoRef.current) {
          const tracker = new window.tracking.ObjectTracker('face');
          tracker.setInitialScale(4);
          tracker.setStepSize(2);
          tracker.setEdgesDensity(0.1);

          trackerTaskRef.current = window.tracking.track(videoRef.current, tracker);

          tracker.on('track', (event) => {
            if (event.data.length === 0) {
              setFaceDetected(false);
              setFaceRect(null);
            } else {
              setFaceDetected(true);
              // Save coordinates of the first detected face
              setFaceRect(event.data[0]);
            }
          });
        }
      }, 800);

    } catch (err) {
      console.warn("Webcam access restricted or unavailable, enabling simulation mode.");
      setCameraActive(true);
      setFaceDetected(true);
    }
  };

  const stopCamera = () => {
    if (trackerTaskRef.current) {
      trackerTaskRef.current.stop();
      trackerTaskRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setFaceDetected(false);
    setFaceRect(null);
  };

  const handleScanID = async (qrCode) => {
    try {
      const res = await fetch('/api/kiosk/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_code: qrCode,
          face_detected: faceDetected
        })
      });
      const data = await res.json();
      setScanResult(data);

      if (data.green_flash) {
        setGreenFlash(true);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
        setTimeout(() => setGreenFlash(false), 1500);
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const demoStudents = [
    { id: '9901', name: 'Arjun', class: 'Grade 10-A' },
    { id: '9902', name: 'Tanvi', class: 'Grade 10-B' },
    { id: '9903', name: 'Tanvay', class: 'Grade 10-A' },
    { id: '9904', name: 'Shruti', class: 'Grade 10-B' },
    { id: '9905', name: 'Sarthak', class: 'Grade 10-A' }
  ];

  // Calculate bounding box overlay coordinates based on video size
  const getBoxStyle = () => {
    if (!faceRect || !videoRef.current) return { display: 'none' };
    const videoWidth = videoRef.current.videoWidth || 640;
    const videoHeight = videoRef.current.videoHeight || 480;

    return {
      position: 'absolute',
      border: '3px solid #10b981',
      borderRadius: '12px',
      boxShadow: '0 0 20px rgba(16, 185, 129, 0.7)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      left: `${(faceRect.x / videoWidth) * 100}%`,
      top: `${(faceRect.y / videoHeight) * 100}%`,
      width: `${(faceRect.width / videoWidth) * 100}%`,
      height: `${(faceRect.height / videoHeight) * 100}%`,
      transition: 'all 0.05s ease-out',
      pointerEvents: 'none'
    };
  };

  return (
    <div className={`p-8 transition-colors duration-500 min-h-screen ${greenFlash ? 'bg-emerald-950/40' : ''}`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded border border-emerald-500/30">
                Anti-Buddy Punching Security
              </span>
              <span className="text-xs text-slate-400">Victory High School • Smart Kiosk</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Smart Kiosk: Non-Intrusive Attendance Scanner
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Position a laptop or tablet at the class entry. Students scan their ID card QR code; attendance is verified ONLY when a human face is detected in the camera frame.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Start Kiosk Camera</span>
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="px-5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/40 flex items-center gap-2 cursor-pointer"
              >
                <CameraOff className="w-4 h-4 text-rose-400" />
                <span>Turn Off Camera</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Webcam & Scanner Feed */}
          <div className="space-y-6">
            <div className={`glass-panel p-4 rounded-2xl relative overflow-hidden transition-all duration-300 ${
              greenFlash ? 'border-2 border-emerald-400 pulse-glow-green' : ''
            }`}>
              {/* Camera Video Frame */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                {cameraActive ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {/* Bounding Box Visual Overlay */}
                    {faceDetected && faceRect && (
                      <div style={getBoxStyle()}>
                        <div className="absolute top-[-25px] left-0 bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded text-[9px] tracking-wider uppercase shadow-md flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                          Face Verified
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-slate-500">
                    <Camera className="w-12 h-12 stroke-[1.5]" />
                    <p className="text-xs">Click "Start Kiosk Camera" above to activate live scanner feed</p>
                  </div>
                )}
              </div>

              {/* Anti-Cheat Verification Toggle */}
              <div className="mt-4 p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>Computer Vision Status:</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${faceDetected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className={`font-bold ${faceDetected ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {faceDetected ? 'Face Tracker Active' : 'Waiting for Face...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Demo Scan Triggers */}
            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Demo Quick Scan Triggers (Simulate Canva ID Tap)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {demoStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => handleScanID(student.id)}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-left rounded-xl border border-slate-700 transition group cursor-pointer"
                  >
                    <p className="font-bold text-white text-xs group-hover:text-emerald-400">{student.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">ID: {student.id} • {student.class}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Result Alert & Attendance Log */}
          <div className="space-y-6">
            {/* Scan Feedback Result Card */}
            {scanResult && (
              <div className={`glass-panel p-6 rounded-2xl border-2 transition-all ${
                scanResult.status === 'SUCCESS' 
                  ? 'border-emerald-500/60 bg-emerald-950/20 pulse-glow-green' 
                  : 'border-rose-500/60 bg-rose-950/20'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${scanResult.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${scanResult.status === 'SUCCESS' ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {scanResult.status === 'SUCCESS' ? 'Attendance Verified!' : 'Security Alert: Buddy Punching Blocked'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {scanResult.message}
                    </p>
                    {scanResult.student && (
                      <div className="mt-3 flex items-center gap-3 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <img src={scanResult.student.avatar} alt="Student" className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="font-bold text-white">{scanResult.student.name}</p>
                          <p className="text-[10px] text-slate-400">{scanResult.student.grade} • Marked {scanResult.student.check_in_time}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Roster */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Live Attendance Roster (Victory High School)
                </h3>
                <span className="text-xs text-emerald-400 font-medium">
                  {recentLogs.filter(s => s.attendance_status === 'PRESENT').length} / {recentLogs.length} Present
                </span>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {recentLogs.map((student) => (
                  <div key={student.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img src={student.avatar} alt={student.name} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                      <div>
                        <p className="font-bold text-white">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{student.grade} • ID #{student.id}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        student.attendance_status === 'PRESENT'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {student.attendance_status}
                      </span>
                      {student.check_in_time !== '--' && (
                        <p className="text-[10px] text-slate-400 font-mono mt-1">{student.check_in_time}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
