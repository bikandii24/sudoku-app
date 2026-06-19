import React, { useEffect } from 'react';
import type { AchievementDef } from '../lib/achievements';

interface Props {
  achievement: AchievementDef;
  onDone: () => void;
}

export function AchievementToast({ achievement, onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [achievement.id]);

  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] animate-slide-up cursor-pointer"
      onClick={onDone}
      role="button"
      aria-label="Dismiss achievement"
    >
      <div className="bg-bg-card border border-accent/40 rounded-2xl px-5 py-3.5 flex items-center gap-3.5 shadow-2xl">
        <span className="text-2xl leading-none">{achievement.icon}</span>
        <div>
          <div className="text-[10px] text-accent-soft font-mono uppercase tracking-widest mb-0.5">Achievement unlocked</div>
          <div className="text-sm font-semibold text-ink-primary leading-snug">{achievement.title}</div>
          <div className="text-xs text-ink-muted mt-0.5">{achievement.description}</div>
        </div>
      </div>
    </div>
  );
}
