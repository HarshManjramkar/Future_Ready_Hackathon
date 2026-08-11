import React, { useState, useEffect, useRef } from 'react';
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
import { 
  Search, 
  Zap, 
  Laptop, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  X,
  Cpu,
  ShieldCheck,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Intro screen — replays on every page refresh since React state resets on reload
  const [showIntro, setShowIntro] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [unreviewedCount, setUnreviewedCount] = useState(1);
  const [activeTheme, setActiveTheme] = useState('emerald');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [commandAlert, setCommandAlert] = useState(null);
  
  // Custom Demo/Tour State
  const [tourStep, setTourStep] = useState(null);
  const [showArchDrawer, setShowArchDrawer] = useState(false);
  const [presetToLoad, setPresetToLoad] = useState(null);
  const [timetableRefreshKey, setTimetableRefreshKey] = useState(0);
  const [kioskRefreshKey, setKioskRefreshKey] = useState(0);

  const searchInputRef = useRef(null);

  // Apply theme classes to document root for global Tailwind v4 bindings
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-midnight', 'theme-stone');
    if (activeTheme !== 'emerald') {
      root.classList.add(`theme-${activeTheme}`);
    }
  }, [activeTheme]);

  // Command Palette global shortcut listener (CMD+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Trigger Tour Welcomer on every load/refresh
  useEffect(() => {
    setTourStep(0);
  }, []);

  useEffect(() => {
    if (isCommandOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isCommandOpen]);

  const handleParsedDocument = (parsedData) => {
    if (parsedData?.requires_human_review) {
      setUnreviewedCount(prev => prev + 1);
    }
  };

  // Demo actions Handlers
  const handleDemoTriggerLeave = async () => {
    setActiveTab('timetable');
    try {
      const res = await fetch('/api/timetable/disruption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_id: 'T101', day: 'Monday' })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        confetti({ particleCount: 50, spread: 60 });
        setTimetableRefreshKey(prev => prev + 1);
        triggerAlert("Substitute Disruption Solved Live in 0.04 seconds!");
      }
    } catch (err) {
      triggerAlert("Failed to simulate leave disruption.");
    }
  };

  const handleDemoTriggerVlm = () => {
    setActiveTab('dropzone');
    setPresetToLoad('leave');
    triggerAlert("Injecting handwritten leave form preset to VLM parser...");
  };

  const handleDemoTriggerMassAbsence = async () => {
    setActiveTab('timetable');
    try {
      const res = await fetch('/api/demo/mass-absence', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        confetti({ particleCount: 85, spread: 75 });
        setTimetableRefreshKey(prev => prev + 1);
        triggerAlert("Simulated mass absences resolved live by CP-SAT solver!");
      }
    } catch (err) {
      triggerAlert("Failed to run mass absence simulation.");
    }
  };

  const handleDemoReset = async () => {
    try {
      const res = await fetch('/api/demo/reset', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setTimetableRefreshKey(prev => prev + 1);
        setKioskRefreshKey(prev => prev + 1);
        setUnreviewedCount(0);
        triggerAlert("Demo state successfully reset to default.");
      }
    } catch (err) {
      triggerAlert("Failed to reset demo state.");
    }
  };

  const allCommands = [
    {
      id: 'tour',
      keywords: ['tour', 'help', 'guide', 'start'],
      title: '▶ Start Guided System Tour',
      subtitle: 'Walkthrough of the autonomous campus features',
      action: () => executeCommand('tour')
    },
    {
      id: 'theme-emerald',
      keywords: ['theme emerald', 'emerald', 'green', 'forest'],
      title: '🎨 Switch to Emerald Forest Theme',
      subtitle: 'Set deep forest-green neumorphic look',
      action: () => executeCommand('theme emerald')
    },
    {
      id: 'theme-midnight',
      keywords: ['theme midnight', 'midnight', 'blue', 'dark'],
      title: '🎨 Switch to Midnight Tactical Theme',
      subtitle: 'Set operations-blue dark look',
      action: () => executeCommand('theme midnight')
    },
    {
      id: 'theme-stone',
      keywords: ['theme stone', 'stone', 'warm', 'light', 'paper'],
      title: '🎨 Switch to Warm Stone Theme',
      subtitle: 'Set warm paper light look',
      action: () => executeCommand('theme stone')
    },
    {
      id: 'absent-t101',
      keywords: ['absent t101', 'leave ramesh', 'verma', 'sick'],
      title: '⚡ Mark Dr. Ramesh Verma Absent',
      subtitle: 'Triggers CP-SAT solver for Periods 1 & 3',
      action: () => executeCommand('absent T101')
    },
    {
      id: 'absent-t102',
      keywords: ['absent t102', 'leave ananya', 'gupta', 'sick'],
      title: '⚡ Mark Ms. Ananya Gupta Absent',
      subtitle: 'Triggers substitute reallocations for English',
      action: () => executeCommand('absent T102')
    },
    {
      id: 'go-dashboard',
      keywords: ['go dashboard', 'navigate overview', 'home'],
      title: '🔗 Go to Command Center Overview',
      subtitle: 'View overall operations metrics',
      action: () => executeCommand('go dashboard')
    },
    {
      id: 'go-dropzone',
      keywords: ['go dropzone', 'navigate scanner', 'upload', 'vlm'],
      title: '🔗 Go to Magic Document Scanner',
      subtitle: 'Zero-shot paper ingestion VLM panel',
      action: () => executeCommand('go dropzone')
    },
    {
      id: 'go-timetable',
      keywords: ['go timetable', 'navigate schedule', 'matrix'],
      title: '🔗 Go to Reactive Timetable',
      subtitle: 'OR-Tools CP-SAT matrix details',
      action: () => executeCommand('go timetable')
    },
    {
      id: 'go-kiosk',
      keywords: ['go kiosk', 'navigate attendance', 'camera', 'face'],
      title: '🔗 Go to Smart Kiosk',
      subtitle: 'Anti-buddy punching verification feed',
      action: () => executeCommand('go kiosk')
    },
    {
      id: 'reset',
      keywords: ['reset database', 'clear', 'wipe', 'default'],
      title: '🔄 Reset System Demo State',
      subtitle: 'Restore database variables to clean state',
      action: () => handleDemoReset()
    }
  ];

  const filteredCommands = allCommands.filter(c => {
    if (!commandInput) return true;
    const input = commandInput.toLowerCase().trim();
    return c.keywords.some(kw => kw.includes(input)) || c.title.toLowerCase().includes(input);
  });

  // Run command engine
  const executeCommand = async (rawCmd) => {
    const cmd = rawCmd.toLowerCase().trim();
    if (!cmd) return;

    if (cmd === 'tour' || cmd === 'help') {
      setTourStep(0);
      triggerAlert("Initializing Guided Tour...");
    } else if (cmd === 'theme') {
      triggerAlert("Try typing: 'theme emerald', 'theme midnight', 'theme stone'");;
    } else if (cmd.startsWith('theme ')) {
      const targetTheme = cmd.replace('theme ', '').trim();
      if (['midnight', 'stone', 'emerald'].includes(targetTheme)) {
        setActiveTheme(targetTheme);
        triggerAlert(`Theme shifted to ${targetTheme.toUpperCase()}!`);
      } else {
        triggerAlert(`Unknown theme: ${targetTheme}. Try 'midnight', 'stone', or 'emerald'.`);
      }
    } else if (cmd.startsWith('absent ')) {
      const teacherId = cmd.replace('absent ', '').toUpperCase().trim();
      try {
        const res = await fetch('/api/timetable/disruption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teacher_id: teacherId, day: 'Monday' })
        });
        const data = await res.json();
        if (data.status === 'SUCCESS') {
          confetti({ particleCount: 40, spread: 50 });
          setTimetableRefreshKey(prev => prev + 1);
          triggerAlert(`Disruption Resolved: Substitutes assigned for ${teacherId}!`);
        } else {
          triggerAlert(`Failed to resolve absence for ${teacherId}.`);
        }
      } catch (err) {
        triggerAlert('Error calling timetable solver.');
      }
    } else if (cmd.startsWith('go ')) {
      const dest = cmd.replace('go ', '').trim();
      const tabMap = {
        'dashboard': 'dashboard',
        'overview': 'dashboard',
        'dropzone': 'dropzone',
        'scanner': 'dropzone',
        'timetable': 'timetable',
        'schedule': 'timetable',
        'kiosk': 'kiosk',
        'attendance': 'kiosk',
        'review': 'review',
        'approvals': 'review',
        'staffing': 'staffing'
      };
      if (tabMap[dest]) {
        setActiveTab(tabMap[dest]);
        triggerAlert(`Navigating to ${dest.toUpperCase()}...`);
      } else {
        triggerAlert(`Unknown view: ${dest}. Try 'dropzone', 'timetable', 'kiosk', etc.`);
      }
    } else if (cmd.startsWith('admit ')) {
      const name = cmd.replace('admit ', '').trim();
      try {
        const res = await fetch('/api/document/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            index: 0,
            student_info: { full_name: name, aadhaar_number: '1111-2222-3333', class_applying_for: 'Grade 10-A' },
            parent_info: { father_mobile: '+91 99999 88888' },
            address: { city: 'New Delhi' }
          })
        });
        triggerAlert(`Successfully admitted student: ${name}!`);
      } catch (err) {
        triggerAlert('Failed to execute command admission.');
      }
    } else {
      // Fuzzy match fallback search
      const match = allCommands.find(c => c.keywords.some(kw => kw.includes(cmd)) || c.title.toLowerCase().includes(cmd));
      if (match) {
        match.action();
      } else {
        triggerAlert(`Command not recognized: '${cmd}'. Try typing 'help' or 'tour'.`);
      }
    }

    setCommandInput('');
    setIsCommandOpen(false);
  };

  const triggerAlert = (msg) => {
    setCommandAlert(msg);
    setTimeout(() => setCommandAlert(null), 4000);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            setActiveTab={setActiveTab} 
            unreviewedCount={unreviewedCount}
            activeTheme={activeTheme}
            setActiveTheme={setActiveTheme}
            onTriggerTour={() => setTourStep(0)}
            onShowArch={() => setShowArchDrawer(true)}
          />
        );
      case 'dropzone':
        return (
          <MagicDropzone 
            autoLoadPreset={presetToLoad} 
            onAutoLoadComplete={() => setPresetToLoad(null)} 
            onParsedDocument={handleParsedDocument} 
          />
        );
      case 'timetable':
        return <ReactiveTimetable key={timetableRefreshKey} />;
      case 'kiosk':
        return <SmartKiosk key={kioskRefreshKey} />;
      case 'review':
        return <HumanReviewInbox />;
      case 'staffing':
        return <SmartStaffing />;
      default:
        return <DashboardOverview setActiveTab={setActiveTab} unreviewedCount={unreviewedCount} />;
    }
  };

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return { title: 'Smart Campus Command Center', subtitle: 'Real-time overview of school operations, timetables, and documents' };
      case 'dropzone':
        return { title: 'Magic Dropzone Reader', subtitle: 'Zero-shot VLM paper form parsing & data structuring' };
      case 'timetable':
        return { title: 'Reactive Timetable Engine', subtitle: 'Google OR-Tools CP-SAT constraint solver & live disruption engine' };
      case 'kiosk':
        return { title: 'Smart Kiosk Attendance', subtitle: 'Anti-buddy punching scanner with webcam face tracking' };
      case 'review':
        return { title: 'Human Review Inbox', subtitle: 'Verify smudged handwriting and edge-case form extractions' };
      case 'staffing':
        return { title: 'Smart Staffing Intelligence', subtitle: 'Predictive teacher requirement & capacity planning' };
      default:
        return { title: 'EduFlow OS Dashboard', subtitle: 'Autonomous School Operations Engine' };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <>
      {showIntro && <IntroScreen onComplete={() => setShowIntro(false)} />}
      <div className="flex min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        unreviewedCount={unreviewedCount} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header 
          title={title} 
          subtitle={subtitle} 
          onSearchClick={() => setIsCommandOpen(true)}
          activeTheme={activeTheme}
          setActiveTheme={setActiveTheme}
          onTriggerLeave={handleDemoTriggerLeave}
          onTriggerVlm={handleDemoTriggerVlm}
          onTriggerMassAbsence={handleDemoTriggerMassAbsence}
          onResetDemo={handleDemoReset}
          onShowArch={() => setShowArchDrawer(true)}
        />
        <div className="flex-1 pb-16">
          {renderContent()}
        </div>
      </main>

      {/* Architecture Spec slide-over */}
      <ArchitectureDrawer 
        isOpen={showArchDrawer} 
        onClose={() => setShowArchDrawer(false)} 
      />

      {/* AskEdu NLP Command Bar Overlay (CMD+K Modal) */}
      {isCommandOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/30 animate-in fade-in zoom-in-95 duration-200">
            {/* Input Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/50">
              <div className="flex items-center gap-2.5 flex-1">
                <Search className="w-5 h-5 text-indigo-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Ask EduFlow or run a command (e.g. 'absent T101', 'theme emerald', 'tour')..."
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') executeCommand(commandInput);
                    if (e.key === 'Escape') setIsCommandOpen(false);
                  }}
                  className="w-full bg-transparent border-none text-white placeholder-slate-500 text-sm focus:outline-none"
                />
              </div>
              <button 
                onClick={() => setIsCommandOpen(false)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Suggestions & Documentation */}
            <div className="p-6 space-y-4 max-h-[350px] overflow-y-auto text-xs text-slate-400">
              <div>
                <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-2">
                  {commandInput ? 'Matching Commands' : 'Suggested Commands'}
                </h4>
                
                <div className="space-y-2">
                  {filteredCommands.length > 0 ? (
                    filteredCommands.map((cmdItem) => (
                      <button 
                        key={cmdItem.id}
                        onClick={cmdItem.action}
                        className="w-full p-2.5 bg-slate-950/50 border border-slate-800 hover:border-emerald-500/30 rounded-xl text-left hover:text-white transition flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {cmdItem.title}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {cmdItem.subtitle}
                          </div>
                        </div>
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded font-mono bg-slate-900 text-slate-400 border border-slate-800">
                          Click to Run
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-500 space-y-2">
                      <p>No matches found for "{commandInput}"</p>
                      <p className="text-[10px]">Try typing 'theme', 'absent', 'go', or 'tour'.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>Type to search • Click a command to run instantly • <kbd className="bg-slate-900 px-1 rounded">Esc</kbd> to close</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-indigo-400" /> Powered by AskEdu NLP Agent</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating System Notification */}
      {commandAlert && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel p-4 rounded-xl border border-indigo-500 bg-slate-950 flex items-center gap-3 shadow-2xl pulse-glow-blue animate-bounce">
          <Zap className="w-5 h-5 text-indigo-400 shrink-0" />
          <span className="text-xs font-bold text-white">{commandAlert}</span>
        </div>
      )}

      {/* 60-Second Interactive Guided Tour Overlay */}
      {tourStep !== null && (
        <div className="fixed bottom-6 left-6 z-50 glass-panel p-5 rounded-2xl w-80 border-2 border-emerald-500 bg-[var(--panel-bg)] shadow-2xl animate-in fade-in slide-in-from-bottom duration-300">
          {tourStep === 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h3 className="font-extrabold text-white text-sm">60-Second Guided Tour</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Welcome to EduFlow OS! Let's take a quick 1-minute tour to see how OR-Tools, Gemini VLM, and Face tracking automate school operations.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setTourStep(1);
                    setActiveTab('dropzone');
                  }}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Start Tour
                </button>
                <button
                  onClick={() => {
                    setTourStep(null);
                  }}
                  className="flex-1 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl transition border border-slate-700 cursor-pointer"
                >
                  Skip
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                  Step {tourStep} of 5
                </span>
                <button 
                  onClick={() => {
                    setTourStep(null);
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {tourStep === 1 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Smart Document Scanner</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    We've loaded the **Magic Dropzone** tab. Try clicking the **Teacher Leave Form** preset to simulate Gemini 1.5 VLM parsing a handwritten slip.
                  </p>
                </div>
              )}

              {tourStep === 2 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    <span>Live Substitute Engine</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Now viewing the **Reactive Timetable**. When the VLM processes the leave form, Google OR-Tools CP-SAT reassigns substitutions instantly in **&lt;0.04s**.
                  </p>
                </div>
              )}

              {tourStep === 3 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Anti-Cheat Attendance</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    At the **Smart Kiosk**, students scan QR codes to clock in. To prevent buddy punching, attendance is marked ONLY when a face is verified locally.
                  </p>
                </div>
              )}

              {tourStep === 4 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    <span>Smart Staffing Predictions</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    We forecast faculty absenteeism spikes and recommended pool allocations using historical data analysis before issues arise.
                  </p>
                </div>
              )}

              {tourStep === 5 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Academic Risk Alerts</span>
                  </h4>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Back on the dashboard **Overview**, the predictive model flags students with anomalous patterns so admins can trigger alerts immediately.
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                {tourStep > 1 ? (
                  <button
                    onClick={() => {
                      const prev = tourStep - 1;
                      setTourStep(prev);
                      const tabs = ['dashboard', 'dropzone', 'timetable', 'kiosk', 'staffing', 'dashboard'];
                      setActiveTab(tabs[prev]);
                    }}
                    className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded font-semibold text-[10px]"
                  >
                    Back
                  </button>
                ) : <div />}

                <button
                  onClick={() => {
                    if (tourStep === 5) {
                      setTourStep(null);
                    } else {
                      const next = tourStep + 1;
                      setTourStep(next);
                      const tabs = ['dashboard', 'dropzone', 'timetable', 'kiosk', 'staffing', 'dashboard'];
                      setActiveTab(tabs[next]);
                    }
                  }}
                  className="px-3 py-1 bg-emerald-500 text-slate-950 font-bold rounded text-[10px]"
                >
                  {tourStep === 5 ? 'Finish' : 'Next Step'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
