import React from 'react';
import { UserCheck, ShieldAlert, CheckCircle2, Eye, FileImage } from 'lucide-react';

export default function KioskRosterGrid({
  students, handleSimulateScan, setViewCardModal, recentLogs
}) {
  return (
    <div className="space-y-6">
      {/* Student ID Scan Action Cards */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
          Grade 10 Test ID Cards (Live Scanning Test Roster)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {students.map((student) => (
            <div key={student.id} className="p-4 rounded-xl app-subcard flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-10 h-10 rounded-full object-cover border border-sky-500/30"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'; }}
                />
                <div>
                  <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{student.name}</h4>
                  <span className="text-[10px] text-sky-400 font-mono">ID: #{student.id}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulateScan(student.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    student.attendance_status === 'PRESENT'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{student.attendance_status === 'PRESENT' ? 'Present' : 'Scan'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adversarial Proxy Testing Trigger */}
      <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Adversarial Proxy Test</span>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>
            Simulate <strong>Buddy Punching</strong> (QR scanned while webcam has no face detected).
          </p>
        </div>
        <button
          onClick={() => handleSimulateScan('9905', true)}
          className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer transition"
        >
          Simulate Proxy Fraud
        </button>
      </div>

      {/* Recent Attendance Stream */}
      {recentLogs.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Live Attendance Verification Stream
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recentLogs.map((log, idx) => (
              <div key={idx} className="p-3 rounded-xl app-subcard flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{log.student?.name || 'Verified Student'}</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>({log.student?.grade})</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">{log.student?.check_in_time || 'Just now'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
