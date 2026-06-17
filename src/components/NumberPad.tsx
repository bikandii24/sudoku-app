import React from 'react';

interface Props {
  onInput: (v: number) => void;
  onErase: () => void;
  onUndo: () => void;
  onHint: () => void;
  onToggleNotes: () => void;
  noteMode: boolean;
  hintsUsed: number;
  maxHints?: number;
  disabled?: boolean;
}

const DIGITS = [1,2,3,4,5,6,7,8,9];

export function NumberPad({ onInput, onErase, onUndo, onHint, onToggleNotes, noteMode, hintsUsed, maxHints = 3, disabled }: Props) {
  const hintsLeft = maxHints - hintsUsed;

  return (
    <div className="w-full max-w-[min(420px,90vw)] mx-auto flex flex-col gap-3">
      {/* Digit buttons */}
      <div className="grid grid-cols-9 gap-1.5">
        {DIGITS.map(n => (
          <button
            key={n}
            disabled={disabled}
            onClick={() => onInput(n)}
            className="aspect-square rounded-lg bg-bg-card border border-bg-border font-mono font-medium text-ink-primary text-lg transition-all duration-75 active:scale-90 hover:bg-bg-hover hover:border-accent/40 disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {n}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-2">
        <ActionButton onClick={onErase} disabled={disabled} label="Erase" icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
            <path d="M20 20H7L3 16l9-9 8 8-1.5 1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 17.5l4-4" strokeLinecap="round"/>
          </svg>
        }/>
        <ActionButton onClick={onUndo} disabled={disabled} label="Undo" icon={
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
          label={`Hint ${hintsLeft > 0 ? `(${hintsLeft})` : ''}`}
          accent
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" strokeLinecap="round"/>
              <path d="M9 21h6M10 17h4" strokeLinecap="round"/>
            </svg>
          }
        />
      </div>
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
