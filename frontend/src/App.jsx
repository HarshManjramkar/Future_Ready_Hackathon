import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardOverview from './components/DashboardOverview';
import MagicDropzone from './components/MagicDropzone';
import ReactiveTimetable from './components/ReactiveTimetable';
import SmartKiosk from './components/SmartKiosk';
import HumanReviewInbox from './components/HumanReviewInbox';
import SmartStaffing from './components/SmartStaffing';
import ArchitectureDrawer from './components/ArchitectureDrawer';
import IntroScreen from './components/IntroScreen';
import CommandPalette from './components/CommandPalette';
import TourGuide from './components/TourGuide';
import confetti from 'canvas-confetti';
import { AlertTriangle, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [unreviewedCount, setUnreviewedCount] = useState(1);
  const [activeTheme, setActiveTheme] = useState('emerald');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [tourStep, setTourStep] = useState(null);
  const [showArchDrawer, setShowArchDrawer] = useState(false);
  const [isAlertExpanded, setIsAlertExpanded] = useState(false);
  const [highLoadActive, setHighLoadActive] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-midnight', 'theme-stone', 'theme-light');
    if (activeTheme !== 'emerald') root.classList.add(`theme-${activeTheme}`);
  }, [activeTheme]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandOpen(false);
        setShowArchDrawer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDemoTriggerLeave = async () => {
    setActiveTab('timetable');
    try {
      const res = await fetch('/api/timetable/disruption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: 'TCH_101', day: 'Monday' })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') confetti({ particleCount: 50, spread: 60 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDemoTriggerMassAbsence = async () => {
    setActiveTab('timetable');
    try {
      const res = await fetch('/api/demo/mass-absence', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'SUCCESS') confetti({ particleCount: 80, spread: 80 });
    } catch (err) {
      console.error(err);
    }
  };

  const tabTitles = {
    dashboard: 'Overview',
    dropzone: 'Document Scanner',
    timetable: 'Timetable & Substitutes',
    kiosk: 'Attendance Kiosk',
    review: 'Human Review Inbox',
    staffing: 'Staffing Analytics'
  };

  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        confetti({ particleCount: 60, spread: 70 });
        setUnreviewedCount(0);
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview setActiveTab={setActiveTab} unreviewedCount={unreviewedCount} onTriggerTour={() => setTourStep(0)} onShowArch={() => setShowArchDrawer(true)} activeTheme={activeTheme} setActiveTheme={setActiveTheme} />;
      case 'dropzone':
        return <MagicDropzone />;
      case 'timetable':
        return <ReactiveTimetable />;
      case 'kiosk':
        return <SmartKiosk />;
      case 'review':
        return <HumanReviewInbox onVerificationComplete={() => setUnreviewedCount(prev => Math.max(0, prev - 1))} />;
      case 'staffing':
        return <SmartStaffing />;
      default:
        return <DashboardOverview setActiveTab={setActiveTab} unreviewedCount={unreviewedCount} onTriggerTour={() => setTourStep(0)} onShowArch={() => setShowArchDrawer(true)} activeTheme={activeTheme} setActiveTheme={setActiveTheme} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}
      
      <div className="print:hidden h-full">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} unreviewedCount={unreviewedCount} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        <div className="print:hidden">
          <Header
            title={tabTitles[activeTab] || 'Overview'}
          onSearchClick={() => setIsCommandOpen(true)}
          onTriggerLeave={handleDemoTriggerLeave}
          onTriggerVlm={() => setActiveTab('dropzone')}
          onTriggerMassAbsence={handleDemoTriggerMassAbsence}
          onResetDemo={handleResetDemo}
          onTriggerTour={() => setTourStep(0)}
          activeTheme={activeTheme}
          setActiveTheme={setActiveTheme}
        />
        </div>
        
        {/* Tactical Command Center: High Load Alert */}
        <AnimatePresence>
          {highLoadActive && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-orange-500/30 bg-gradient-to-r from-orange-950/40 via-red-900/20 to-orange-950/40 backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
              
              <div 
                className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-orange-900/10 transition-colors z-10 relative"
                onClick={() => setIsAlertExpanded(!isAlertExpanded)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-orange-500/20 rounded-md border border-orange-500/50">
                    <AlertTriangle className="w-5 h-5 text-orange-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-orange-100 font-semibold text-sm flex items-center gap-2">
                      SYSTEM ALERT: HIGH DEPARTMENTAL LOAD
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase tracking-wider">
                        Mathematics
                      </span>
                    </h3>
                  </div>
                </div>
                <button className="text-orange-400 hover:text-orange-200 p-1 rounded-md hover:bg-orange-500/20 transition-colors">
                  {isAlertExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              <AnimatePresence>
                {isAlertExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 pt-1 flex items-start gap-6 border-t border-orange-500/10 ml-[52px]">
                      <div className="flex-1 text-sm text-orange-200/80 leading-relaxed">
                        <p className="mb-2">
                          The Mathematics department is currently operating at <strong className="text-orange-300">92% resource utilization</strong> due to recent unassigned faculty absences. Prolonged operation above 85% significantly increases burnout risk.
                        </p>
                        <p>Recommended Action: Trigger the CP-SAT engine to instantly re-balance substitute coverage from adjacent departments.</p>
                      </div>
                      <div className="shrink-0">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setHighLoadActive(false);
                            setActiveTab('timetable');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-md text-sm font-medium shadow-lg shadow-orange-900/20 transition-all hover:scale-105 active:scale-95 border border-orange-400/50"
                        >
                          <Zap className="w-4 h-4" />
                          Auto-Balance Staffing
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto print:overflow-visible print:bg-white">{renderActiveView()}</main>
      </div>

      <CommandPalette
        isCommandOpen={isCommandOpen}
        setIsCommandOpen={setIsCommandOpen}
        commandInput={commandInput}
        setCommandInput={setCommandInput}
        setActiveTab={setActiveTab}
        handleDemoTriggerLeave={handleDemoTriggerLeave}
        handleDemoTriggerMassAbsence={handleDemoTriggerMassAbsence}
      />

      <TourGuide tourStep={tourStep} setTourStep={setTourStep} setActiveTab={setActiveTab} />
      <ArchitectureDrawer isOpen={showArchDrawer} onClose={() => setShowArchDrawer(false)} />
    </div>
  );
}
