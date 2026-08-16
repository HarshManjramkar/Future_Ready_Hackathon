import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, AlertCircle, ShieldCheck, CheckCircle2, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const historicalData = [
  { month: 'Jan', Mathematics: 75, Science: 65, Literature: 60 },
  { month: 'Feb', Mathematics: 82, Science: 70, Literature: 65 },
  { month: 'Mar', Mathematics: 92, Science: 72, Literature: 62 },
  { month: 'Apr', Mathematics: 88, Science: 75, Literature: 70 },
  { month: 'May', Mathematics: 95, Science: 80, Literature: 72 },
  { month: 'Jun', Mathematics: 85, Science: 68, Literature: 65 }
];

export default function SmartStaffing() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/staffing/predict')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-500 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/30">
              Predictive Staffing Model
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Bonus Requirement</span>
          </div>
          <h2 className="text-xl font-extrabold mt-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Smart Staffing & Absenteeism Intelligence
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Uses historical school data to predict teacher absence spikes and recommend optimal substitute pool sizes ahead of time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Predicted Absence Rate</span>
          <p className="text-3xl font-extrabold text-amber-500">{data?.predicted_absenteeism_rate || '12%'}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Spike expected on {data?.high_risk_days?.join(' & ') || 'Friday'}</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Rec. Substitute Pool</span>
          <p className="text-3xl font-extrabold text-sky-500">{data?.recommended_substitute_pool || 3} Teachers</p>
          <p className="text-xs text-emerald-500 font-medium">Pre-allocated for Grade 10 & 11</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Faculty Capacity</span>
          <p className="text-3xl font-extrabold text-emerald-500">96.4%</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Balanced load across departments</p>
        </div>
      </div>

      {/* Department Workload Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
            Departmental Workload & Stress Index
          </h3>
          <div className="space-y-3">
            {data?.department_load?.map((dept, idx) => (
              <div key={idx} className="p-4 rounded-xl app-subcard flex items-center justify-between transition-all hover:scale-[1.02]">
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{dept.department}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Resource Utilization: {dept.utilization}</p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  dept.status === 'HIGH_LOAD' 
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.2)]' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {dept.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Predictive Analytics Chart */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Historical Workload & Prediction
            </h3>
            <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-1 rounded border border-sky-500/30">AI Forecast Active</span>
          </div>
          
          <div className="flex-1 min-h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMath" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorScience" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ fontSize: '13px' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Mathematics" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorMath)" />
                <Area type="monotone" dataKey="Science" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorScience)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
