import React from 'react';
import { Camera, CameraOff, ShieldCheck, ShieldAlert, Cpu, Sparkles } from 'lucide-react';

export default function KioskCameraView({
  cameraActive, startCamera, stopCamera, videoRef, faceDetected, faceRect,
  greenFlash, scanResult, engineType, manualFaceToggle, setManualFaceToggle
}) {
  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Live Edge Biometric Camera Frame
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
            {engineType}
          </span>
          <button
            onClick={cameraActive ? stopCamera : startCamera}
            className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              cameraActive ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
            }`}
          >
            {cameraActive ? <><CameraOff className="w-3.5 h-3.5" /> Stop</> : <><Camera className="w-3.5 h-3.5" /> Start Webcam</>}
          </button>
        </div>
      </div>

      {/* Video Frame with Face Bounding Box & Green Flash */}
      <div className={`relative rounded-2xl overflow-hidden aspect-video bg-slate-950 flex items-center justify-center border-2 transition-all ${
        greenFlash ? 'border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.5)]' :
        scanResult?.status === 'REJECTED' ? 'border-rose-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]' : 'border-sky-500/20'
      }`}>
        <video ref={videoRef} playsInline muted className="w-full h-full object-cover transform -scale-x-100" />

        {/* Live Detected Face Box */}
        {(faceDetected || manualFaceToggle) && (
          <div
            className="absolute border-2 border-emerald-400 rounded-xl pointer-events-none transition-all duration-75 shadow-[0_0_15px_rgba(16,185,129,0.6)]"
            style={faceRect ? {
              left: `${(1 - faceRect.x - faceRect.width) * 100}%`,
              top: `${faceRect.y * 100}%`,
              width: `${faceRect.width * 100}%`,
              height: `${faceRect.height * 100}%`
            } : { width: '40%', height: '55%', top: '22%', left: '30%' }}
          >
            <span className="absolute -top-6 left-0 bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded shadow">
              ✓ HUMAN FACE (99.4%)
            </span>
          </div>
        )}

        {/* Dual Coincidence Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow ${
            (faceDetected || manualFaceToggle) ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900/80 text-slate-400 border border-slate-700'
          }`}>
            {(faceDetected || manualFaceToggle) ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
            {(faceDetected || manualFaceToggle) ? 'Face Detected' : 'No Face in Frame'}
          </span>
        </div>

        {/* Manual Face Override for Demo testing without camera */}
        <div className="absolute bottom-4 right-4 z-10">
          <button
            onClick={() => setManualFaceToggle(!manualFaceToggle)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
              manualFaceToggle ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900/80 text-slate-300 border-slate-700'
            }`}
          >
            {manualFaceToggle ? '✓ Face Simulation ON' : 'Simulate Face ON'}
          </button>
        </div>
      </div>
    </div>
  );
}
