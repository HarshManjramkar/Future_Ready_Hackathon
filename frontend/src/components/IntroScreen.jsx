import React, { useState } from 'react';
import IntroGateAnimation from './IntroGateAnimation';
import IntroProblemSolution from './IntroProblemSolution';

export default function IntroScreen({ onComplete }) {
  const [phase, setPhase] = useState('gate');
  const [gatesOpened, setGatesOpened] = useState(false);

  const openGates = () => {
    setGatesOpened(true);
    setTimeout(() => {
      setPhase('solution');
    }, 1650);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center overflow-hidden font-sans">
      {phase === 'gate' ? (
        <IntroGateAnimation gatesOpened={gatesOpened} openGates={openGates} phase={phase} />
      ) : (
        <IntroProblemSolution onComplete={onComplete} phase={phase} setPhase={setPhase} />
      )}
    </div>
  );
}
