import React from 'react';
import { AlertTriangle, ArrowRight, BrainCircuit } from 'lucide-react';

export default function RiskAnalysisWidget({ riskData, setActiveTab }) {
  const riskColor = (level) => {
    if (level === 'HIGH') return { text: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.2)', bar: '#ef4444' };
    if (level === 'MEDIUM') return { text: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)', bar: '#f59e0b' };
    return { text: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)', bar: '#10b981' };
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
