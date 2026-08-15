import React, { useState, useEffect } from 'react';
import IntroGateAnimation from './IntroGateAnimation';
import IntroProblemSolution from './IntroProblemSolution';

export default function IntroScreen({ onComplete }) {
  const [phase, setPhase] = useState('gate');
  const [gatesOpened, setGatesOpened] = useState(false);

  // Automated 3D Entrance Gate Sequence on Load
  useEffect(() => {
    // 1. Automatically swing open the 3D gates after 600ms
    const gateTimer = setTimeout(() => {
      setGatesOpened(true);
    }, 600);

    // 2. Automatically transition to Problem/Solution overview after 2200ms
    const phaseTimer = setTimeout(() => {
      setPhase('solution');
    }, 2200);

    return () => {
      clearTimeout(gateTimer);
      clearTimeout(phaseTimer);
    };
  }, []);

  const handleManualOpen = () => {
    setGatesOpened(true);
    setTimeout(() => {
      setPhase('solution');
    }, 1650);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center overflow-hidden font-sans">
      {phase === 'gate' ? (
        <IntroGateAnimation 
          gatesOpened={gatesOpened} 
          openGates={handleManualOpen} 
          phase={phase} 
          onSkip={onComplete}
        />
      ) : (
        <IntroProblemSolution onComplete={onComplete} phase={phase} setPhase={setPhase} />
      )}
    </div>
  );
}
