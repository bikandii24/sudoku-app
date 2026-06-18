import React, { memo } from 'react';

interface Props {
  value: number;
  notes: Set<number>;
  isGiven: boolean;
  isLocked: boolean;
  isSelected: boolean;
  isRelated: boolean;
  isSameNumber: boolean;
  isError: boolean;
  isNew: boolean;
  row: number;
  col: number;
  onClick: () => void;
}

const NOTE_POS = [1,2,3,4,5,6,7,8,9];

export const Cell = memo(function Cell({
  value, notes, isGiven, isLocked, isSelected, isRelated, isSameNumber, isError, isNew, row, col, onClick
}: Props) {
  const borderR = col === 2 || col === 5 ? 'border-r-2 border-r-bg-border' : 'border-r border-r-bg-border/40';
  const borderB = row === 2 || row === 5 ? 'border-b-2 border-b-bg-border' : 'border-b border-b-bg-border/40';

  let bg = 'bg-bg-card';
  if (isSelected)              bg = 'bg-accent-dim';
  else if (isNew)              bg = 'bg-ok/15 animate-lock-flash';
  else if (isError)            bg = 'bg-err-dim';
  else if (isSameNumber && value) bg = 'bg-accent/10';
  else if (isRelated)          bg = 'bg-bg-hover/70';

  let textColor = isGiven
    ? 'text-ink-primary font-medium'
    : isLocked
    ? 'text-ok'
    : isError
    ? 'text-err'
    : 'text-accent-soft';

  const ring = isSelected ? 'ring-2 ring-accent ring-inset' : '';

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center aspect-square cursor-pointer select-none transition-colors duration-75 ${borderR} ${borderB} ${bg} ${ring} focus:outline-none`}
      aria-label={`Cell row ${row+1} column ${col+1}${value ? ` value ${value}` : ''}`}
    >
      {value !== 0 ? (
        <span className={`font-mono text-[clamp(14px,3.5vw,26px)] leading-none ${textColor} ${isNew ? 'animate-pop' : ''}`}>
          {value}
        </span>
      ) : notes.size > 0 ? (
        <div className="absolute inset-0.5 grid grid-cols-3 grid-rows-3">
          {NOTE_POS.map(n => (
            <span key={n} className={`flex items-center justify-center font-mono text-[clamp(7px,1.2vw,10px)] leading-none ${notes.has(n) ? 'text-note' : 'text-transparent'}`}>
              {n}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
});
