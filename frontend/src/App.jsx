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

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [unreviewedCount, setUnreviewedCount] = useState(1);
  const [activeTheme, setActiveTheme] = useState('emerald');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [tourStep, setTourStep] = useState(null);
  const [showArchDrawer, setShowArchDrawer] = useState(false);

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
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} unreviewedCount={unreviewedCount} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
        <main className="flex-1 overflow-y-auto">{renderActiveView()}</main>
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
