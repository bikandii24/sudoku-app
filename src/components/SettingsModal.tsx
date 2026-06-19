import React from 'react';
import type { Preferences, Theme } from '../types';

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

const TOGGLE_ROWS: ToggleRow[] = [
  { key: 'highlightErrors',     label: 'Highlight errors',        description: 'Mark conflicting cells in red' },
  { key: 'highlightRelated',    label: 'Highlight related cells', description: 'Shade same row, column and box' },
  { key: 'highlightSameNumber', label: 'Highlight same number',   description: 'Highlight matching digits when selected' },
  { key: 'autoRemoveNotes',     label: 'Auto-remove pencil marks', description: 'Erase invalidated notes when placing a digit' },
];

const THEMES: { key: Theme; label: string; bg: string; accent: string }[] = [
  { key: 'dark',  label: 'Dark',  bg: '#1a1a21', accent: '#7c6fff' },
  { key: 'light', label: 'Light', bg: '#ffffff',  accent: '#6c5ce7' },
  { key: 'oled',  label: 'OLED',  bg: '#000000',  accent: '#7c6fff' },
  { key: 'nord',  label: 'Nord',  bg: '#3b4252',  accent: '#88c0d0' },
];

export function SettingsModal({ prefs, onChange, onClose }: Props) {
  const toggle = (key: keyof Preferences) => onChange({ ...prefs, [key]: !(prefs[key] as boolean) });
  const setTheme = (theme: Theme) => onChange({ ...prefs, theme });

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

        <div className="p-5 space-y-5">
          {/* Theme selector */}
          <div>
            <p className="text-xs text-ink-muted font-mono uppercase tracking-widest mb-3">Theme</p>
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map(({ key, label, bg, accent }) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`rounded-xl p-2.5 border-2 transition-all flex flex-col items-center gap-1.5 focus:outline-none ${
                    prefs.theme === key ? 'border-accent scale-[1.04]' : 'border-bg-border hover:border-bg-border'
                  }`}
                  style={{ backgroundColor: bg }}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-white/10" style={{ backgroundColor: accent }} />
                  <span className="text-[10px] font-mono font-medium" style={{ color: prefs.theme === key ? accent : '#888' }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-1">
            {TOGGLE_ROWS.map(({ key, label, description }) => (
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
