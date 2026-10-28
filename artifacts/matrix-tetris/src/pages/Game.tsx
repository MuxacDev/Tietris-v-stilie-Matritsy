import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ChevronsDown, Pause, Play, RotateCw, Square } from 'lucide-react';
import { useTetris, type Difficulty } from '../game/useTetris';
import { MatrixRain } from '@/components/matrix/MatrixRain';

const ROWS = 20;
const COLS = 10;
const CHARS = ['', '0', '1', 'ア', 'Ж', 'λ', '$', '#'];
const COLORS = ['', '128 100% 55%', '160 100% 50%', '95 100% 55%', '175 90% 55%', '110 70% 42%', '140 100% 72%', '75 100% 50%'];
const DIFFS: { id: Difficulty; label: string; hint: string }[] = [
  { id: 'easy', label: 'НОВИЧОК', hint: 'синяя таблетка' },
  { id: 'normal', label: 'ОПЕРАТОР', hint: 'стандартный поток' },
  { id: 'hard', label: 'ИЗБРАННЫЙ', hint: 'красная таблетка' },
];

function Cell({ v, ghost }: { v: number; ghost?: boolean }) {
  if (ghost) return <div className="cell border border-dashed border-[hsl(128_100%_55%/.35)]" />;
  if (!v) return <div className="cell border border-[hsl(140_60%_12%/.35)]" />;
  const c = COLORS[v] ?? COLORS[1];
  return (
    <div
      className="cell flex items-center justify-center text-[clamp(8px,1.6vh,13px)] font-bold"
      style={{
        background: `hsl(${c} / .22)`,
        border: `1px solid hsl(${c})`,
        color: `hsl(${c})`,
        boxShadow: `inset 0 0 8px hsl(${c} / .45)`,
      }}
    >
      {CHARS[v]}
    </div>
  );
}

function Mini({ m }: { m: number[][] }) {
  const w = Math.max(1, ...m.map((r) => r.length));
  return (
    <div className="grid gap-[2px] mx-auto" style={{ gridTemplateColumns: `repeat(${w}, 18px)` }} data-testid="preview-next">
      {m.flatMap((r, y) => r.map((v, x) => <div key={`${y}-${x}`} className="h-[18px]">{v ? <Cell v={v} /> : null}</div>))}
    </div>
  );
}

function Stat({ label, value, id }: { label: string; value: number; id: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[10px] tracking-[.2em] text-muted-foreground">{label}</span>
      <span key={value} className="pop text-lg font-extrabold glow tabular-nums" data-testid={`text-${id}`}>{value.toLocaleString('ru-RU')}</span>
    </div>
  );
}

