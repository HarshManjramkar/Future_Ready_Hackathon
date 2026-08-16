import React from 'react';
import { Search, Sparkles, RefreshCw, Palette } from 'lucide-react';

export default function Header({
  title,
  subtitle,
  onSearchClick,
  onResetDemo,
  onTriggerTour,
  activeTheme,
  setActiveTheme
}) {
  const themes = [
    { id: 'emerald', name: 'Emerald', dot: 'rgb(16, 185, 129)' },
    { id: 'midnight', name: 'Midnight', dot: 'rgb(99, 102, 241)' },
    { id: 'light', name: 'Light', dot: 'rgb(203, 213, 225)' }
  ];

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

        <div className="flex items-center gap-3">
          {/* Theme Quick Toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTheme && setActiveTheme(t.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTheme === t.id 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Switch to ${t.name} Theme`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.dot }} />
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          {/* Guided Tour Launcher Button */}
          <button
            onClick={onTriggerTour}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guided Tour</span>
          </button>

          {/* Reset Demo Button */}
          <button 
            onClick={onResetDemo}
            className="px-3 py-1.5 rounded-xl font-bold transition cursor-pointer text-xs flex items-center gap-1.5"
            style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', border: '1px solid var(--panel-border)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>

          {/* CMD+K Search */}
          <button
            onClick={onSearchClick}
            className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-[11px] cursor-pointer transition bento-cell"
            style={{ color: 'var(--text-secondary)' }}
          >
            <div className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
              <span style={{ fontFamily: 'var(--font-body)' }}>Search...</span>
            </div>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded-lg text-[9px]"
              style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)', border: '1px solid var(--panel-border)', fontFamily: 'var(--font-mono)' }}>
              ⌘K
            </kbd>
          </button>
        </div>
      </header>
    </div>
  );
}
