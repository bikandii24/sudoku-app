function vibrate(pattern: number | number[]): void {
  try { navigator.vibrate?.(pattern); } catch {}
}

export const HAPTICS = {
  correct: () => vibrate(25),
  mistake: () => vibrate([30, 60, 30]),
  win:     () => vibrate([20, 40, 20, 40, 100]),
  lost:    () => vibrate(120),
  hint:    () => vibrate(15),
};
