import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Game } from './pages/Game';
import { loadDailyRecords, loadPrefs, todayString } from './lib/storage';
import type { Difficulty, Theme } from './types';

type View = 'home' | 'game';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [theme, setTheme] = useState<Theme>(() => loadPrefs().theme);
  const [swUpdate, setSwUpdate] = useState(false);

  // Sync theme class to <html> whenever it changes
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // Detect when a new SW version is waiting
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.ready.then(reg => {
      const checkWaiting = () => { if (reg.waiting) setSwUpdate(true); };
      checkWaiting();
      reg.addEventListener('updatefound', () => {
        reg.installing?.addEventListener('statechange', () => {
          if (reg.waiting) setSwUpdate(true);
        });
      });
    });
  }, []);

  const daily = loadDailyRecords();
  const dailyCompleted = !!daily[todayString()]?.completed;

  const handleStart = (d: Difficulty) => {
    setDifficulty(d);
    setView('game');
  };

  const handleSwUpdate = () => {
    navigator.serviceWorker.ready.then(reg => {
      reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    });
  };

  return (
    <div className="min-h-screen bg-bg text-ink-primary font-sans antialiased">
      {swUpdate && (
        <div className="fixed top-0 inset-x-0 z-[100] flex items-center justify-between gap-3 px-4 py-2.5 bg-accent text-white text-sm font-medium shadow-lg animate-slide-up">
          <span>New version available</span>
          <button
            onClick={handleSwUpdate}
            className="shrink-0 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-xs font-semibold focus:outline-none"
          >
            Update
          </button>
        </div>
      )}
      {view === 'home' ? (
        <Home onStart={handleStart} dailyCompleted={dailyCompleted} />
      ) : (
        <Game
          initialDifficulty={difficulty}
          onHome={() => setView('home')}
          onThemeChange={setTheme}
        />
      )}
    </div>
  );
}
