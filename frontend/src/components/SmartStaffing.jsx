import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, AlertCircle, ShieldCheck, CheckCircle2, BarChart2 } from 'lucide-react';

export default function SmartStaffing() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/staffing/predict')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-2.5 py-0.5 rounded border border-indigo-500/30">
              Predictive Staffing Model
            </span>
            <span className="text-xs text-slate-400">Bonus Requirement</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Smart Staffing & Absenteeism Intelligence
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Uses historical school data to predict teacher absence spikes and recommend optimal substitute pool sizes ahead of time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Predicted Absence Rate</span>
          <p className="text-3xl font-extrabold text-amber-400">{data?.predicted_absenteeism_rate || '12%'}</p>
          <p className="text-xs text-slate-400">Spike expected on {data?.high_risk_days?.join(' & ') || 'Friday'}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Rec. Substitute Pool</span>
          <p className="text-3xl font-extrabold text-blue-400">{data?.recommended_substitute_pool || 3} Teachers</p>
          <p className="text-xs text-emerald-400 font-medium">Pre-allocated for Grade 10 & 11</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Faculty Capacity</span>
          <p className="text-3xl font-extrabold text-emerald-400">96.4%</p>
          <p className="text-xs text-slate-400">Balanced load across departments</p>
        </div>
      </div>

      {/* Department Workload Matrix */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          Departmental Workload & Stress Index
        </h3>
        <div className="space-y-3">
          {data?.department_load?.map((dept, idx) => (
            <div key={idx} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">{dept.department}</p>
                <p className="text-xs text-slate-400">Resource Utilization: {dept.utilization}</p>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                dept.status === 'HIGH_LOAD' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {dept.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
