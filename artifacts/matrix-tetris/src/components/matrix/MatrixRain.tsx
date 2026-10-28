import { useEffect, useRef } from 'react';

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789ЖЯФЦЭΣλ{}<>=+*';

export function MatrixRain({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 16;
    let cols = 0;
    let drops: number[] = [];
    let speeds: number[] = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.ceil(canvas.width / size);
      drops = Array.from({ length: cols }, () => Math.random() * -60);
      speeds = Array.from({ length: cols }, () => 0.35 + Math.random() * 0.75);
      ctx.fillStyle = 'rgb(3,10,6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 45) return;
      last = t;
      ctx.fillStyle = 'rgba(3,10,6,0.09)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${size - 2}px "Share Tech Mono", monospace`;
      const k = intensityRef.current;
      for (let i = 0; i < cols; i++) {
        const y = drops[i] * size;
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        ctx.fillStyle = Math.random() > 0.96 ? '#e8ffe9' : `rgba(60,255,110,${0.55 + Math.random() * 0.3})`;
        ctx.fillText(ch, i * size, y);
        drops[i] += speeds[i] * k;
        if (y > canvas.height && Math.random() > 0.975) drops[i] = Math.random() * -20;
      }
    };
    if (!reduce) raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} aria-hidden className="fixed inset-0 h-full w-full opacity-40 pointer-events-none" />;
}
