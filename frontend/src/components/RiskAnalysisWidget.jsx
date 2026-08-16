import React from 'react';
import { AlertTriangle, ArrowRight, BrainCircuit } from 'lucide-react';

export default function RiskAnalysisWidget({ riskData, setActiveTab }) {
  const riskColor = (level) => {
    if (level === 'HIGH') return { text: 'color(display-p3 0.973 0.443 0.443)', bg: 'color(display-p3 0.937 0.267 0.267 / 0.12)', border: 'color(display-p3 0.937 0.267 0.267 / 0.2)', bar: 'color(display-p3 0.937 0.267 0.267)' };
    if (level === 'MEDIUM') return { text: 'color(display-p3 0.984 0.749 0.141)', bg: 'color(display-p3 0.961 0.620 0.043 / 0.12)', border: 'color(display-p3 0.961 0.620 0.043 / 0.2)', bar: 'color(display-p3 0.961 0.620 0.043)' };
    return { text: 'color(display-p3 0.204 0.827 0.600)', bg: 'color(display-p3 0.063 0.725 0.506 / 0.12)', border: 'color(display-p3 0.063 0.725 0.506 / 0.2)', bar: 'color(display-p3 0.063 0.725 0.506)' };
  };

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Predictive Student Truancy & Academic Risk Forecast
          </h3>
        </div>
        <button onClick={() => setActiveTab('staffing')} className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 cursor-pointer">
          <span>View Detailed Model</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {riskData.map((item) => {
          const c = riskColor(item.risk_level);
          return (
            <div key={item.id} className="p-4 rounded-xl app-subcard space-y-2 border" style={{ borderColor: c.border }}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs" style={{ color: 'var(--text-primary)' }}>{item.name} ({item.grade})</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ color: c.text, background: c.bg }}>
                  {item.risk_level} RISK
                </span>
              </div>
              <div className="w-full bg-slate-800/40 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${item.risk_score}%`, backgroundColor: c.bar }} />
              </div>
              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{item.recommendation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
