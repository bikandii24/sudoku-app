import React from 'react';
import type { Difficulty } from '../types';
import { todayString } from '../lib/storage';

interface Props {
  onStart: (d: Difficulty) => void;
  dailyCompleted: boolean;
}

const DIFFICULTIES: { key: Difficulty; label: string; sub: string; color: string; bg: string }[] = [
  { key: 'easy',   label: 'Easy',   sub: '42–46 clues · relaxed',     color: 'text-ok',   bg: 'border-ok/20 hover:bg-ok/5' },
  { key: 'medium', label: 'Medium', sub: '32–38 clues · balanced',    color: 'text-note', bg: 'border-note/20 hover:bg-note/5' },
  { key: 'hard',   label: 'Hard',   sub: '25–31 clues · challenging', color: 'text-warn', bg: 'border-warn/20 hover:bg-warn/5' },
  { key: 'expert', label: 'Expert', sub: '20–25 clues · brutal',      color: 'text-err',  bg: 'border-err/20 hover:bg-err/5' },
];

export function Home({ onStart, dailyCompleted }: Props) {
  const today = todayString();
  const [, month, day] = today.split('-');
  const dateLabel = `${parseInt(day)} · ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(month)-1]}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 gap-8 animate-fade-in">
      {/* Hero */}
      <div className="text-center">
        <div className="font-mono text-6xl mb-4 select-none">⬛</div>
        <h1 className="text-4xl font-semibold text-ink-primary tracking-tight mb-2">Sudoku</h1>
        <p className="text-ink-secondary text-sm">The definitive version</p>
      </div>

      {/* Daily */}
      <button
        onClick={() => onStart('daily')}
        className="w-full max-w-sm relative overflow-hidden rounded-2xl border border-daily/30 bg-daily/5 p-5 text-left transition-all hover:bg-daily/10 hover:border-daily/50 focus:outline-none focus:ring-2 focus:ring-daily/40 group"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-daily font-mono text-xs font-medium uppercase tracking-widest">Daily</span>
              <span className="text-ink-muted text-xs font-mono">{dateLabel}</span>
            </div>
            <div className="text-ink-primary font-medium text-lg">Today's Puzzle</div>
            <div className="text-ink-secondary text-sm mt-0.5">Same puzzle for everyone · resets at midnight</div>
          </div>
          {dailyCompleted && (
            <div className="shrink-0 w-7 h-7 rounded-full bg-ok/15 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-ok">
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
        <div className="absolute -bottom-4 -right-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">✦</div>
      </button>

      {/* Classic difficulties */}
      <div className="w-full max-w-sm flex flex-col gap-2">
        <p className="text-ink-muted text-xs font-mono uppercase tracking-widest text-center mb-1">Classic</p>
        {DIFFICULTIES.map(({ key, label, sub, color, bg }) => (
          <button
            key={key}
            onClick={() => onStart(key)}
            className={`flex items-center justify-between rounded-xl border bg-bg-card p-4 transition-all focus:outline-none focus:ring-2 focus:ring-accent/30 ${bg}`}
          >
            <div>
              <div className={`font-medium text-base ${color}`}>{label}</div>
              <div className="text-ink-muted text-xs mt-0.5">{sub}</div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 text-ink-muted">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-ink-muted text-xs text-center">
        Unique solution guaranteed · Keyboard supported · Progress auto-saved
      </p>
    </div>
  );
}
