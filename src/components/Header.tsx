import React from 'react';
import { formatTime } from '../lib/storage';
import type { Difficulty } from '../types';

interface Props {
  difficulty: Difficulty;
  elapsedMs: number;
  isPaused: boolean;
  mistakes: number;
  maxMistakes?: number;
  hasGame: boolean;
  onPause: () => void;
  onStats: () => void;
  onHome: () => void;
}

const DIFF_COLORS: Record<Difficulty, string> = {
  easy: 'text-ok', medium: 'text-note', hard: 'text-warn', expert: 'text-err', daily: 'text-daily'
};
const DIFF_LABELS: Record<Difficulty, string> = {
  easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert', daily: 'Daily ✦'
};

export function Header({ difficulty, elapsedMs, isPaused, mistakes, maxMistakes = 3, hasGame, onPause, onStats, onHome }: Props) {
  return (
    <header className="flex items-center justify-between w-full max-w-[min(420px,90vw)] mx-auto py-3">
      {/* Logo / home */}
      <button onClick={onHome} className="flex items-center gap-2 group focus:outline-none">
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center font-mono text-accent-soft text-sm font-medium group-hover:bg-accent/20 transition-colors">
          S
        </div>
        <span className="font-mono text-sm text-ink-muted group-hover:text-ink-secondary transition-colors hidden sm:block">Sudoku</span>
      </button>

      {/* Center info */}
      {hasGame && (
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono font-medium ${DIFF_COLORS[difficulty]}`}>
            {DIFF_LABELS[difficulty]}
          </span>
          <div className="w-px h-3 bg-bg-border" />
          <MistakeDots mistakes={mistakes} max={maxMistakes} />
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {hasGame && (
          <>
            <div className="font-mono text-sm text-ink-secondary tabular-nums mr-1">
              {isPaused ? '⏸' : formatTime(elapsedMs)}
            </div>
            <IconButton onClick={onPause} label={isPaused ? 'Resume' : 'Pause'}>
              {isPaused
                ? <path d="M5 3l14 9-14 9V3z" strokeLinecap="round" strokeLinejoin="round"/>
                : <><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>
              }
            </IconButton>
          </>
        )}
        <IconButton onClick={onStats} label="Stats">
          <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/>
        </IconButton>
      </div>
    </header>
  );
}

function MistakeDots({ mistakes, max }: { mistakes: number; max: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < mistakes ? 'bg-err' : 'bg-bg-border'}`} />
      ))}
    </div>
  );
}

function IconButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink-primary hover:bg-bg-hover transition-colors focus:outline-none">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        {children}
      </svg>
    </button>
  );
}
