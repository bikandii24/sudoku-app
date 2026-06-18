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

// Fixed mini-grid preview (top-left 3x3 box of a classic puzzle)
const PREVIEW = [5, 3, 0, 6, 0, 0, 0, 9, 8];

function MiniGrid() {
  return (
    <div className="relative mx-auto mb-6" style={{ width: 72, height: 72 }}>
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-xl bg-accent/10 blur-xl" />
      <div className="relative grid grid-cols-3 gap-px bg-bg-border rounded-xl overflow-hidden border border-bg-border shadow-glow-accent w-full h-full">
        {PREVIEW.map((v, i) => (
          <div
            key={i}
            className={`flex items-center justify-center font-mono text-sm font-medium transition-colors
              ${v !== 0 ? 'bg-bg-card text-accent-soft' : 'bg-bg-hover/60 text-transparent'}`}
          >
            {v || '·'}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Home({ onStart, dailyCompleted }: Props) {
  const today = todayString();
  const [, month, day] = today.split('-');
  const dateLabel = `${parseInt(day)} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(month)-1]}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 gap-7 animate-fade-in">
      {/* Hero */}
      <div className="text-center">
        <MiniGrid />
        <h1 className="text-4xl font-semibold text-ink-primary tracking-tight mb-1.5">Sudoku</h1>
        <p className="text-ink-muted text-sm font-mono">unique solution · no ads · open source</p>
      </div>

      {/* Daily */}
      <button
        onClick={() => onStart('daily')}
        className="w-full max-w-sm relative overflow-hidden rounded-2xl border border-daily/30 bg-daily/5 p-5 text-left transition-all hover:bg-daily/10 hover:border-daily/50 focus:outline-none focus:ring-2 focus:ring-daily/40 group"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-daily font-mono text-xs font-semibold uppercase tracking-widest">Daily</span>
              <span className="text-ink-muted text-xs font-mono">{dateLabel}</span>
            </div>
            <div className="text-ink-primary font-medium text-lg leading-snug">Today's Puzzle</div>
            <div className="text-ink-secondary text-sm mt-0.5">
              {dailyCompleted ? 'Completed · play again?' : 'Same puzzle for everyone · resets at midnight'}
            </div>
          </div>
          <div className="shrink-0 ml-3">
            {dailyCompleted ? (
              <div className="w-8 h-8 rounded-full bg-ok/15 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-ok">
                  <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-daily/10 flex items-center justify-center text-daily">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path d="M5 3l14 9-14 9V3z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        </div>
        <div className="absolute -bottom-5 -right-5 text-8xl opacity-[0.06] group-hover:opacity-[0.1] transition-opacity pointer-events-none select-none">✦</div>
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
              <div className={`font-semibold text-base ${color}`}>{label}</div>
              <div className="text-ink-muted text-xs mt-0.5">{sub}</div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 text-ink-muted shrink-0">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}
      </div>

      <p className="text-ink-muted text-[11px] text-center font-mono opacity-60">
        Guaranteed unique solution · keyboard support · progress auto-saved
      </p>
    </div>
  );
}
