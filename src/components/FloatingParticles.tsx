import { motion } from "framer-motion";
import { useMemo } from "react";

const FloatingParticles = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 1 + Math.random() * 3,
        duration: 10 + Math.random() * 15,
        delay: Math.random() * 6,
        type: i % 3, // 0=circle, 1=diamond, 2=dot
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            borderRadius: p.type === 1 ? "0" : "50%",
            transform: p.type === 1 ? "rotate(45deg)" : "none",
            background:
              p.type === 0
                ? `radial-gradient(circle, hsl(var(--glow-primary) / 0.3), transparent)`
                : p.type === 1
                ? `hsl(var(--glow-accent) / 0.2)`
                : `hsl(var(--foreground) / 0.15)`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, p.id % 2 === 0 ? 15 : -15, 0],
            opacity: [0, 0.7, 0.3, 0],
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
