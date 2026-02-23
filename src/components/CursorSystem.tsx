/**
 * CursorSystem.tsx
 * ─────────────────────────────────────────────────────────────────
 * GPU-accelerated cursor glow + trail system.
 * ZERO React re-renders — all motion is imperative DOM + CSS animations.
 *
 * Previous version used useState for trails/ripples, causing 25+ re-renders/sec.
 * This version uses a DOM pool with CSS keyframe animations.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

// CSS keyframes injected once
const CURSOR_CSS = `
@keyframes cursor-trail-fade {
  0%   { opacity: 0.5; transform: translate(-50%,-50%) scale(1); }
  100% { opacity: 0;   transform: translate(-50%,-50%) scale(0.2) translateY(-12px); }
}
@keyframes cursor-ripple {
  0%   { width: 0; height: 0; opacity: 0.7; }
  100% { width: 120px; height: 120px; opacity: 0; }
}
`;

const TRAIL_POOL_SIZE = 10;
const TRAIL_THROTTLE_MS = 45;
const RIPPLE_DURATION_MS = 600;

const CursorSystem = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);

  // Spring physics — stiff and responsive
  const springX = useSpring(mouseX, { stiffness: 600, damping: 30, mass: 0.3 });
  const springY = useSpring(mouseY, { stiffness: 600, damping: 30, mass: 0.3 });

  // Refs for imperative DOM manipulation
  const containerRef = useRef<HTMLDivElement>(null);
  const trailPoolRef = useRef<HTMLDivElement[]>([]);
  const trailIndexRef = useRef(0);
  const lastTrailTimeRef = useRef(0);
  const styleInjectedRef = useRef(false);

  // Inject CSS once
  useEffect(() => {
    if (styleInjectedRef.current) return;
    styleInjectedRef.current = true;
    const style = document.createElement("style");
    style.textContent = CURSOR_CSS;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Build trail pool (DOM nodes reused, not created/destroyed)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const pool: HTMLDivElement[] = [];
    for (let i = 0; i < TRAIL_POOL_SIZE; i++) {
      const el = document.createElement("div");
      el.style.cssText = `
        position: absolute;
        width: 4px; height: 4px;
        border-radius: 50%;
        background: hsl(var(--glow-primary) / 0.4);
        pointer-events: none;
        opacity: 0;
        will-change: transform, opacity;
      `;
      container.appendChild(el);
      pool.push(el);
    }
    trailPoolRef.current = pool;

    return () => {
      pool.forEach(el => el.remove());
    };
  }, []);

  const handleMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);

    // Throttled trail particles — imperative, no setState
    const now = Date.now();
    if (now - lastTrailTimeRef.current > TRAIL_THROTTLE_MS) {
      lastTrailTimeRef.current = now;
      const pool = trailPoolRef.current;
      if (pool.length === 0) return;
      const idx = trailIndexRef.current % TRAIL_POOL_SIZE;
      trailIndexRef.current++;
      const el = pool[idx];
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.style.animation = "none";
      // Force reflow to restart animation (single read, minimal cost)
      void el.offsetWidth;
      el.style.animation = `cursor-trail-fade 0.5s ease-out forwards`;
    }
  }, [mouseX, mouseY]);

  const handleClick = useCallback((e: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const ripple = document.createElement("div");
    ripple.style.cssText = `
      position: absolute;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      border: 1px solid hsl(var(--glow-primary) / 0.4);
      pointer-events: none;
      will-change: width, height, opacity;
      animation: cursor-ripple ${RIPPLE_DURATION_MS}ms ease-out forwards;
    `;
    container.appendChild(ripple);
    setTimeout(() => ripple.remove(), RIPPLE_DURATION_MS);
  }, []);

  // Interactive element detection via delegation (no per-frame elementFromPoint)
  useEffect(() => {
    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el?.closest("button, a, [role='button'], .cursor-glow-target, [data-interactive]")) {
        setIsHovering(true);
      }
    };
    const onOut = (e: MouseEvent) => {
      const related = (e as any).relatedTarget as HTMLElement | null;
      if (!related?.closest("button, a, [role='button'], .cursor-glow-target, [data-interactive]")) {
        setIsHovering(false);
      }
    };
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("click", handleClick);
    };
  }, [handleMove, handleClick]);

  // Hide on touch devices
  const [isTouchDevice] = useState(() =>
    typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)
  );
  if (isTouchDevice) return null;

  const glowSize = isHovering ? 280 : 200;

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[50]" aria-hidden="true">
      {/* Main energy aura */}
      <motion.div
        className="absolute rounded-full"
        style={{
          x: springX,
          y: springY,
          width: glowSize,
          height: glowSize,
          translateX: "-50%",
          translateY: "-50%",
          background: isHovering
            ? "radial-gradient(circle, hsl(var(--glow-primary) / 0.12) 0%, hsl(var(--glow-accent) / 0.05) 40%, transparent 70%)"
            : "radial-gradient(circle, hsl(var(--glow-primary) / 0.07) 0%, hsl(var(--glow-accent) / 0.03) 40%, transparent 70%)",
          transition: "width 0.3s, height 0.3s, background 0.3s",
        }}
      />

      {/* Inner bright core */}
      <motion.div
        className="absolute rounded-full"
        style={{
          x: springX,
          y: springY,
          width: 20,
          height: 20,
          translateX: "-50%",
          translateY: "-50%",
          background: "radial-gradient(circle, hsl(var(--glow-primary) / 0.25) 0%, transparent 70%)",
        }}
      />
    </div>
  );
};

export default CursorSystem;
