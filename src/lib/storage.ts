import type { GameStats, Preferences, DailyRecord, Difficulty, Theme } from '../types';
import { decodeNotes, emptyNotes } from './solver';

const KEYS = {
  stats:   'sudoku:stats',
  prefs:   'sudoku:prefs',
  session: 'sudoku:session',
  daily:   'sudoku:daily',
};

const DEFAULT_BEST_TIMES: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0, expert: 0, daily: 0 };

export const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0, gamesWon: 0, currentStreak: 0, bestStreak: 0,
  bestTimes: { ...DEFAULT_BEST_TIMES }, avgTimes: { ...DEFAULT_BEST_TIMES },
  totalTimeMs: 0, lastPlayedDate: '', completedDates: [], achievements: [],
};

export const DEFAULT_PREFS: Preferences = {
  theme: 'dark', highlightErrors: true, highlightRelated: true,
  highlightSameNumber: true, autoRemoveNotes: true, haptics: true,
};

function load<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; }
  catch { return fallback; }
}

function save<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function loadStats(): GameStats { return { ...DEFAULT_STATS, ...load(KEYS.stats, {}) }; }
export function saveStats(s: GameStats): void { save(KEYS.stats, s); }

export function loadPrefs(): Preferences { return { ...DEFAULT_PREFS, ...load(KEYS.prefs, {}) }; }
export function savePrefs(p: Preferences): void { save(KEYS.prefs, p); }

export interface SavedSession {
  board: number[][];
  solution: number[][];
  given: boolean[][];
  notes: number[][][];
  difficulty: Difficulty;
  hintsUsed: number;
  mistakesCount: number;
  elapsedMs: number;
  startTime: number;
  noteMode: boolean;
}

export function loadSession(): SavedSession | null { return load<SavedSession | null>(KEYS.session, null); }
export function saveSession(s: SavedSession): void { save(KEYS.session, s); }
export function clearSession(): void { localStorage.removeItem(KEYS.session); }

export function loadDailyRecords(): Record<string, DailyRecord> {
  return load(KEYS.daily, {});
}
export function saveDailyRecord(date: string, rec: DailyRecord): void {
  const all = loadDailyRecords();
  all[date] = rec;
  save(KEYS.daily, all);
}

export function recordWin(stats: GameStats, difficulty: Difficulty, timeMs: number): GameStats {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const newStreak = stats.lastPlayedDate === yesterday ? stats.currentStreak + 1
    : stats.lastPlayedDate === today ? stats.currentStreak
    : 1;

  const prevBest = stats.bestTimes[difficulty];
  const newBest = prevBest === 0 ? timeMs : Math.min(prevBest, timeMs);

  const prevAvg = stats.avgTimes[difficulty];
  const prevCount = stats.gamesWon;
  const newAvg = prevCount === 0 ? timeMs : Math.round((prevAvg * prevCount + timeMs) / (prevCount + 1));

  return {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + 1,
    currentStreak: newStreak,
    bestStreak: Math.max(stats.bestStreak, newStreak),
    bestTimes: { ...stats.bestTimes, [difficulty]: newBest },
    avgTimes: { ...stats.avgTimes, [difficulty]: newAvg },
    totalTimeMs: stats.totalTimeMs + timeMs,
    lastPlayedDate: today,
  };
}

export function formatTime(ms: number): string {
  if (!ms) return '--:--';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}
