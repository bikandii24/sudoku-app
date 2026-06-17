import React, { useState } from 'react';
import { Home } from './pages/Home';
import { Game } from './pages/Game';
import { loadDailyRecords, todayString } from './lib/storage';
import type { Difficulty } from './types';

type View = 'home' | 'game';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  const daily = loadDailyRecords();
  const dailyCompleted = !!daily[todayString()]?.completed;

  const handleStart = (d: Difficulty) => {
    setDifficulty(d);
    setView('game');
  };

  return (
    <div className="min-h-screen bg-bg text-ink-primary font-sans antialiased">
      {view === 'home' ? (
        <Home onStart={handleStart} dailyCompleted={dailyCompleted} />
      ) : (
        <Game initialDifficulty={difficulty} onHome={() => setView('home')} />
      )}
    </div>
  );
}
