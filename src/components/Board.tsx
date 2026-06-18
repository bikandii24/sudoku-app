import React, { useCallback, useEffect } from 'react';
import { Cell } from './Cell';
import type { GameState } from '../types';

interface Props {
  state: GameState;
  onSelectCell: (r: number, c: number) => void;
  onInput: (v: number) => void;
  onUndo: () => void;
  onToggleNotes?: () => void;
  highlightRelated: boolean;
  highlightSameNumber: boolean;
  highlightErrors: boolean;
  disabled?: boolean;
  flashCell?: { row: number; col: number } | null;
}

export function Board({ state, onSelectCell, onInput, onUndo, onToggleNotes, highlightRelated, highlightSameNumber, highlightErrors, disabled, flashCell }: Props) {
  const { board, given, locked, notes, selected, errors } = state;
  const selRow = selected?.row ?? -1;
  const selCol = selected?.col ?? -1;
  const selVal = selected ? board[selRow]?.[selCol] : 0;

  const isRelated = useCallback((r: number, c: number) => {
    if (!highlightRelated || selRow < 0) return false;
    return r === selRow || c === selCol || (Math.floor(r/3) === Math.floor(selRow/3) && Math.floor(c/3) === Math.floor(selCol/3));
  }, [selRow, selCol, highlightRelated]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (disabled || state.isComplete || state.isPaused) return;

      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { onUndo(); return; }
      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey) {
        onToggleNotes?.(); return;
      }

      if (selRow >= 0) {
        if (/^[1-9]$/.test(e.key)) { onInput(Number(e.key)); return; }
        if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') { onInput(0); return; }
        const moves: Record<string, [number,number]> = {
          ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
        };
        if (moves[e.key]) {
          e.preventDefault();
          const [dr, dc] = moves[e.key];
          onSelectCell(Math.max(0, Math.min(8, selRow + dr)), Math.max(0, Math.min(8, selCol + dc)));
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [disabled, state.isComplete, state.isPaused, selRow, selCol, onInput, onUndo, onSelectCell, onToggleNotes]);

  return (
    <div className="w-full max-w-[min(420px,90vw)] mx-auto">
      <div
        className="grid grid-cols-9 border-2 border-bg-border rounded-xl overflow-hidden shadow-2xl"
        style={{ aspectRatio: '1/1' }}
      >
        {board.map((row, r) =>
          row.map((value, c) => (
            <Cell
              key={`${r}-${c}`}
              value={value}
              notes={notes[r][c]}
              isGiven={given[r][c]}
              isLocked={locked[r][c]}
              isSelected={r === selRow && c === selCol}
              isRelated={isRelated(r, c)}
              isSameNumber={highlightSameNumber && !!selVal && value === selVal}
              isError={highlightErrors && errors[r][c]}
              isNew={!!(flashCell && flashCell.row === r && flashCell.col === c)}
              row={r}
              col={c}
              onClick={() => onSelectCell(r, c)}
            />
          ))
        )}
      </div>
    </div>
  );
}
