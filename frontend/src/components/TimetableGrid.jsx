import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function TimetableGrid({ schedule, days, periods }) {
  return (
    <div className="glass-panel p-6 rounded-2xl overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
          Grade 10-A Weekly Schedule Matrix
        </h3>
        <span className="text-xs flex items-center gap-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          0 Conflicts Detected
        </span>
      </div>

      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="border-b text-xs uppercase" style={{ borderColor: 'var(--panel-border)', color: 'var(--text-secondary)' }}>
            <th className="py-3 px-4">Period</th>
            {days.map(day => (
              <th key={day} className="py-3 px-4">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y text-xs" style={{ borderColor: 'var(--panel-border)' }}>
          {periods.map(p => (
            <tr key={p} className="hover:bg-slate-500/10 transition">
              <td className="py-4 px-4 font-mono font-bold text-sky-500">P{p}</td>
              {days.map(day => {
                const slot = (schedule || []).find(s => s.day === day && s.period === p);
                if (!slot) return <td key={day} className="py-4 px-4" style={{ color: 'var(--text-muted)' }}>Free</td>;

                return (
                  <td key={day} className="py-4 px-4">
                    <div className={`p-2.5 rounded-xl border transition ${
                      slot.is_reassigned 
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500 pulse-glow-green font-bold' 
                        : 'app-subcard'
                    }`}>
                      <p className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{slot.subject_name}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{slot.teacher_name}</p>
                      <span className="text-[10px] text-sky-500 font-mono block mt-1">{slot.room_name}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
