import React from 'react';
import type { HintResult } from '../types';

interface Props {
  hint: HintResult;
  lang?: 'es' | 'en';
  onClose: () => void;
}

const TECHNIQUE_LABELS: Record<HintResult['type'], { label: string; color: string }> = {
  'naked-single': { label: 'Naked Single', color: 'text-ok' },
  'hidden-single': { label: 'Hidden Single', color: 'text-note' },
  'naked-pair': { label: 'Naked Pair', color: 'text-accent-soft' },
  'pointing-pair': { label: 'Pointing Pair', color: 'text-warn' },
  'generic': { label: 'Hint', color: 'text-ink-secondary' },
};

export function HintModal({ hint, lang = 'en', onClose }: Props) {
  const tech = TECHNIQUE_LABELS[hint.type];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-bg-card rounded-2xl p-6 w-full max-w-sm border border-bg-border animate-slide-up shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-bg-hover border border-bg-border ${tech.color}`}>
            {tech.label}
          </div>
          {hint.cell && (
            <span className="text-ink-muted text-xs font-mono">
              Row {hint.cell.row + 1} · Col {hint.cell.col + 1}
            </span>
          )}
        </div>

        <p className="text-ink-primary text-sm leading-relaxed mb-5">
          {hint.description[lang]}
        </p>

        {hint.value && hint.cell && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-dim border border-accent/20 mb-5">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center font-mono text-xl text-white font-medium shrink-0">
              {hint.value}
            </div>
            <span className="text-ink-secondary text-sm">
              Place <span className="text-accent-soft font-medium">{hint.value}</span> in this cell
            </span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-bg-hover border border-bg-border text-ink-secondary hover:text-ink-primary transition-colors text-sm focus:outline-none"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
