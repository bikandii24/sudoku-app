import React, { useMemo } from 'react';
import type { Grid, BoolGrid } from '../types';

interface Props {
  onInput: (v: number) => void;
  onErase: () => void;
  onUndo: () => void;
  onHint: () => void;
  onToggleNotes: () => void;
  onFillCandidates: () => void;
  noteMode: boolean;
  hintsUsed: number;
  maxHints?: number;
  disabled?: boolean;
  canUndo?: boolean;
  board: Grid;
  locked: BoolGrid;
}

const DIGITS = [1,2,3,4,5,6,7,8,9];

function countPlaced(board: Grid, locked: BoolGrid, digit: number): number {
  let n = 0;
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (locked[r][c] && board[r][c] === digit) n++;
  return n;
}

export function NumberPad({ onInput, onErase, onUndo, onHint, onToggleNotes, onFillCandidates, noteMode, hintsUsed, maxHints = 3, disabled, canUndo = false, board, locked }: Props) {
  const hintsLeft = maxHints - hintsUsed;

  const remaining = useMemo(
    () => DIGITS.map(d => 9 - countPlaced(board, locked, d)),
    [board, locked]
  );

  return (
    <div className="w-full max-w-[min(420px,90vw)] mx-auto flex flex-col gap-3">
      {/* Digit buttons with remaining count */}
      <div className="grid grid-cols-9 gap-1.5">
        {DIGITS.map((n, i) => {
          const left = remaining[i];
          const done = left === 0;
          return (
            <button
              key={n}
              disabled={disabled || done}
              onClick={() => onInput(n)}
              className={[
                'relative flex flex-col items-center justify-center aspect-square rounded-lg border font-mono font-medium',
                'transition-all duration-75 active:scale-90 focus:outline-none focus:ring-2 focus:ring-accent',
                done
                  ? 'bg-bg-hover border-bg-border text-ok opacity-35 cursor-default'
                  : 'bg-bg-card border-bg-border text-ink-primary hover:bg-bg-hover hover:border-accent/40 disabled:opacity-30',
              ].join(' ')}
            >
              <span className={`leading-none ${done ? 'text-[clamp(10px,2vw,16px)]' : 'text-[clamp(12px,2.5vw,20px)]'}`}>{n}</span>
              {!done && left <= 3 ? (
                <span className="text-[8px] leading-none text-warn mt-0.5 tabular-nums font-medium">{left}</span>
              ) : !done ? (
                <span className="text-[8px] leading-none text-ink-muted mt-0.5 tabular-nums">{left}</span>
              ) : (
                <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={2} className="w-2 h-2 mt-0.5 text-ok">
                  <path d="M1.5 5l2.5 2.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-2">
        <ActionButton onClick={onErase} disabled={disabled} label="Erase" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
            <path d="M20 20H7L3 16l9-9 8 8-1.5 1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 17.5l4-4" strokeLinecap="round"/>
          </svg>
        }/>
        <ActionButton onClick={onUndo} disabled={disabled || !canUndo} label="Undo" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
            <path d="M3 7v6h6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 13A9 9 0 1 0 5.5 6.5L3 7" strokeLinecap="round"/>
          </svg>
        }/>
        <ActionButton
          onClick={onToggleNotes}
          disabled={disabled}
          label="Notes"
          active={noteMode}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <path d="M12 20h9" strokeLinecap="round"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />
        <ActionButton
          onClick={onHint}
          disabled={disabled || hintsLeft <= 0}
          label={hintsLeft > 0 ? `Hint (${hintsLeft})` : 'No hints'}
          accent
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" strokeLinecap="round"/>
              <path d="M9 21h6M10 17h4" strokeLinecap="round"/>
            </svg>
          }
        />
      </div>

      <button
        onClick={onFillCandidates}
        disabled={disabled}
        className="w-full py-2 rounded-xl border border-bg-border bg-bg-card text-ink-muted text-xs font-mono hover:bg-bg-hover hover:text-ink-secondary transition-colors disabled:opacity-30 focus:outline-none"
      >
        Fill pencil marks
      </button>

      <p className="text-center text-[10px] text-ink-muted font-mono opacity-60">
        N notes &nbsp;·&nbsp; Ctrl+Z undo &nbsp;·&nbsp; arrows navigate
      </p>
    </div>
  );
}

function ActionButton({ onClick, disabled, label, icon, active, accent }: {
  onClick: () => void; disabled?: boolean; label: string; icon: React.ReactNode; active?: boolean; accent?: boolean;
}) {
  const base = 'flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border transition-all duration-75 active:scale-95 focus:outline-none text-xs font-medium disabled:opacity-30 select-none';
  const style = accent
    ? 'bg-accent/10 border-accent/30 text-accent-soft hover:bg-accent/20 focus:ring-2 focus:ring-accent'
    : active
    ? 'bg-note/10 border-note/30 text-note hover:bg-note/20'
    : 'bg-bg-card border-bg-border text-ink-secondary hover:bg-bg-hover hover:text-ink-primary';
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${style}`} aria-label={label}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
