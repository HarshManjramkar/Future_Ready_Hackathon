import React, { useState } from 'react';
import { Landmark, ShieldCheck, QrCode, Download, Printer, X, Sparkles, Check } from 'lucide-react';

export default function StudentIdCardModal({ isOpen, onClose, students = [] }) {
  const [selectedStudent, setSelectedStudent] = useState(null);

  if (!isOpen) return null;

  const currentStudent = selectedStudent || students[0] || {
    id: "9901",
    name: "Arjun Sharma",
    grade: "Grade 10-A",
    roll_no: "9901",
    phone: "+91 76207 99602",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentStudent.id || "9901")}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="px-7 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                Official Student Smart ID Badges
              </h3>
              <p className="text-xs text-slate-400">Select any student ID card to print or hold up to your camera</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Student Grid + Selected Card Preview */}
        <div className="p-7 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-7">
          {/* Left Side: Student Selection Roster (5 Cols) */}
          <div className="md:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
              Select Student ({students.length} Total)
            </span>
            {students.map(s => {
              const isSelected = currentStudent.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  className={`w-full p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between text-left ${
                    isSelected 
                      ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-md' 
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={s.avatar} alt={s.name} className="w-9 h-9 rounded-xl object-cover border border-slate-700" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{s.name}</h4>
                      <p className="text-[10px] font-mono text-slate-400">ID: STU-{s.id}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Right Side: High-Tech Printable Holographic Badge Preview (7 Cols) */}
          <div className="md:col-span-7 flex flex-col items-center justify-center space-y-5">
            {/* Holographic ID Badge Container */}
            <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-[0_0_40px_rgba(245,158,11,0.15)] relative overflow-hidden space-y-5 print:shadow-none">
              {/* Badge Gold Crest Header */}
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white tracking-wide">VICTORY HIGH SCHOOL</h4>
                    <p className="text-[9px] text-amber-400 font-mono">CBFC ACCREDITED • EST. 2026</p>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>

              {/* Student Details & Photo */}
              <div className="flex items-center gap-4">
                <img 
                  src={currentStudent.avatar} 
                  alt={currentStudent.name} 
                  className="w-20 h-24 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md shrink-0"
                />
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 inline-block">
                    STUDENT ID BADGE
                  </span>
                  <h3 className="text-lg font-black text-white tracking-tight">{currentStudent.name}</h3>
                  <p className="text-xs font-mono text-slate-300">Grade: {currentStudent.grade || "Grade 10-A"}</p>
                  <p className="text-xs font-mono text-emerald-400 font-bold">ID No: STU-{currentStudent.id}</p>
                </div>
              </div>

              {/* High Contrast QR Code Frame for Kiosk Camera Scan */}
              <div className="bg-white p-3.5 rounded-2xl flex items-center justify-between shadow-inner">
                <img src={qrImageUrl} alt="Student QR" className="w-28 h-28 shrink-0 border border-slate-200 rounded-lg" />
                <div className="pl-4 space-y-1 text-slate-900">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Scan at Kiosk Gate</p>
                  <p className="text-xs font-mono font-black">{currentStudent.id}</p>
                  <p className="text-[10px] text-slate-600">Dual Coincidence Verified</p>
                  <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-700 font-bold mt-1">
                    <ShieldCheck className="w-3 h-3" /> OFFICIAL BADGE
                  </div>
                </div>
              </div>
            </div>

            {/* Print / Download Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Student Card</span>
              </button>
              <a
                href={qrImageUrl}
                target="_blank"
                rel="noreferrer"
                download={`Student_ID_${currentStudent.id}.png`}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download QR Image</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
