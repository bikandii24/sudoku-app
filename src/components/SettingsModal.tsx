import React from 'react';
import type { Preferences } from '../types';

interface Props {
  prefs: Preferences;
  onChange: (p: Preferences) => void;
  onClose: () => void;
}

interface ToggleRow {
  key: keyof Preferences;
  label: string;
  description: string;
}

const ROWS: ToggleRow[] = [
  { key: 'highlightErrors',     label: 'Highlight errors',        description: 'Mark conflicting cells in red' },
  { key: 'highlightRelated',    label: 'Highlight related cells', description: 'Shade same row, column and box' },
  { key: 'highlightSameNumber', label: 'Highlight same number',   description: 'Highlight matching digits when selected' },
  { key: 'autoRemoveNotes',     label: 'Auto-remove pencil marks', description: 'Erase invalidated notes when placing a digit' },
];

export function SettingsModal({ prefs, onChange, onClose }: Props) {
  const toggle = (key: keyof Preferences) => onChange({ ...prefs, [key]: !prefs[key] });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-bg-card rounded-2xl w-full max-w-sm border border-bg-border shadow-2xl animate-slide-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-bg-border">
          <h2 className="text-lg font-semibold text-ink-primary">Settings</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink-primary hover:bg-bg-hover transition-colors focus:outline-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-1">
          {ROWS.map(({ key, label, description }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-bg-hover transition-colors focus:outline-none text-left"
            >
              <div>
                <div className="text-sm font-medium text-ink-primary">{label}</div>
                <div className="text-xs text-ink-muted mt-0.5">{description}</div>
              </div>
              <div className={`ml-4 shrink-0 w-11 h-6 rounded-full border-2 transition-all duration-150 relative ${(prefs[key] as boolean) ? 'bg-accent border-accent' : 'bg-bg-hover border-bg-border'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-150 ${(prefs[key] as boolean) ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </div>
            </button>
          ))}
        </div>

        <div className="px-5 pb-5">
          <div className="p-3 rounded-xl bg-bg-hover border border-bg-border">
            <p className="text-xs text-ink-muted leading-relaxed">
              <span className="text-ink-secondary font-medium">Keyboard:</span>
              {' '}1–9 place · Backspace erase · N toggle notes · Ctrl+Z undo · arrow keys navigate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
