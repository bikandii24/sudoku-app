import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { Difficulty, GameState, Grid, NoteGrid, Cell, HintResult } from '../types';
import { generatePuzzle, dateToSeed, cloneGrid, emptyGrid } from '../lib/generator';
import { getConflicts, isBoardComplete, findHint, pruneNotes, emptyNotes, encodeNotes, decodeNotes } from '../lib/solver';
import { loadSession, saveSession, clearSession, todayString } from '../lib/storage';

type Action =
  | { type: 'START'; difficulty: Difficulty; seed?: number }
  | { type: 'SELECT'; cell: Cell | null }
  | { type: 'INPUT'; value: number; autoRemoveNotes?: boolean }  // 0 = erase
  | { type: 'TOGGLE_NOTE'; value: number }
  | { type: 'UNDO' }
  | { type: 'HINT'; hint: HintResult }
  | { type: 'TOGGLE_NOTE_MODE' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'TICK'; ms: number }
  | { type: 'RESTORE'; state: Partial<GameState> };

function makeInitial(): GameState {
  return {
    board: emptyGrid(), solution: emptyGrid(), given: Array.from({ length: 9 }, () => Array(9).fill(false)),
    notes: emptyNotes(), selected: null, errors: Array.from({ length: 9 }, () => Array(9).fill(false)),
    locked: Array.from({ length: 9 }, () => Array(9).fill(false)),
    difficulty: 'medium', hintsUsed: 0, mistakesCount: 0,
    isComplete: false, isPaused: false, startTime: 0, elapsedMs: 0, noteMode: false, history: [],
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START': {
      const seed = action.difficulty === 'daily' ? dateToSeed(todayString()) : action.seed;
      const { puzzle, solution } = generatePuzzle(action.difficulty, seed);
      const given: boolean[][] = puzzle.map(row => row.map(v => v !== 0));
      return {
        ...makeInitial(),
        board: cloneGrid(puzzle),
        solution,
        given,
        locked: given.map(row => [...row]),
        difficulty: action.difficulty,
        startTime: Date.now(),
        elapsedMs: 0,
      };
    }

    case 'SELECT':
      return { ...state, selected: action.cell };

    case 'INPUT': {
      const { selected, given, locked, board, solution, notes: curNotes, history, mistakesCount: prevMistakes } = state;
      if (!selected) return state;
      const { row, col } = selected;
      if (given[row][col] || locked[row][col]) return state;

      // Snapshot before the change (with actual notes, locked, and mistakesCount)
      const snapshot = {
        board: cloneGrid(board),
        notes: curNotes.map(r => r.map(s => new Set(s))),
        locked: locked.map(r => [...r]),
        mistakesCount: prevMistakes,
      };
      const newHistory = [...history, snapshot].slice(-30);

      const newBoard = cloneGrid(board);
      newBoard[row][col] = action.value;

      let newNotes = curNotes;
      if (action.value !== 0 && action.autoRemoveNotes !== false) {
        newNotes = pruneNotes(curNotes, row, col, action.value);
      }

      const errors = getConflicts(newBoard);
      const isComplete = action.value !== 0 && isBoardComplete(newBoard, solution);

      let mistakesCount = prevMistakes;
      let newLocked = locked.map(r => [...r]);
      if (action.value !== 0 && action.value === solution[row][col]) {
        newLocked[row][col] = true;
      } else if (action.value !== 0 && action.value !== solution[row][col]) {
        mistakesCount++;
      }

      return { ...state, board: newBoard, notes: newNotes, errors, isComplete, mistakesCount, locked: newLocked, history: newHistory };
    }

    case 'TOGGLE_NOTE': {
      const { selected, given, locked, board, notes } = state;
      if (!selected) return state;
      const { row, col } = selected;
      if (given[row][col] || locked[row][col] || board[row][col] !== 0) return state;
      const newNotes: NoteGrid = notes.map(r => r.map(s => new Set(s)));
      if (newNotes[row][col].has(action.value)) newNotes[row][col].delete(action.value);
      else newNotes[row][col].add(action.value);
      return { ...state, notes: newNotes };
    }

    case 'TOGGLE_NOTE_MODE':
      return { ...state, noteMode: !state.noteMode };

    case 'UNDO': {
      if (!state.history.length) return state;
      const prev = state.history[state.history.length - 1];
      const errors = getConflicts(prev.board);
      return { ...state, board: prev.board, notes: prev.notes, locked: prev.locked, mistakesCount: prev.mistakesCount, errors, history: state.history.slice(0, -1) };
    }

    case 'HINT': {
      if (!action.hint.cell || action.hint.value === undefined) return { ...state, hintsUsed: state.hintsUsed + 1 };
      const { row, col } = action.hint.cell;
      const newBoard = cloneGrid(state.board);
      newBoard[row][col] = action.hint.value;
      const newNotes = pruneNotes(state.notes, row, col, action.hint.value);
      const newLocked = state.locked.map(r => [...r]);
      newLocked[row][col] = true;
      const errors = getConflicts(newBoard);
      const isComplete = isBoardComplete(newBoard, state.solution);
      return { ...state, board: newBoard, notes: newNotes, locked: newLocked, errors, isComplete, hintsUsed: state.hintsUsed + 1, selected: { row, col } };
    }

    case 'TOGGLE_PAUSE':
      return { ...state, isPaused: !state.isPaused };

    case 'TICK':
      if (state.isPaused || state.isComplete) return state;
      return { ...state, elapsedMs: action.ms - state.startTime };

    case 'RESTORE':
      return { ...state, ...action.state };

    default: return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitial);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore saved session on mount
  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      // Recompute locked: pre-filled cells + cells the user placed correctly
      const locked = saved.given.map((row, r) =>
        row.map((isGiven, c) => isGiven || (saved.board[r][c] !== 0 && saved.board[r][c] === saved.solution[r][c]))
      );
      dispatch({ type: 'RESTORE', state: {
        board: saved.board,
        solution: saved.solution,
        given: saved.given,
        notes: decodeNotes(saved.notes),
        locked,
        difficulty: saved.difficulty,
        hintsUsed: saved.hintsUsed,
        mistakesCount: saved.mistakesCount,
        elapsedMs: saved.elapsedMs,
        startTime: Date.now() - saved.elapsedMs,
        noteMode: saved.noteMode,
        errors: getConflicts(saved.board),
      }});
    }
  }, []);

  // Ticker
  useEffect(() => {
    tickRef.current = setInterval(() => dispatch({ type: 'TICK', ms: Date.now() }), 500);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  // Keep elapsedMs current without making it a save dependency
  const elapsedRef = useRef(state.elapsedMs);
  elapsedRef.current = state.elapsedMs;

  // Autosave only on meaningful state changes, not on every timer tick
  useEffect(() => {
    if (!state.startTime) return;
    if (state.isComplete) { clearSession(); return; }
    saveSession({
      board: state.board, solution: state.solution, given: state.given,
      notes: encodeNotes(state.notes), difficulty: state.difficulty,
      hintsUsed: state.hintsUsed, mistakesCount: state.mistakesCount,
      elapsedMs: elapsedRef.current, startTime: state.startTime, noteMode: state.noteMode,
    });
  }, [state.board, state.notes, state.difficulty, state.hintsUsed, state.mistakesCount, state.noteMode, state.startTime, state.isComplete]);

  const startGame = useCallback((difficulty: Difficulty) => {
    clearSession();
    dispatch({ type: 'START', difficulty });
  }, []);

  const selectCell = useCallback((cell: Cell | null) => dispatch({ type: 'SELECT', cell }), []);

  const inputNumber = useCallback((value: number, opts?: { autoRemoveNotes?: boolean }) => {
    if (state.noteMode) dispatch({ type: 'TOGGLE_NOTE', value });
    else dispatch({ type: 'INPUT', value, autoRemoveNotes: opts?.autoRemoveNotes ?? true });
  }, [state.noteMode]);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const toggleNoteMode = useCallback(() => dispatch({ type: 'TOGGLE_NOTE_MODE' }), []);
  const togglePause = useCallback(() => dispatch({ type: 'TOGGLE_PAUSE' }), []);

  const requestHint = useCallback((): HintResult => {
    const hint = findHint(state.board, state.solution);
    dispatch({ type: 'HINT', hint });
    return hint;
  }, [state.board, state.solution]);

  return { state, startGame, selectCell, inputNumber, undo, toggleNoteMode, togglePause, requestHint };
}
