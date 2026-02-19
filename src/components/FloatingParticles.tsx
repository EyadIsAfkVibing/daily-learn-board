import { motion } from "framer-motion";
import { useMemo } from "react";

const FloatingParticles = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 3,
        duration: 10 + Math.random() * 15,
        delay: Math.random() * 6,
        type: i % 4, // 0=circle, 1=diamond, 2=dot, 3=ring
        drift: (Math.random() - 0.5) * 30,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute will-change-transform"
          style={{
            width: p.type === 3 ? p.size + 4 : p.size,
            height: p.type === 3 ? p.size + 4 : p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            borderRadius: p.type === 1 ? "0" : "50%",
            transform: p.type === 1 ? "rotate(45deg)" : "none",
            background:
              p.type === 3
                ? "none"
                : p.type === 0
                ? `radial-gradient(circle, hsl(var(--glow-primary) / 0.35), transparent)`
                : p.type === 1
                ? `hsl(var(--glow-accent) / 0.25)`
                : `hsl(var(--foreground) / 0.15)`,
            border:
              p.type === 3
                ? "1px solid hsl(var(--glow-primary) / 0.15)"
                : "none",
          }}
          animate={{
            y: [0, -50 + p.drift, 0],
            x: [0, p.drift * 0.5, 0],
            opacity: [0, 0.7, 0.3, 0],
            rotate: p.type === 1 ? [45, 90, 45] : p.type === 3 ? [0, 180, 360] : undefined,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
