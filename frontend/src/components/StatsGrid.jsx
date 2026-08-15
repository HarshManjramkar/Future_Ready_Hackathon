import React from 'react';
import { Users, UserCheck, Calendar, FileText } from 'lucide-react';

export default function StatsGrid({ stats, setActiveTab }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Enrollment */}
      <div className="glass-panel p-5 rounded-2xl space-y-2 hover:border-sky-500/30 transition cursor-pointer" onClick={() => setActiveTab('kiosk')}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Total Enrolled</span>
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400"><Users className="w-5 h-5" /></div>
        </div>
        <div className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          {stats.total_enrollment || 17}
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>CBSE Class 10 Roster</p>
      </div>

      {/* Attendance Percentage */}
      <div className="glass-panel p-5 rounded-2xl space-y-2 hover:border-emerald-500/30 transition cursor-pointer" onClick={() => setActiveTab('kiosk')}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Attendance Today</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"><UserCheck className="w-5 h-5" /></div>
        </div>
        <div className="text-3xl font-extrabold text-emerald-400" style={{ fontFamily: 'var(--font-display)' }}>
          {stats.attendance_percentage}%
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{stats.present_count} / {stats.kiosk_students_count} Verified via Kiosk</p>
      </div>

      {/* Schedule Conflicts */}
      <div className="glass-panel p-5 rounded-2xl space-y-2 hover:border-amber-500/30 transition cursor-pointer" onClick={() => setActiveTab('timetable')}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Schedule Conflicts</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400"><Calendar className="w-5 h-5" /></div>
        </div>
        <div className="text-3xl font-extrabold text-emerald-400" style={{ fontFamily: 'var(--font-display)' }}>
          {stats.schedule_conflicts}
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>0 Double-Booking Violations</p>
      </div>

      {/* Human Review Inbox */}
      <div className="glass-panel p-5 rounded-2xl space-y-2 hover:border-violet-500/30 transition cursor-pointer" onClick={() => setActiveTab('review')}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Human Review Inbox</span>
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400"><FileText className="w-5 h-5" /></div>
        </div>
        <div className="text-3xl font-extrabold text-violet-400" style={{ fontFamily: 'var(--font-display)' }}>
          {stats.unreviewed_inbox_count || 0}
        </div>
        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Pending Verification Documents</p>
      </div>
    </div>
  );
}
