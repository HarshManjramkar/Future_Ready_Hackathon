import React from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export default function TourGuide({ tourStep, setTourStep, setActiveTab }) {
  if (tourStep === null || tourStep > 3) return null;

  const steps = [
    { title: 'Welcome to EduFlow OS', desc: 'Autonomous school operations engine powered by Gemini VLM & OR-Tools CP-SAT.', tab: 'dashboard', actionText: 'Start Tour' },
    { title: 'Step 1: Reactive Timetable', desc: 'Simulate unexpected faculty leave. Watch the CP-SAT engine reassign classes in <50ms.', tab: 'timetable', actionText: 'Go to Timetable' },
    { title: 'Step 2: Magic Dropzone', desc: 'Drop raw handwritten admission forms and let multimodal AI extract structured JSON.', tab: 'dropzone', actionText: 'Go to Dropzone' },
    { title: 'Step 3: Smart Kiosk Attendance', desc: 'Verify how edge facial liveness blocks ID proxy fraud with zero hardware cost.', tab: 'kiosk', actionText: 'Go to Kiosk' }
  ];

  const current = steps[tourStep];

  const handleNext = () => {
    if (tourStep < 3) {
      const nextStep = tourStep + 1;
      setTourStep(nextStep);
      setActiveTab(steps[nextStep].tab);
    } else {
      setTourStep(null);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full p-5 glass-panel rounded-2xl border-2 border-emerald-500/50 shadow-2xl space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Guided Tour ({tourStep + 1}/4)
          </span>
        </div>
        <button onClick={() => setTourStep(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{current.title}</h4>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{current.detail || current.desc}</p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <button onClick={() => setTourStep(null)} className="text-xs text-slate-400 hover:underline cursor-pointer">Skip Tour</button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer transition"
        >
          <span>{current.actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
