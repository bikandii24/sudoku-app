import type { Grid, BoolGrid, NoteGrid, HintResult, Cell } from '../types';
import { emptyGrid } from './generator';

export function getConflicts(board: Grid): BoolGrid {
  const conflicts: BoolGrid = Array.from({ length: 9 }, () => Array(9).fill(false));

  for (let row = 0; row < 9; row++) {
    const seen = new Map<number, number[]>();
    for (let col = 0; col < 9; col++) {
      const v = board[row][col];
      if (!v) continue;
      if (!seen.has(v)) seen.set(v, []);
      seen.get(v)!.push(col);
    }
    for (const cols of seen.values()) {
      if (cols.length > 1) cols.forEach(c => { conflicts[row][c] = true; });
    }
  }

  for (let col = 0; col < 9; col++) {
    const seen = new Map<number, number[]>();
    for (let row = 0; row < 9; row++) {
      const v = board[row][col];
      if (!v) continue;
      if (!seen.has(v)) seen.set(v, []);
      seen.get(v)!.push(row);
    }
    for (const rows of seen.values()) {
      if (rows.length > 1) rows.forEach(r => { conflicts[r][col] = true; });
    }
  }

  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const seen = new Map<number, Array<[number, number]>>();
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          const r = br * 3 + dr, c = bc * 3 + dc;
          const v = board[r][c];
          if (!v) continue;
          if (!seen.has(v)) seen.set(v, []);
          seen.get(v)!.push([r, c]);
        }
      }
      for (const cells of seen.values()) {
        if (cells.length > 1) cells.forEach(([r, c]) => { conflicts[r][c] = true; });
      }
    }
  }

  return conflicts;
}

export function isBoardComplete(board: Grid, solution: Grid): boolean {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (board[r][c] !== solution[r][c]) return false;
  return true;
}

export function getCandidates(board: Grid, row: number, col: number): Set<number> {
  const used = new Set<number>();
  for (let i = 0; i < 9; i++) {
    if (board[row][i]) used.add(board[row][i]);
    if (board[i][col]) used.add(board[i][col]);
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (board[r][c]) used.add(board[r][c]);
  return new Set([1,2,3,4,5,6,7,8,9].filter(n => !used.has(n)));
}

export function getAllCandidates(board: Grid): Map<string, Set<number>> {
  const map = new Map<string, Set<number>>();
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (!board[r][c]) map.set(`${r},${c}`, getCandidates(board, r, c));
  return map;
}

// Hint engine — finds the simplest available technique
export function findHint(board: Grid, solution: Grid): HintResult {
  const candidates = getAllCandidates(board);

  // 1. Naked single: only one candidate in a cell
  for (const [key, cands] of candidates) {
    if (cands.size === 1) {
      const [r, c] = key.split(',').map(Number);
      const value = [...cands][0];
      return {
        type: 'naked-single',
        cell: { row: r, col: c },
        value,
        description: {
          es: `Celda (${r+1},${c+1}): solo puede ser ${value}. No hay otro número posible en esa fila, columna y caja.`,
          en:  `Cell (${r+1},${c+1}): can only be ${value}. No other number fits in that row, column, and box.`,
        },
      };
    }
  }

  // 2. Hidden single: a number appears as candidate in only one cell within a unit
  const units: Array<Array<[number,number]>> = [];
  for (let i = 0; i < 9; i++) {
    units.push(Array.from({ length: 9 }, (_, j) => [i, j] as [number,number]));   // row
    units.push(Array.from({ length: 9 }, (_, j) => [j, i] as [number,number]));   // col
  }
  for (let br = 0; br < 3; br++) for (let bc = 0; bc < 3; bc++) {
    const cells: Array<[number,number]> = [];
    for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) cells.push([br*3+dr, bc*3+dc]);
    units.push(cells);
  }

  for (const unit of units) {
    const numCells = new Map<number, Array<[number,number]>>();
    for (const [r,c] of unit) {
      if (board[r][c]) continue;
      const cands = candidates.get(`${r},${c}`);
      if (!cands) continue;
      for (const n of cands) {
        if (!numCells.has(n)) numCells.set(n, []);
        numCells.get(n)!.push([r, c]);
      }
    }
    for (const [num, cells] of numCells) {
      if (cells.length === 1) {
        const [r, c] = cells[0];
        return {
          type: 'hidden-single',
          cell: { row: r, col: c },
          value: num,
          description: {
            es: `El número ${num} solo puede ir en la celda (${r+1},${c+1}) dentro de esa unidad. No hay otra posición posible.`,
            en: `The number ${num} can only go in cell (${r+1},${c+1}) within that unit. There is no other possible position.`,
          },
        };
      }
    }
  }

  // 3. Generic fallback — reveal a cell from the solution
  const empties: Cell[] = [];
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (!board[r][c]) empties.push({ row: r, col: c });

  if (empties.length > 0) {
    const { row, col } = empties[Math.floor(Math.random() * empties.length)];
    return {
      type: 'generic',
      cell: { row, col },
      value: solution[row][col],
      description: {
        es: `La celda (${row+1},${col+1}) debe ser ${solution[row][col]}.`,
        en: `Cell (${row+1},${col+1}) must be ${solution[row][col]}.`,
      },
    };
  }

  return {
    type: 'generic',
    description: { es: 'El puzzle está resuelto.', en: 'The puzzle is solved.' },
  };
}

// Auto-remove notes that are invalidated by a placed number
export function pruneNotes(notes: NoteGrid, row: number, col: number, value: number): NoteGrid {
  const next: NoteGrid = notes.map(r => r.map(s => new Set(s)));
  for (let i = 0; i < 9; i++) {
    next[row][i].delete(value);
    next[i][col].delete(value);
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      next[r][c].delete(value);
  next[row][col] = new Set();
  return next;
}

export function emptyNotes(): NoteGrid {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()));
}

export function encodeNotes(notes: NoteGrid): number[][][] {
  return notes.map(row => row.map(s => [...s]));
}

export function decodeNotes(raw: number[][][]): NoteGrid {
  return raw.map(row => row.map(arr => new Set<number>(arr)));
}

export function solveForShare(board: Grid, solution: Grid): string {
  // Wordle-style emoji for daily share
  const rows: string[] = [];
  for (let r = 0; r < 9; r++) {
    let row = '';
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === solution[r][c]) row += '🟩';
      else if (board[r][c] !== 0) row += '🟥';
      else row += '⬛';
    }
    rows.push(row);
  }
  return rows.join('\n');
}

export { emptyGrid };
