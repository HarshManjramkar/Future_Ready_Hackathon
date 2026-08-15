import React, { useRef, useEffect } from 'react';
import { Search, X, Zap, Calendar, UploadCloud, ShieldCheck, Sparkles } from 'lucide-react';

export default function CommandPalette({
  isCommandOpen, setIsCommandOpen, commandInput, setCommandInput,
  setActiveTab, handleDemoTriggerLeave, handleDemoTriggerMassAbsence
}) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isCommandOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isCommandOpen]);

  if (!isCommandOpen) return null;

  const actions = [
    { label: 'Go to Operations Dashboard', icon: Sparkles, action: () => { setActiveTab('dashboard'); setIsCommandOpen(false); } },
    { label: 'Simulate Single Teacher Leave (0.04s CP-SAT)', icon: Zap, action: () => { handleDemoTriggerLeave(); setIsCommandOpen(false); } },
    { label: 'Simulate Mass Faculty Absence', icon: Calendar, action: () => { handleDemoTriggerMassAbsence(); setIsCommandOpen(false); } },
    { label: 'Open Multimodal Magic Dropzone', icon: UploadCloud, action: () => { setActiveTab('dropzone'); setIsCommandOpen(false); } },
    { label: 'Open Smart Kiosk Attendance Gate', icon: ShieldCheck, action: () => { setActiveTab('kiosk'); setIsCommandOpen(false); } }
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(commandInput.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-24 p-4">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-sky-500/30 overflow-hidden shadow-2xl space-y-2">
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--panel-border)' }}>
          <Search className="w-5 h-5 text-sky-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Type a command or search action (e.g. 'simulate', 'kiosk')..."
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          <button onClick={() => setIsCommandOpen(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 max-h-72 overflow-y-auto space-y-1">
          {filtered.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={item.action}
                className="p-3 rounded-xl app-subcard hover:border-sky-500/40 flex items-center justify-between transition cursor-pointer text-xs"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-sky-400" />
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Jump &rarr;</span>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-xs text-center py-6 text-slate-400">No matching command found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
