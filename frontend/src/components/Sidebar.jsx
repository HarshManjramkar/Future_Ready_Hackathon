import React from 'react';
import {
  LayoutDashboard,
  FileSearch,
  CalendarClock,
  QrCode,
  TrendingUp,
  Inbox,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, unreviewedCount }) {
  const menuItems = [
    { id: 'dashboard',  label: 'Overview',                icon: LayoutDashboard },
    { id: 'dropzone',   label: 'Document Scanner',        icon: FileSearch,     tag: 'AI Vision' },
    { id: 'timetable',  label: 'Timetable & Substitutes', icon: CalendarClock,  tag: 'Auto-Solver' },
    { id: 'kiosk',      label: 'Attendance Kiosk',        icon: QrCode,         tag: 'Face Verify' },
    { id: 'review',     label: 'Admin Inbox',             icon: Inbox,          count: unreviewedCount },
    { id: 'staffing',   label: 'Staffing Analytics',      icon: TrendingUp },
  ];

  return (
    <aside className="w-64 flex flex-col justify-between p-5 min-h-screen transition-all duration-300"
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--panel-border)' }}>

      <div>
        {/* Brand */}
        <div className="px-1 py-5 mb-6 border-b" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)' }}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-tight" style={{ fontFamily: 'var(--font-body)' }}>
                EduFlow
                <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 font-normal">v1.1</span>
              </h1>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--sidebar-text)', fontFamily: 'var(--font-body)' }}>
                Victory High School
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5">
          <p className="editorial-label px-3 mb-3" style={{ color: 'var(--sidebar-text)', opacity: 0.5 }}>
            Main Menu
          </p>
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 cursor-pointer animate-fade-up`}
                style={{
                  animationDelay: `${i * 0.06}s`,
                  background: isActive ? 'rgba(16,185,129,0.12)' : 'transparent',
                  color: isActive ? 'var(--accent-color)' : 'var(--sidebar-text)',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Active left bar */}
                {isActive && <span className="nav-active-indicator" />}

                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: isActive ? 'var(--accent-color)' : 'var(--sidebar-text)' }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: isActive ? 600 : 400 }}>
                    {item.label}
                  </span>
                </div>

                {item.tag && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{
                      background: isActive ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                      color: isActive ? 'var(--accent-color)' : 'var(--sidebar-text)',
                      fontFamily: 'var(--font-mono)',
                      border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                    {item.tag}
                  </span>
                )}

                {item.count > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer — School Info */}
      <div className="p-3.5 rounded-2xl space-y-2.5 bento-cell">
        <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--sidebar-text)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span style={{ fontFamily: 'var(--font-mono)' }}>All Systems Operational</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--sidebar-text)', opacity: 0.5 }}>
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span style={{ fontFamily: 'var(--font-body)' }}>Academic Year 2026 – 27</span>
        </div>
      </div>
    </aside>
  );
}
