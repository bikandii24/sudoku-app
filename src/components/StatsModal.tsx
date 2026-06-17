import React from 'react';
import type { GameStats, Difficulty } from '../types';
import { formatTime } from '../lib/storage';

interface Props {
  stats: GameStats;
  onClose: () => void;
}

const DIFFICULTIES: Difficulty[] = ['easy','medium','hard','expert','daily'];
const LABELS: Record<Difficulty, string> = { easy:'Easy', medium:'Medium', hard:'Hard', expert:'Expert', daily:'Daily' };

export function StatsModal({ stats, onClose }: Props) {
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-bg-card rounded-2xl w-full max-w-sm border border-bg-border shadow-2xl animate-slide-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-bg-border">
          <h2 className="text-lg font-semibold text-ink-primary">Statistics</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink-primary hover:bg-bg-hover transition-colors focus:outline-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Overview */}
          <div className="grid grid-cols-4 gap-2">
            <BigStat label="Played" value={String(stats.gamesPlayed)} />
            <BigStat label="Won" value={`${winRate}%`} />
            <BigStat label="Streak" value={String(stats.currentStreak)} sub="days" />
            <BigStat label="Best" value={String(stats.bestStreak)} sub="days" />
          </div>

          {/* Best times per difficulty */}
          <div>
            <h3 className="text-ink-muted text-xs font-mono uppercase tracking-widest mb-2">Best Times</h3>
            <div className="space-y-1.5">
              {DIFFICULTIES.map(d => (
                <div key={d} className="flex items-center justify-between">
                  <span className="text-ink-secondary text-sm">{LABELS[d]}</span>
                  <span className="font-mono text-sm text-ink-primary">{formatTime(stats.bestTimes[d])}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total time */}
          <div className="p-3 rounded-xl bg-bg-hover border border-bg-border text-center">
            <div className="font-mono text-lg text-accent-soft">{formatTime(stats.totalTimeMs)}</div>
            <div className="text-ink-muted text-xs mt-0.5">Total time played</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BigStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-bg-hover rounded-xl p-3 text-center">
      <div className="font-mono text-2xl font-medium text-ink-primary">{value}</div>
      {sub && <div className="text-ink-muted text-[10px]">{sub}</div>}
      <div className="text-ink-muted text-xs mt-0.5">{label}</div>
    </div>
  );
}
