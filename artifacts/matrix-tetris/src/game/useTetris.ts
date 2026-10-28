import { useCallback, useEffect, useRef, useState } from 'react';
import {
  dropPiece, ghostY, initialGame, movePiece, rotatePiece, shape, startGame,
  type Difficulty,
} from './engine';
export type { Difficulty } from './engine';

const BEST_KEY = 'matrix-tetris-best';
function readBest() {
  try {
    const n = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch { return 0; }
}

export function useTetris() {
  const [game, setGame] = useState(initialGame);
  const [difficulty, updateDifficulty] = useState<Difficulty>('normal');
  const [best, setBest] = useState(readBest);
  const gameRef = useRef(game);
  gameRef.current = game;
  const level = 1 + Math.floor(game.lines / 10);
  const start = useCallback(() => setGame(startGame()), []);
  const end = useCallback(() => setGame(g => g.status === 'idle' ? g : { ...g, status: 'over' }), []);
  const togglePause = useCallback(() => setGame(g =>
    g.status === 'playing' ? { ...g, status: 'paused' } :
      g.status === 'paused' ? { ...g, status: 'playing' } : g), []);
  const move = useCallback((dx: number) => setGame(g => movePiece(g, dx)), []);
  const rotate = useCallback(() => setGame(rotatePiece), []);
  const softDrop = useCallback(() => setGame(g => dropPiece(g, false, true)), []);
  const hardDrop = useCallback(() => setGame(g => dropPiece(g, true)), []);
  const setDifficulty = useCallback((d: Difficulty) => {
    if (gameRef.current.status === 'idle' || gameRef.current.status === 'over') updateDifficulty(d);
  }, []);

  useEffect(() => {
    if (game.status !== 'playing') return;
    const initialSpeed = { easy: 900, normal: 600, hard: 300 }[difficulty];
    const timer = window.setInterval(() => setGame(g => dropPiece(g)), Math.max(75, initialSpeed * Math.pow(0.82, level - 1)));
    return () => window.clearInterval(timer);
  }, [game.status, difficulty, level]);

  useEffect(() => {
    if (game.score <= best) return;
    setBest(game.score);
    try { localStorage.setItem(BEST_KEY, String(game.score)); } catch { /* Game remains playable without storage access. */ }
  }, [game.score, best]);

  useEffect(() => {
    function keydown(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && (e.target.matches('input, select, textarea') || e.target.isContentEditable)) return;
      const handled = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space', 'KeyP', 'Escape', 'Enter'].includes(e.code);
      if (!handled) return;
      if (e.code === 'Enter' && e.target instanceof HTMLElement && e.target.closest('button')) return;
      e.preventDefault();
      if (e.repeat && ['Space', 'ArrowUp', 'KeyP', 'Escape', 'Enter'].includes(e.code)) return;
      switch (e.code) {
        case 'ArrowLeft': move(-1); break;
        case 'ArrowRight': move(1); break;
        case 'ArrowDown': softDrop(); break;
        case 'ArrowUp': rotate(); break;
        case 'Space': hardDrop(); break;
        case 'KeyP': case 'Escape': togglePause(); break;
        case 'Enter':
          if (['idle', 'over'].includes(gameRef.current.status)) start();
          else if (gameRef.current.status === 'paused') togglePause();
          break;
      }
    }
    function pauseHidden() {
      if (document.hidden) setGame(g => g.status === 'playing' ? { ...g, status: 'paused' } : g);
    }
    window.addEventListener('keydown', keydown);
    document.addEventListener('visibilitychange', pauseHidden);
    return () => {
      window.removeEventListener('keydown', keydown);
      document.removeEventListener('visibilitychange', pauseHidden);
    };
  }, [move, softDrop, rotate, hardDrop, togglePause, start]);

  return {
    board: game.board, active: game.active, ghostY: ghostY(game),
    next: shape(game.queue[0]!), score: game.score, best,
    lines: game.lines, level, status: game.status, difficulty,
    setDifficulty, start, end, togglePause, move, rotate, softDrop, hardDrop,
  };
}
