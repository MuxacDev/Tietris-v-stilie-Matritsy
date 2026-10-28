export type Difficulty = 'easy' | 'normal' | 'hard';
export type Status = 'idle' | 'playing' | 'paused' | 'over';
export type Piece = { matrix: number[][]; x: number; y: number };
export type Game = {
  board: number[][];
  active: Piece | null;
  queue: number[];
  score: number;
  lines: number;
  status: Status;
};

const SHAPES = [
  [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  [[2, 2], [2, 2]],
  [[0, 3, 0], [3, 3, 3], [0, 0, 0]],
  [[0, 4, 4], [4, 4, 0], [0, 0, 0]],
  [[5, 5, 0], [0, 5, 5], [0, 0, 0]],
  [[6, 0, 0], [6, 6, 6], [0, 0, 0]],
  [[0, 0, 7], [7, 7, 7], [0, 0, 0]],
];
export const emptyBoard = () => Array.from({ length: 20 }, () => Array<number>(10).fill(0));
export const shape = (id: number) => SHAPES[id]!.map(row => [...row]);
function bag() {
  const ids = [0, 1, 2, 3, 4, 5, 6];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  }
  return ids;
}
export function initialGame(): Game {
  return { board: emptyBoard(), active: null, queue: bag(), score: 0, lines: 0, status: 'idle' };
}
export function collides(board: number[][], piece: Piece) {
  return piece.matrix.some((row, dy) => row.some((cell, dx) => {
    if (!cell) return false;
    const x = piece.x + dx;
    const y = piece.y + dy;
    return x < 0 || x >= 10 || y >= 20 || (y >= 0 && !!board[y]![x]);
  }));
}
function spawn(game: Game): Game {
  const queue = [...game.queue];
  const matrix = shape(queue.shift()!);
  if (queue.length < 7) queue.push(...bag());
  const active = { matrix, x: Math.floor((10 - matrix.length) / 2), y: 0 };
  return { ...game, queue, active, status: collides(game.board, active) ? 'over' : 'playing' };
}
export const startGame = () => spawn(initialGame());
export function movePiece(game: Game, dx: number, dy = 0): Game {
  if (game.status !== 'playing' || !game.active) return game;
  const active = { ...game.active, x: game.active.x + dx, y: game.active.y + dy };
  return collides(game.board, active) ? game : { ...game, active };
}
export function rotatePiece(game: Game): Game {
  if (game.status !== 'playing' || !game.active) return game;
  const matrix = game.active.matrix[0]!.map((_, i) => game.active!.matrix.map(row => row[i]!).reverse());
  for (const dx of [0, -1, 1, -2, 2]) {
    const active = { ...game.active, matrix, x: game.active.x + dx };
    if (!collides(game.board, active)) return { ...game, active };
  }
  return game;
}
export function ghostY(game: Game) {
  if (!game.active) return 0;
  let y = game.active.y;
  while (!collides(game.board, { ...game.active, y: y + 1 })) y++;
  return y;
}
function lock(game: Game): Game {
  if (!game.active) return game;
  const board = game.board.map(row => [...row]);
  let above = false;
  game.active.matrix.forEach((row, dy) => row.forEach((cell, dx) => {
    if (!cell) return;
    const y = game.active!.y + dy;
    if (y < 0) above = true;
    else board[y]![game.active!.x + dx] = cell;
  }));
  if (above) return { ...game, board, status: 'over' };
  const remaining = board.filter(row => row.some(cell => !cell));
  const cleared = 20 - remaining.length;
  while (remaining.length < 20) remaining.unshift(Array<number>(10).fill(0));
  const points = [0, 100, 300, 500, 800][cleared]!;
  return spawn({
    ...game, board: remaining,
    score: game.score + points * (1 + Math.floor(game.lines / 10)),
    lines: game.lines + cleared,
  });
}
export function dropPiece(game: Game, hard = false, manual = false): Game {
  if (game.status !== 'playing' || !game.active) return game;
  if (hard) {
    const y = ghostY(game);
    return lock({ ...game, score: game.score + (y - game.active.y) * 2, active: { ...game.active, y } });
  }
  const moved = movePiece(game, 0, 1);
  return moved === game ? lock(game) : { ...moved, score: moved.score + (manual ? 1 : 0) };
}
