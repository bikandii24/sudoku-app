export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'daily';

export type Grid = number[][];        // 0 = empty
export type BoolGrid = boolean[][];
export type NoteGrid = Set<number>[][]; // pencil marks

export interface Cell {
  row: number;
  col: number;
}

export interface GameState {
  board: Grid;
  solution: Grid;
  given: BoolGrid;
  notes: NoteGrid;
  selected: Cell | null;
  errors: BoolGrid;
  locked: BoolGrid;   // cells that have been confirmed correct (can't be changed)
  difficulty: Difficulty;
  hintsUsed: number;
  mistakesCount: number;
  isComplete: boolean;
  isPaused: boolean;
  startTime: number;  // ms
  elapsedMs: number;
  noteMode: boolean;
  history: HistoryEntry[];
}

export interface HistoryEntry {
  board: Grid;
  notes: NoteGrid;
  locked: BoolGrid;
  mistakesCount: number;
}

export interface GameStats {
  gamesPlayed:       number;
  gamesWon:          number;
  currentStreak:     number;
  bestStreak:        number;
  bestTimes:         Record<Difficulty, number>;  // fastest ms, 0 = none
  avgTimes:          Record<Difficulty, number>;  // average ms
  winsByDifficulty:  Record<Difficulty, number>;  // win count per difficulty (for correct avg)
  totalTimeMs:       number;
  lastPlayedDate:    string; // YYYY-MM-DD
  completedDates:    string[]; // daily puzzles completed
  achievements:      Achievement[];
}

export interface Achievement {
  id: string;
  unlockedAt: number; // timestamp
}

export interface DailyRecord {
  date: string;       // YYYY-MM-DD
  completed: boolean;
  timeMs: number;
  hintsUsed: number;
  mistakes: number;
}

export type Theme = 'dark' | 'light' | 'oled' | 'nord';

export interface Preferences {
  theme: Theme;
  highlightErrors: boolean;
  highlightRelated: boolean;
  highlightSameNumber: boolean;
  autoRemoveNotes: boolean;
  haptics: boolean;
}

export interface HintResult {
  type: 'naked-single' | 'hidden-single' | 'naked-pair' | 'pointing-pair' | 'generic';
  description: { es: string; en: string };
  cell?: Cell;
  value?: number;
}
