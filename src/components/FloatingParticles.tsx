/**
 * FloatingParticles.tsx
 * ─────────────────────────────────────────────────────────────────
 * PERFORMANCE FIX: Converted from 30 Framer Motion animation instances
 * (~120 running property animations) to pure CSS @keyframes.
 * Same visual output, zero JS animation overhead.
 */

import { useMemo, CSSProperties } from "react";

const FLOAT_CSS = `
@keyframes fp-drift {
  0%   { transform: translate(0, 0) scale(1); opacity: 0; }
  15%  { opacity: var(--fp-peak-opacity, 0.7); }
  60%  { opacity: calc(var(--fp-peak-opacity, 0.7) * 0.43); }
  100% { transform: translate(var(--fp-dx), var(--fp-dy)) scale(0.6); opacity: 0; }
}
@keyframes fp-drift-spin {
  0%   { transform: translate(0, 0) rotate(var(--fp-rot-start, 0deg)) scale(1); opacity: 0; }
  15%  { opacity: var(--fp-peak-opacity, 0.7); }
  60%  { opacity: calc(var(--fp-peak-opacity, 0.7) * 0.43); }
  100% { transform: translate(var(--fp-dx), var(--fp-dy)) rotate(var(--fp-rot-end, 360deg)) scale(0.6); opacity: 0; }
}
`;

const FloatingParticles = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const drift = (Math.random() - 0.5) * 30;
        const size = 1 + Math.random() * 3;
        const duration = 10 + Math.random() * 15;
        const delay = Math.random() * 6;
        const type = i % 4; // 0=circle, 1=diamond, 2=dot, 3=ring

        return {
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size,
          duration,
          delay,
          type,
          dx: drift * 0.5,
          dy: -50 + drift,
          peakOpacity: 0.7,
          rotStart: type === 1 ? 45 : type === 3 ? 0 : 0,
          rotEnd: type === 1 ? 90 : type === 3 ? 360 : 0,
          useSpin: type === 1 || type === 3,
        };
      }),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: FLOAT_CSS }} />
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            width: p.type === 3 ? p.size + 4 : p.size,
            height: p.type === 3 ? p.size + 4 : p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            borderRadius: p.type === 1 ? "0" : "50%",
            background:
              p.type === 3
                ? "none"
                : p.type === 0
                  ? "radial-gradient(circle, hsl(var(--glow-primary) / 0.35), transparent)"
                  : p.type === 1
                    ? "hsl(var(--glow-accent) / 0.25)"
                    : "hsl(var(--foreground) / 0.15)",
            border:
              p.type === 3
                ? "1px solid hsl(var(--glow-primary) / 0.15)"
                : "none",
            willChange: "transform, opacity",
            "--fp-dx": `${p.dx}px`,
            "--fp-dy": `${p.dy}px`,
            "--fp-peak-opacity": String(p.peakOpacity),
            "--fp-rot-start": `${p.rotStart}deg`,
            "--fp-rot-end": `${p.rotEnd}deg`,
            animation: `${p.useSpin ? "fp-drift-spin" : "fp-drift"} ${p.duration}s ${p.delay}s ease-in-out infinite`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
