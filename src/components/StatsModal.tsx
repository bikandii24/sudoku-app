import React from 'react';
import type { GameStats, Difficulty } from '../types';
import { formatTime } from '../lib/storage';

interface Props {
  stats: GameStats;
  onClose: () => void;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'daily'];
const LABELS: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert', daily: 'Daily' };
const DIFF_COLORS: Record<Difficulty, string> = { easy: 'text-ok', medium: 'text-note', hard: 'text-warn', expert: 'text-err', daily: 'text-daily' };

function statTime(ms: number): string {
  return ms > 0 ? formatTime(ms) : '–';
}

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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Overview */}
          <div className="grid grid-cols-4 gap-2">
            <BigStat label="Played" value={String(stats.gamesPlayed)} />
            <BigStat label="Won" value={`${winRate}%`} />
            <BigStat label="Streak" value={String(stats.currentStreak)} sub="days" />
            <BigStat label="Best" value={String(stats.bestStreak)} sub="streak" />
          </div>

          {/* Times per difficulty — best and average */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-ink-muted text-xs font-mono uppercase tracking-widest">Times</h3>
              <div className="flex gap-4 text-[10px] text-ink-muted font-mono">
                <span>Best</span>
                <span>Avg</span>
              </div>
            </div>
            <div className="space-y-1">
              {DIFFICULTIES.map(d => (
                <div key={d} className="flex items-center justify-between py-1.5 border-b border-bg-border/50 last:border-0">
                  <span className={`text-sm font-medium ${DIFF_COLORS[d]}`}>{LABELS[d]}</span>
                  <div className="flex gap-4">
                    <span className="font-mono text-sm text-ink-primary w-14 text-right">{statTime(stats.bestTimes[d])}</span>
                    <span className="font-mono text-sm text-ink-secondary w-14 text-right">{statTime(stats.avgTimes?.[d] ?? 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total time */}
          <div className="p-3 rounded-xl bg-bg-hover border border-bg-border text-center">
            <div className="font-mono text-lg text-accent-soft">{statTime(stats.totalTimeMs)}</div>
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
      <div className="font-mono text-2xl font-medium text-ink-primary leading-none">{value}</div>
      {sub && <div className="text-ink-muted text-[9px] mt-0.5">{sub}</div>}
      <div className="text-ink-muted text-xs mt-1">{label}</div>
    </div>
  );
}
