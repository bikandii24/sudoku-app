import React, { useState, useEffect, useRef } from 'react';
import { Board } from '../components/Board';
import { NumberPad } from '../components/NumberPad';
import { WinModal } from '../components/WinModal';
import { HintModal } from '../components/HintModal';
import { Header } from '../components/Header';
import { StatsModal } from '../components/StatsModal';
import { SettingsModal } from '../components/SettingsModal';
import { AchievementToast } from '../components/AchievementToast';
import { useGame } from '../hooks/useGame';
import { loadStats, saveStats, recordWin, recordLoss, loadSession, clearSession, loadPrefs, savePrefs, saveDailyRecord, loadDailyRecords, computeDailyStreak, todayString } from '../lib/storage';
import { checkAchievements, type AchievementDef } from '../lib/achievements';
import { HAPTICS } from '../lib/haptics';
import type { BoolGrid, Difficulty, GameStats, HintResult, Preferences, Theme } from '../types';

interface Props {
  initialDifficulty: Difficulty;
  onHome: () => void;
  onThemeChange?: (t: Theme) => void;
}

const MAX_HINTS: Record<Difficulty, number> = { easy: 5, medium: 4, hard: 3, expert: 2, daily: 3 };
const MAX_MISTAKES = 3;

export function Game({ initialDifficulty, onHome, onThemeChange }: Props) {
  const { state, startGame, selectCell, inputNumber, undo, fillCandidates, toggleNoteMode, togglePause, requestHint, canUndo } = useGame();
  const [stats, setStats] = useState<GameStats>(() => loadStats());
  const [prefs, setPrefs] = useState<Preferences>(() => loadPrefs());
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hintResult, setHintResult] = useState<HintResult | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [flashCell, setFlashCell] = useState<{ row: number; col: number } | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<AchievementDef[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<AchievementDef | null>(null);
  const prevLockedRef = useRef<BoolGrid>(state.locked);
  const prevMistakesRef = useRef(state.mistakesCount);
  const prevStartTimeRef = useRef(state.startTime);
  const lossRecordedRef = useRef(false);

  // Start new game, or restore a compatible saved session
  useEffect(() => {
    const saved = loadSession();
    if (!saved) { startGame(initialDifficulty); return; }
    // Session is for a different difficulty → discard and start fresh
    if (saved.difficulty !== initialDifficulty) { clearSession(); startGame(initialDifficulty); return; }
    // Stale daily session (started before today) → discard and start fresh
    if (initialDifficulty === 'daily') {
      const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0);
      if (saved.startTime < todayMidnight.getTime()) { clearSession(); startGame(initialDifficulty); return; }
    }
    // Compatible session → useGame restores it via its own RESTORE dispatch
  }, []);

  // Detect newly locked cells — flash animation + correct haptic
  useEffect(() => {
    const prev = prevLockedRef.current;
    const curr = state.locked;
    let found = false;
    for (let r = 0; r < 9 && !found; r++) {
      for (let c = 0; c < 9 && !found; c++) {
        if (!prev[r][c] && curr[r][c] && !state.given[r][c]) {
          found = true;
          if (prefs.haptics) HAPTICS.correct();
          setFlashCell({ row: r, col: c });
          const t = setTimeout(() => setFlashCell(null), 550);
          prevLockedRef.current = curr;
          return () => clearTimeout(t);
        }
      }
    }
    prevLockedRef.current = curr;
  }, [state.locked]);

  // Detect new mistakes for haptic — skip on new game / session restore (startTime change)
  useEffect(() => {
    if (state.startTime !== prevStartTimeRef.current) {
      prevMistakesRef.current = state.mistakesCount;
      prevStartTimeRef.current = state.startTime;
      return;
    }
    if (state.mistakesCount > prevMistakesRef.current && prefs.haptics) HAPTICS.mistake();
    prevMistakesRef.current = state.mistakesCount;
  }, [state.mistakesCount, state.startTime]);

  // Handle completion — record win + check achievements
  useEffect(() => {
    if (!state.isComplete || showWin) return;
    if (prefs.haptics) HAPTICS.win();
    const newStats = recordWin(stats, state.difficulty, state.elapsedMs);
    if (state.difficulty === 'daily') {
      saveDailyRecord(todayString(), { date: todayString(), completed: true, timeMs: state.elapsedMs, hintsUsed: state.hintsUsed, mistakes: state.mistakesCount });
    }
    const dailyStreak = computeDailyStreak(loadDailyRecords());
    const newAch = checkAchievements(newStats, { difficulty: state.difficulty, timeMs: state.elapsedMs, hintsUsed: state.hintsUsed, mistakes: state.mistakesCount, dailyStreak });
    const finalStats: GameStats = newAch.length > 0
      ? { ...newStats, achievements: [...newStats.achievements, ...newAch.map(a => ({ id: a.id, unlockedAt: Date.now() }))] }
      : newStats;
    saveStats(finalStats);
    setStats(finalStats);
    if (newAch.length > 0) setAchievementQueue(newAch);
    setTimeout(() => setShowWin(true), 400);
  }, [state.isComplete]);

  // Show achievement toasts sequentially (start after WinModal appears)
  useEffect(() => {
    if (!showWin || achievementQueue.length === 0 || currentAchievement) return;
    const t = setTimeout(() => {
      setCurrentAchievement(achievementQueue[0]);
      setAchievementQueue(prev => prev.slice(1));
    }, 700);
    return () => clearTimeout(t);
  }, [showWin, achievementQueue, currentAchievement]);

  // Handle game lost
  useEffect(() => {
    if (state.mistakesCount < MAX_MISTAKES || state.isComplete || lossRecordedRef.current) return;
    lossRecordedRef.current = true;
    if (prefs.haptics) HAPTICS.lost();
    const newStats = recordLoss(stats);
    saveStats(newStats);
    setStats(newStats);
  }, [state.mistakesCount, state.isComplete]);

  const handlePrefsChange = (p: Preferences) => {
    setPrefs(p);
    savePrefs(p);
    if (p.theme !== prefs.theme) onThemeChange?.(p.theme);
  };

  const gameLost = state.mistakesCount >= MAX_MISTAKES && !state.isComplete;
  const paused = state.isPaused || gameLost;

  const handleHint = () => {
    if (state.hintsUsed >= MAX_HINTS[state.difficulty]) return;
    if (prefs.haptics) HAPTICS.hint();
    const hint = requestHint();
    setHintResult(hint);
  };

  const handleNewGame = (d: Difficulty) => {
    lossRecordedRef.current = false;
    prevLockedRef.current = state.locked;
    setShowWin(false);
    setHintResult(null);
    setAchievementQueue([]);
    setCurrentAchievement(null);
    startGame(d);
  };

  const handleInput = (v: number) => {
    if (!paused) inputNumber(v, { autoRemoveNotes: prefs.autoRemoveNotes });
  };

  const givenCount = state.given.flat().filter(Boolean).length;
  const totalEmpty = 81 - givenCount;
  const filledByUser = state.locked.flat().filter(Boolean).length - givenCount;
  const progress = totalEmpty > 0 ? Math.round((filledByUser / totalEmpty) * 100) : 0;

  return (
    <div className="flex flex-col items-center min-h-screen px-3 pb-6">
      <Header
        difficulty={state.difficulty}
        elapsedMs={state.elapsedMs}
        isPaused={state.isPaused}
        mistakes={state.mistakesCount}
        maxMistakes={MAX_MISTAKES}
        hasGame={!!state.startTime}
        onPause={togglePause}
        onStats={() => setShowStats(true)}
        onSettings={() => setShowSettings(true)}
        onHome={onHome}
      />

      <div className="flex-1 flex flex-col items-center justify-center w-full gap-4 mt-2">
        {state.isPaused && !state.isComplete && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="text-center">
              <div className="text-5xl mb-4">⏸</div>
              <p className="text-ink-secondary text-sm mb-4">Game paused</p>
              <button onClick={togglePause} className="px-6 py-2.5 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors focus:outline-none">
                Resume
              </button>
            </div>
          </div>
        )}

        {gameLost && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="bg-bg-card rounded-2xl p-7 w-full max-w-sm border border-err/30 text-center shadow-2xl">
              <div className="text-4xl mb-3">💔</div>
              <h2 className="text-xl font-semibold text-ink-primary mb-2">Too many mistakes</h2>
              <p className="text-ink-secondary text-sm mb-6">You made {MAX_MISTAKES} mistakes. Better luck next time!</p>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleNewGame(state.difficulty)} className="w-full py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors">
                  Try again
                </button>
                <button onClick={onHome} className="w-full py-2.5 rounded-xl bg-bg-hover border border-bg-border text-ink-secondary text-sm hover:text-ink-primary transition-colors">
                  Home
                </button>
              </div>
            </div>
          </div>
        )}

        <Board
          state={state}
          onSelectCell={(r, c) => selectCell({ row: r, col: c })}
          onInput={handleInput}
          onUndo={undo}
          onToggleNotes={toggleNoteMode}
          highlightRelated={prefs.highlightRelated}
          highlightSameNumber={prefs.highlightSameNumber}
          highlightErrors={prefs.highlightErrors}
          disabled={paused || !!hintResult || showStats || showSettings}
          flashCell={flashCell}
        />

        <NumberPad
          onInput={handleInput}
          onErase={() => handleInput(0)}
          onUndo={undo}
          onHint={handleHint}
          onToggleNotes={toggleNoteMode}
          onFillCandidates={fillCandidates}
          noteMode={state.noteMode}
          hintsUsed={state.hintsUsed}
          maxHints={MAX_HINTS[state.difficulty]}
          disabled={paused}
          canUndo={canUndo}
          board={state.board}
          locked={state.locked}
        />

        {state.startTime > 0 && !state.isComplete && (
          <div className="w-full max-w-[min(420px,90vw)] px-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-ink-muted font-mono">{filledByUser} / {totalEmpty}</span>
              <span className="text-[10px] text-ink-muted font-mono">{progress}%</span>
            </div>
            <div className="h-1 bg-bg-hover rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {showWin && (
        <WinModal
          timeMs={state.elapsedMs}
          difficulty={state.difficulty}
          hintsUsed={state.hintsUsed}
          mistakes={state.mistakesCount}
          date={state.difficulty === 'daily' ? todayString() : undefined}
          onNewGame={handleNewGame}
          onHome={() => { setShowWin(false); onHome(); }}
          onClose={() => setShowWin(false)}
        />
      )}

      {hintResult && <HintModal hint={hintResult} lang="en" onClose={() => setHintResult(null)} />}

      {showStats && <StatsModal stats={stats} onClose={() => setShowStats(false)} />}

      {showSettings && (
        <SettingsModal
          prefs={prefs}
          onChange={handlePrefsChange}
          onClose={() => setShowSettings(false)}
        />
      )}

      {currentAchievement && (
        <AchievementToast
          achievement={currentAchievement}
          onDone={() => setCurrentAchievement(null)}
        />
      )}
    </div>
  );
}
