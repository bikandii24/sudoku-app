import type { Difficulty, Grid } from '../types';

// Seeded LCG PRNG — deterministic by seed (used for daily puzzles)
export class RNG {
  private s: number;
  constructor(seed: number) { this.s = seed >>> 0; }
  next(): number {
    this.s = (Math.imul(1664525, this.s) + 1013904223) >>> 0;
    return this.s / 0x100000000;
  }
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

function isValid(grid: Grid, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) return false;
    if (grid[i][col] === num) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (grid[r][c] === num) return false;
  return true;
}

function fillGrid(grid: Grid, rng: RNG): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] !== 0) continue;
      const nums = rng.shuffle([1,2,3,4,5,6,7,8,9]);
      for (const num of nums) {
        if (isValid(grid, row, col, num)) {
          grid[row][col] = num;
          if (fillGrid(grid, rng)) return true;
          grid[row][col] = 0;
        }
      }
      return false;
    }
  }
  return true;
}

// Count solutions — stops at 2 (we only need to know if unique)
function countSolutions(grid: Grid, limit = 2): number {
  let count = 0;
  function solve(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] !== 0) continue;
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solve()) {
              if (++count >= limit) { grid[row][col] = 0; return true; }
            }
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
    count++;
    return false;
  }
  solve();
  return count;
}

const CLUE_COUNTS: Record<Difficulty, [number, number]> = {
  easy:   [42, 46],
  medium: [32, 38],
  hard:   [25, 31],
  expert: [20, 25],
  daily:  [28, 34],
};

export function emptyGrid(): Grid {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

export function cloneGrid(g: Grid): Grid {
  return g.map(row => [...row]);
}

export function generatePuzzle(difficulty: Difficulty, seed?: number): { puzzle: Grid; solution: Grid } {
  const rng = new RNG(seed ?? (Date.now() >>> 0));

  const solution = emptyGrid();
  fillGrid(solution, rng);

  const puzzle = cloneGrid(solution);

  const [minClues, maxClues] = CLUE_COUNTS[difficulty];
  const targetClues = rng.int(minClues, maxClues);
  const totalCells = 81;
  let cluesLeft = totalCells;

  const positions = rng.shuffle(
    Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 }))
  );

  for (const { row, col } of positions) {
    if (cluesLeft <= targetClues) break;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;
    cluesLeft--;

    const temp = cloneGrid(puzzle);
    if (countSolutions(temp) !== 1) {
      puzzle[row][col] = backup;
      cluesLeft++;
    }
  }

  return { puzzle, solution };
}

export function dateToSeed(dateStr: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < dateStr.length; i++) {
    h ^= dateStr.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) || 1;
}
