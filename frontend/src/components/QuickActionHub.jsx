import React from 'react';
import { Sparkles, Calendar, UploadCloud, ShieldCheck, ArrowRight } from 'lucide-react';

export default function QuickActionHub({ setActiveTab, onTriggerTour, onShowArch }) {
  const actions = [
    { title: 'Interactive Product Tour', desc: 'Guided walkthrough of the 4 autonomous engine layers', icon: Sparkles, color: 'text-amber-400', action: onTriggerTour },
    { title: 'Simulate Teacher Disruption', desc: 'Test real-time OR-Tools CP-SAT substitution in <50ms', icon: Calendar, color: 'text-emerald-400', action: () => setActiveTab('timetable') },
    { title: 'Multimodal Dropzone', desc: 'Zero-shot parsing of handwritten admission forms', icon: UploadCloud, color: 'text-sky-400', action: () => setActiveTab('dropzone') },
    { title: 'Smart Kiosk Attendance', desc: 'Dual-modal face & QR scanning anti-proxy gate', icon: ShieldCheck, color: 'text-violet-400', action: () => setActiveTab('kiosk') }
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
        Autonomous Engine Navigation & Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} onClick={item.action} className="p-4 rounded-xl app-subcard hover:border-sky-500/40 transition cursor-pointer space-y-2 group">
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${item.color}`} />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <h4 className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
