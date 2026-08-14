import React from 'react';
import { Search, Zap, Building2, RefreshCw } from 'lucide-react';

export default function Header({
  title,
  subtitle,
  onSearchClick,
  onTriggerLeave,
  onTriggerVlm,
  onTriggerMassAbsence,
  onResetDemo
}) {
  return (
    <div className="flex flex-col sticky top-0 z-30 transition-all duration-300"
      style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--panel-border)' }}>

      {/* Top Header */}
      <header className="h-16 px-7 flex items-center justify-between backdrop-blur-md">
        <div>
          {/* Breadcrumb trail */}
          <p className="editorial-label mb-1" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
            Victory High School &rsaquo; {title}
          </p>
          <h2 className="display-heading text-lg" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* CMD+K Search */}
          <button
            onClick={onSearchClick}
            className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-[11px] cursor-pointer transition bento-cell"
            style={{ color: 'var(--text-secondary)' }}
          >
            <div className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
              <span style={{ fontFamily: 'var(--font-body)' }}>Search or command...</span>
            </div>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded-lg text-[9px]"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--panel-border)', fontFamily: 'var(--font-mono)' }}>
              ⌘K
            </kbd>
          </button>

        </div>
      </header>

      {/* Demo Action Strip */}
      <div className="px-7 py-2 flex flex-wrap items-center gap-2 text-xs"
        style={{ borderTop: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.15)' }}>

        <div className="flex items-center gap-1.5 mr-2" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
          <Zap className="w-3 h-3" />
          <span className="editorial-label">Quick Actions</span>
        </div>

        <button onClick={onTriggerLeave}
          className="px-3 py-1 rounded-full font-semibold transition cursor-pointer text-[10px] flex items-center gap-1.5"
          style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.1)'}
        >
          <Zap className="w-2.5 h-2.5" /> Staff Leave
        </button>

        <button onClick={onTriggerVlm}
          className="px-3 py-1 rounded-full font-semibold transition cursor-pointer text-[10px] flex items-center gap-1.5"
          style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.1)'}
        >
          <Search className="w-2.5 h-2.5" /> Admission Form
        </button>

        <button onClick={onTriggerMassAbsence}
          className="px-3 py-1 rounded-full font-semibold transition cursor-pointer text-[10px] flex items-center gap-1.5"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
        >
          <Building2 className="w-2.5 h-2.5" /> Mass Absence
        </button>

        <button onClick={onResetDemo}
          className="px-3 py-1 rounded-full font-semibold transition cursor-pointer text-[10px] flex items-center gap-1.5 ml-auto"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--panel-border)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <RefreshCw className="w-2.5 h-2.5" /> Reset
        </button>
      </div>
    </div>
  );
}
