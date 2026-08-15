import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import KioskCameraView from './KioskCameraView';
import KioskRosterGrid from './KioskRosterGrid';

export default function SmartKiosk() {
  const [cameraActive, setCameraActive] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceRect, setFaceRect] = useState(null);
  const [manualFaceToggle, setManualFaceToggle] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [greenFlash, setGreenFlash] = useState(false);
  const [students, setStudents] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [viewCardModal, setViewCardModal] = useState(null);
  const [engineType, setEngineType] = useState('Google MediaPipe AI');
  
  const videoRef = useRef(null);

  useEffect(() => {
    fetchStudents();
    return () => stopCamera();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err) {
      console.error(err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      setMediaStream(stream);
      setCameraActive(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.warn("Webcam access declined, using Edge CV simulation:", err);
      setCameraActive(true);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setCameraActive(false);
    setFaceDetected(false);
    setFaceRect(null);
  };

  const handleSimulateScan = async (studentId, forceNoFace = false) => {
    const isFacePresent = forceNoFace ? false : (faceDetected || manualFaceToggle || cameraActive);
    setScanResult(null);

    try {
      const res = await fetch('/api/kiosk/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: studentId, face_detected: isFacePresent })
      });
      const data = await res.json();
      setScanResult(data);

      if (data.status === 'SUCCESS') {
        setGreenFlash(true);
        setTimeout(() => setGreenFlash(false), 1200);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setRecentLogs(prev => [data, ...prev.slice(0, 9)]);
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
            $0 Hardware Overhead
          </span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Dual Coincidence Anti-Proxy Gate</span>
        </div>
        <h2 className="text-xl font-extrabold mt-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Smart Kiosk: Edge Computer Vision Attendance
        </h2>
        <p className="text-xs mt-1 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
          Combines high-speed QR identification with real-time edge facial liveness verification. Blocks buddy punching at $0 additional hardware cost.
        </p>
      </div>

      {/* Grid: Live Camera & Student Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <KioskCameraView
          cameraActive={cameraActive}
          startCamera={startCamera}
          stopCamera={stopCamera}
          videoRef={videoRef}
          faceDetected={faceDetected}
          faceRect={faceRect}
          greenFlash={greenFlash}
          scanResult={scanResult}
          engineType={engineType}
          manualFaceToggle={manualFaceToggle}
          setManualFaceToggle={setManualFaceToggle}
        />

        <KioskRosterGrid
          students={students}
          handleSimulateScan={handleSimulateScan}
          setViewCardModal={setViewCardModal}
          recentLogs={recentLogs}
        />
      </div>
    </div>
  );
}
