import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface Trail {
  id: number;
  x: number;
  y: number;
}

const CursorSystem = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const trailIdRef = useRef(0);
  const rippleIdRef = useRef(0);
  const lastTrailTime = useRef(0);

  // Spring physics — stiff and responsive
  const springX = useSpring(mouseX, { stiffness: 600, damping: 30, mass: 0.3 });
  const springY = useSpring(mouseY, { stiffness: 600, damping: 30, mass: 0.3 });

  const handleMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);

    // Trailing particles — throttled
    const now = Date.now();
    if (now - lastTrailTime.current > 40) {
      lastTrailTime.current = now;
      const id = trailIdRef.current++;
      setTrails(prev => [...prev.slice(-8), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setTrails(prev => prev.filter(t => t.id !== id));
      }, 600);
    }

    // Detect interactive elements
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const interactive = el?.closest("button, a, [role='button'], .cursor-glow-target, [data-interactive]");
    setIsHoveringInteractive(!!interactive);
  }, [mouseX, mouseY]);

  const handleClick = useCallback((e: MouseEvent) => {
    const id = rippleIdRef.current++;
    setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 700);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("click", handleClick);
    };
  }, [handleMove, handleClick]);

  // Hide on touch devices
  const [isTouchDevice] = useState(() =>
    typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)
  );
  if (isTouchDevice) return null;

  const glowSize = isHoveringInteractive ? 280 : 200;

  return (
    <div className="fixed inset-0 pointer-events-none z-[50]" aria-hidden="true">
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
          background: isHoveringInteractive
            ? "radial-gradient(circle, hsl(var(--glow-primary) / 0.12) 0%, hsl(var(--glow-accent) / 0.05) 40%, transparent 70%)"
            : "radial-gradient(circle, hsl(var(--glow-primary) / 0.07) 0%, hsl(var(--glow-accent) / 0.03) 40%, transparent 70%)",
          filter: "blur(2px)",
          transition: "width 0.3s, height 0.3s",
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
          filter: "blur(4px)",
        }}
      />

      {/* Trailing particles */}
      <AnimatePresence>
        {trails.map((t) => (
          <motion.div
            key={t.id}
            className="absolute rounded-full"
            style={{
              left: t.x,
              top: t.y,
              width: 4,
              height: 4,
              background: "hsl(var(--glow-primary) / 0.4)",
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 0.2, y: -10 + Math.random() * 20, x: -10 + Math.random() * 20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Click ripples */}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            className="absolute rounded-full border"
            style={{
              left: r.x,
              top: r.y,
              translateX: "-50%",
              translateY: "-50%",
              borderColor: "hsl(var(--glow-primary) / 0.4)",
            }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ width: 120, height: 120, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CursorSystem;