export default function Game() {
  const t = useTetris();
  const { board, active, ghostY, status } = t;
  const [flash, setFlash] = useState(0);
  const prevLines = useRef(t.lines);
  useEffect(() => {
    if (t.lines > prevLines.current) setFlash((f) => f + 1);
    prevLines.current = t.lines;
  }, [t.lines]);

  const grid = useMemo(() => {
    const g = board.map((r) => r.map((v) => ({ v, ghost: false })));
    if (active) {
      active.matrix.forEach((r, y) => r.forEach((v, x) => {
        const gy = ghostY + y, gx = active.x + x;
        if (v && g[gy]?.[gx] && !g[gy][gx].v) g[gy][gx].ghost = true;
      }));
      active.matrix.forEach((r, y) => r.forEach((v, x) => {
        const py = active.y + y, px = active.x + x;
        if (v && g[py]?.[px]) g[py][px] = { v, ghost: false };
      }));
    }
    return g;
  }, [board, active, ghostY]);

  const playing = status === 'playing';
  const locked = status === 'playing' || status === 'paused';
  const statusLabel = { idle: 'ОЖИДАНИЕ', playing: 'В СЕТИ', paused: 'ПАУЗА', over: 'СИСТЕМА ПАЛА' }[status];

  return (
    <div className="relative min-h-[100dvh] overflow-hidden">
      <MatrixRain intensity={playing ? 1 + t.level * 0.15 : 0.6} />
      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-5xl flex-col px-3 py-3 md:py-6">
        <header className="rise flex items-center justify-between gap-2 pb-3 md:pb-6">
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-[.25em] glow glitch" data-testid="text-title">MATRIX<span className="text-muted-foreground">/</span>TETRIS</h1>
            <p className="text-[10px] md:text-xs text-muted-foreground tracking-widest">wake up, coder. блоки ждут.</p>
          </div>
          <div className="text-right text-[10px] md:text-xs tracking-widest">
            <div className="text-muted-foreground">STATUS</div>
            <div className={status === 'over' ? 'text-destructive' : 'glow'} data-testid="status-game">
              {statusLabel}<span className="blink">_</span>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center gap-4 md:flex-row md:items-start md:justify-center md:gap-8">
          {/* Mobile compact stats */}
          <div className="flex w-full max-w-sm justify-between gap-2 text-xs md:hidden">
            <div className="panel flex-1 px-2 pt-3 pb-1.5" data-label="СЧЁТ"><span key={t.score} className="pop font-bold glow">{t.score}</span></div>
            <div className="panel flex-1 px-2 pt-3 pb-1.5" data-label="ЛИНИИ"><span className="font-bold">{t.lines}</span></div>
            <div className="panel flex-1 px-2 pt-3 pb-1.5" data-label="УР"><span className="font-bold">{t.level}</span></div>
            <div className="panel flex-1 px-2 pt-3 pb-1.5" data-label="ДАЛЕЕ"><div className="scale-[.55] origin-top-left h-6"><Mini m={t.next} /></div></div>
          </div>

          <section className="rise relative" style={{ animationDelay: '.1s' }}>
            <div
              className="panel p-1.5 shadow-[0_0_40px_hsl(128_100%_45%/.15)]"
              data-label="root@zion:~/board"
            >
              <div
                className="relative grid gap-[1px] bg-[hsl(150_45%_3%/.9)]"
                style={{
                  gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                  height: 'min(64dvh, 620px)',
                  aspectRatio: '1 / 2',
                }}
                data-testid="board"
              >
                {grid.flatMap((r, y) => r.map((c, x) => <Cell key={`${y}-${x}`} v={c.v} ghost={c.ghost} />))}
                {flash > 0 && <div key={flash} className="flash pointer-events-none absolute inset-0 bg-[hsl(128_100%_70%)]" />}

                {status !== 'playing' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[hsl(150_45%_3%/.85)] p-4 text-center backdrop-blur-[2px]">
                    {status === 'idle' && (
                      <div className="rise space-y-3">
                        <p className="text-[10px] tracking-[.3em] text-muted-foreground">&gt; INIT SEQUENCE</p>
                        <p className="text-lg font-extrabold glow leading-tight">Следуй за<br />белым кроликом</p>
                        <p className="text-[11px] text-muted-foreground">Собирай строки кода.<br />Не дай стеку переполниться.</p>
                      </div>
                    )}
                    {status === 'paused' && (
                      <div className="rise space-y-2">
                        <p className="text-2xl font-extrabold glow tracking-[.3em]">ПАУЗА</p>
                        <p className="text-[11px] text-muted-foreground">Реальность заморожена. P — продолжить.</p>
                      </div>
                    )}
                    {status === 'over' && (
                      <div className="rise space-y-2">
                        <p className="text-[10px] tracking-[.3em] text-destructive">FATAL: STACK OVERFLOW</p>
                        <p className="text-xl font-extrabold text-destructive glitch-auto">АГЕНТ ПОБЕДИЛ</p>
                        <p className="text-sm">Счёт: <b className="glow" data-testid="text-final-score">{t.score}</b></p>
                        {t.score > 0 && t.score >= t.best && <p className="text-xs glow">Новый рекорд системы</p>}
                      </div>
                    )}
                    {status === 'paused' ? (
                      <button className="btn btn-solid px-5 py-2 text-sm font-bold tracking-widest" onClick={t.togglePause} data-testid="button-resume">ПРОДОЛЖИТЬ</button>
                    ) : (
                      <button className="btn btn-solid px-5 py-2 text-sm font-bold tracking-widest" onClick={t.start} data-testid="button-start">
                        {status === 'over' ? 'ПЕРЕЗАГРУЗКА' : 'ВОЙТИ В МАТРИЦУ'}
                      </button>
                    )}
                    <p className="hidden md:block text-[10px] text-muted-foreground">[Enter] старт</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="rise flex w-full max-w-sm flex-col gap-5 md:w-64" style={{ animationDelay: '.2s' }}>
            <div className="panel hidden md:block p-4 pt-5" data-label="NEXT // ДАЛЕЕ">
              <div className="flex h-16 items-center justify-center"><Mini m={t.next} /></div>
            </div>
            <div className="panel hidden md:flex flex-col gap-2 p-4 pt-5" data-label="TELEMETRY">
              <Stat label="СЧЁТ" value={t.score} id="score" />
              <Stat label="РЕКОРД" value={t.best} id="best" />
              <Stat label="ЛИНИИ" value={t.lines} id="lines" />
              <Stat label="УРОВЕНЬ" value={t.level} id="level" />
            </div>
            <div className="panel p-3 pt-5" data-label="СЛОЖНОСТЬ">
              <div className="grid grid-cols-3 gap-1.5">
                {DIFFS.map((d) => (
                  <button
                    key={d.id}
                    disabled={locked}
                    onClick={() => t.setDifficulty(d.id)}
                    title={d.hint}
                    className={`btn px-1 py-2 text-[10px] font-bold tracking-wider ${t.difficulty === d.id ? 'btn-solid' : ''}`}
                    data-testid={`button-difficulty-${d.id}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                {locked ? 'заблокировано во время сессии' : DIFFS.find((d) => d.id === t.difficulty)?.hint}
              </p>
            </div>
            <div className="hidden md:flex gap-2">
              <button className="btn flex flex-1 items-center justify-center gap-2 py-2 text-xs" disabled={!locked} onClick={t.togglePause} data-testid="button-pause">
                {status === 'paused' ? <Play size={14} /> : <Pause size={14} />} {status === 'paused' ? 'ДАЛЬШЕ' : 'ПАУЗА'}
              </button>
              <button className="btn flex flex-1 items-center justify-center gap-2 py-2 text-xs" disabled={!locked} onClick={t.end} data-testid="button-end">
                <Square size={14} /> ВЫХОД
              </button>
            </div>
            <div className="panel hidden md:block p-4 pt-5 text-[11px] leading-6 text-muted-foreground" data-label="man tetris">
              <div><span className="text-primary">← →</span> сдвиг</div>
              <div><span className="text-primary">↑</span> поворот</div>
              <div><span className="text-primary">↓</span> ускорить</div>
              <div><span className="text-primary">SPACE</span> сброс вниз</div>
              <div><span className="text-primary">P / ESC</span> пауза</div>
            </div>
          </aside>

          {/* Mobile controls */}
          <div className="grid w-full max-w-sm grid-cols-5 gap-2 pb-2 md:hidden">
            <Pad onPress={() => t.move(-1)} label="Влево" id="left" disabled={!playing}><ArrowLeft /></Pad>
            <Pad onPress={t.softDrop} label="Вниз" id="down" disabled={!playing}><ArrowDown /></Pad>
            <Pad onPress={() => t.move(1)} label="Вправо" id="right" disabled={!playing}><ArrowRight /></Pad>
            <Pad onPress={t.rotate} label="Поворот" id="rotate" disabled={!playing}><RotateCw /></Pad>
            <Pad onPress={t.hardDrop} label="Сброс" id="drop" disabled={!playing}><ChevronsDown /></Pad>
            <button className="btn col-span-3 py-2 text-xs" disabled={!locked} onClick={t.togglePause} data-testid="button-pause-mobile">
              {status === 'paused' ? 'ПРОДОЛЖИТЬ' : 'ПАУЗА'}
            </button>
            <button className="btn col-span-2 py-2 text-xs" disabled={!locked} onClick={t.end} data-testid="button-end-mobile">ВЫХОД</button>
            <p className="col-span-5 text-center text-[10px] text-muted-foreground">рекорд: {t.best}</p>
          </div>
        </main>
      </div>
    </div>
  );
}

function Pad({ onPress, label, id, disabled, children }: { onPress: () => void; label: string; id: string; disabled: boolean; children: React.ReactNode }) {
  const timer = useRef<number | null>(null);
  const fn = useRef(onPress);
  fn.current = onPress;
  const stop = () => { if (timer.current) { clearInterval(timer.current); timer.current = null; } };
  useEffect(() => stop, []);
  const repeat = id === 'left' || id === 'right' || id === 'down';
  return (
    <button
      aria-label={label}
      disabled={disabled}
      className="btn flex h-14 items-center justify-center"
      onPointerDown={(e) => {
        e.preventDefault();
        fn.current();
        if (repeat) { stop(); timer.current = window.setInterval(() => fn.current(), 110); }
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
      data-testid={`button-${id}`}
    >
      {children}
    </button>
  );
}
