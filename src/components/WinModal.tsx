import React from 'react';
import { formatTime } from '../lib/storage';
import type { Difficulty } from '../types';

interface Props {
  timeMs: number;
  difficulty: Difficulty;
  hintsUsed: number;
  mistakes: number;
  onNewGame: (d: Difficulty) => void;
  onClose: () => void;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert', daily: 'Daily'
};

const MESSAGES = [
  'Brilliant! 🧠', 'Outstanding! ✨', 'Perfect! 🎯', 'Excellent! 🔥', 'Masterful! ⚡'
];

export function WinModal({ timeMs, difficulty, hintsUsed, mistakes, onNewGame, onClose }: Props) {
  const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  const rating = hintsUsed === 0 && mistakes === 0 ? 3 : hintsUsed <= 1 && mistakes <= 2 ? 2 : 1;

  return (
    <Overlay onClick={onClose}>
      <div
        className="bg-bg-card rounded-2xl p-7 w-full max-w-sm shadow-2xl border border-bg-border animate-celebrate"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{['⭐','⭐⭐','⭐⭐⭐'][rating - 1]}</div>
          <h2 className="text-2xl font-semibold text-ink-primary mb-1">{msg}</h2>
          <p className="text-ink-secondary text-sm">{DIFFICULTY_LABELS[difficulty]} completed</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <Stat label="Time" value={formatTime(timeMs)} highlight />
          <Stat label="Hints" value={String(hintsUsed)} />
          <Stat label="Mistakes" value={String(mistakes)} warn={mistakes > 0} />
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onNewGame(difficulty)}
            className="w-full py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Play again
          </button>
          <div className="grid grid-cols-2 gap-2">
            {(['easy','hard'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => onNewGame(d)}
                className="py-2.5 rounded-xl bg-bg-hover border border-bg-border text-ink-secondary text-sm hover:text-ink-primary transition-colors focus:outline-none"
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function Stat({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
  return (
    <div className="bg-bg-hover rounded-xl p-3 text-center">
      <div className={`font-mono text-xl font-medium ${highlight ? 'text-accent-soft' : warn ? 'text-warn' : 'text-ink-primary'}`}>
        {value}
      </div>
      <div className="text-ink-muted text-xs mt-0.5">{label}</div>
    </div>
  );
}

function Overlay({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClick}>
      {children}
    </div>
  );
}
