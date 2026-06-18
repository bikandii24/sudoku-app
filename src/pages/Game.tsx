import React, { useState, useEffect } from 'react';
import { Board } from '../components/Board';
import { NumberPad } from '../components/NumberPad';
import { WinModal } from '../components/WinModal';
import { HintModal } from '../components/HintModal';
import { Header } from '../components/Header';
import { StatsModal } from '../components/StatsModal';
import { useGame } from '../hooks/useGame';
import { loadStats, saveStats, recordWin, loadSession, saveDailyRecord, todayString } from '../lib/storage';
import type { Difficulty, GameStats, HintResult } from '../types';

interface Props {
  initialDifficulty: Difficulty;
  onHome: () => void;
}

const MAX_HINTS: Record<Difficulty, number> = { easy: 5, medium: 4, hard: 3, expert: 2, daily: 3 };
const MAX_MISTAKES = 3;

export function Game({ initialDifficulty, onHome }: Props) {
  const { state, startGame, selectCell, inputNumber, toggleNote, undo, toggleNoteMode, togglePause, requestHint } = useGame();
  const [stats, setStats] = useState<GameStats>(() => loadStats());
  const [showStats, setShowStats] = useState(false);
  const [hintResult, setHintResult] = useState<HintResult | null>(null);
  const [showWin, setShowWin] = useState(false);

  // Start new game only if there is no saved session to restore
  useEffect(() => {
    if (!loadSession()) startGame(initialDifficulty);
  }, []);

  // Handle completion
  useEffect(() => {
    if (!state.isComplete || showWin) return;
    const newStats = recordWin(stats, state.difficulty, state.elapsedMs);
    if (state.difficulty === 'daily') {
      saveDailyRecord(todayString(), { date: todayString(), completed: true, timeMs: state.elapsedMs, hintsUsed: state.hintsUsed, mistakes: state.mistakesCount });
    }
    saveStats(newStats);
    setStats(newStats);
    setTimeout(() => setShowWin(true), 400);
  }, [state.isComplete]);

  // Auto-loss on max mistakes
  const gameLost = state.mistakesCount >= MAX_MISTAKES && !state.isComplete;

  const handleHint = () => {
    if (state.hintsUsed >= MAX_HINTS[state.difficulty]) return;
    const hint = requestHint();
    setHintResult(hint);
  };

  const handleNewGame = (d: Difficulty) => {
    setShowWin(false);
    setHintResult(null);
    startGame(d);
  };

  const paused = state.isPaused || gameLost;

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
        onHome={onHome}
      />

      <div className="flex-1 flex flex-col items-center justify-center w-full gap-4 mt-2">
        {/* Pause overlay */}
        {state.isPaused && !state.isComplete && (
          <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="text-center">
              <div className="text-5xl mb-4">⏸</div>
              <p className="text-ink-secondary text-sm mb-4">Game paused</p>
              <button
                onClick={togglePause}
                className="px-6 py-2.5 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors focus:outline-none"
              >
                Resume
              </button>
            </div>
          </div>
        )}

        {/* Max mistakes overlay */}
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
          onInput={inputNumber}
          onUndo={undo}
          highlightRelated
          highlightSameNumber
          highlightErrors
        />

        <NumberPad
          onInput={(v) => { if (!paused) inputNumber(v); }}
          onErase={() => { if (!paused) inputNumber(0); }}
          onUndo={undo}
          onHint={handleHint}
          onToggleNotes={toggleNoteMode}
          noteMode={state.noteMode}
          hintsUsed={state.hintsUsed}
          maxHints={MAX_HINTS[state.difficulty]}
          disabled={paused}
        />

        {/* Progress bar */}
        {state.startTime > 0 && (
          <div className="w-full max-w-[min(420px,90vw)] px-1">
            <div className="h-1 bg-bg-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${Math.round((state.board.flat().filter(Boolean).length / 81) * 100)}%` }}
              />
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
          onNewGame={handleNewGame}
          onClose={() => setShowWin(false)}
        />
      )}

      {hintResult && (
        <HintModal
          hint={hintResult}
          lang="en"
          onClose={() => setHintResult(null)}
        />
      )}

      {showStats && (
        <StatsModal
          stats={stats}
          onClose={() => setShowStats(false)}
        />
      )}
    </div>
  );
}
