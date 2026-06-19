import type { Difficulty, GameStats } from '../types';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_win',   icon: '🏆', title: 'First Victory',   description: 'Complete your first puzzle' },
  { id: 'no_hints',    icon: '🧠', title: 'Self-Sufficient', description: 'Complete a puzzle without hints' },
  { id: 'perfect',     icon: '✨', title: 'Flawless',        description: 'Complete without hints or mistakes' },
  { id: 'expert_win',  icon: '🎯', title: 'Expert Mind',     description: 'Complete an Expert puzzle' },
  { id: 'daily_win',   icon: '📅', title: 'Daily Devotee',   description: 'Complete a Daily puzzle' },
  { id: 'daily_3',     icon: '🔥', title: 'On a Roll',       description: '3-day daily streak' },
  { id: 'daily_7',     icon: '⚡', title: 'Week Warrior',    description: '7-day daily streak' },
  { id: 'speed_easy',  icon: '💨', title: 'Speed Demon',     description: 'Complete Easy in under 3 minutes' },
  { id: 'comeback',    icon: '💪', title: 'Comeback',        description: 'Win after making 2 mistakes' },
  { id: 'scholar',     icon: '📚', title: 'Scholar',         description: 'Complete 10 puzzles' },
  { id: 'dedicated',   icon: '🌟', title: 'Dedicated',       description: 'Complete 25 puzzles' },
];

export function checkAchievements(
  stats: GameStats,
  ctx: { difficulty: Difficulty; timeMs: number; hintsUsed: number; mistakes: number }
): AchievementDef[] {
  const unlocked = new Set(stats.achievements.map(a => a.id));

  const candidates: [string, boolean][] = [
    ['first_win',  stats.gamesWon >= 1],
    ['no_hints',   ctx.hintsUsed === 0],
    ['perfect',    ctx.hintsUsed === 0 && ctx.mistakes === 0],
    ['expert_win', ctx.difficulty === 'expert'],
    ['daily_win',  ctx.difficulty === 'daily'],
    ['daily_3',    stats.currentStreak >= 3],
    ['daily_7',    stats.currentStreak >= 7],
    ['speed_easy', ctx.difficulty === 'easy' && ctx.timeMs <= 3 * 60_000],
    ['comeback',   ctx.mistakes >= 2],
    ['scholar',    stats.gamesWon >= 10],
    ['dedicated',  stats.gamesWon >= 25],
  ];

  return candidates
    .filter(([id, cond]) => cond && !unlocked.has(id))
    .map(([id]) => ACHIEVEMENTS.find(a => a.id === id)!);
}
