import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface RamadanOverlayProps {
  active: boolean;
}

const RamadanOverlay = ({ active }: RamadanOverlayProps) => {
  const stars = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 70,
        size: 1 + Math.random() * 2,
        duration: 4 + Math.random() * 6,
        delay: Math.random() * 4,
      })),
    []
  );

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[4]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          {/* Night sky gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 60% 40% at 75% 15%, hsl(45 70% 50% / 0.04) 0%, transparent 50%),
                radial-gradient(ellipse 40% 30% at 25% 80%, hsl(155 55% 45% / 0.03) 0%, transparent 50%)
              `,
            }}
          />

          {/* Crescent moon */}
          <motion.div
            className="absolute"
            style={{
              top: "8%",
              right: "12%",
              width: "60px",
              height: "60px",
            }}
            animate={{
              opacity: [0.6, 0.9, 0.6],
              filter: [
                "drop-shadow(0 0 15px hsl(45 80% 60% / 0.4))",
                "drop-shadow(0 0 25px hsl(45 80% 60% / 0.6))",
                "drop-shadow(0 0 15px hsl(45 80% 60% / 0.4))",
              ],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 100 100" fill="none">
              <path
                d="M50 5C28 5 10 23 10 45s18 40 40 40c8 0 15-2 22-6C60 85 50 72 50 55s10-30 22-36C65 13 58 5 50 5z"
                fill="hsl(45, 80%, 60%)"
                opacity="0.8"
              />
            </svg>
          </motion.div>

          {/* Lantern glow — left side */}
          <motion.div
            className="absolute"
            style={{
              top: "15%",
              left: "8%",
              width: "20px",
              height: "30px",
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(180deg, hsl(45 80% 50% / 0.8), hsl(20 80% 45% / 0.6))",
                borderRadius: "30% 30% 50% 50%",
                boxShadow: "0 0 20px hsl(45 80% 55% / 0.3), 0 0 40px hsl(45 80% 55% / 0.15)",
              }}
            />
          </motion.div>

          {/* Lantern glow — right side */}
          <motion.div
            className="absolute"
            style={{
              top: "22%",
              right: "6%",
              width: "16px",
              height: "24px",
            }}
            animate={{
              opacity: [0.25, 0.55, 0.25],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(180deg, hsl(45 80% 55% / 0.7), hsl(20 70% 40% / 0.5))",
                borderRadius: "30% 30% 50% 50%",
                boxShadow: "0 0 16px hsl(45 80% 55% / 0.25)",
              }}
            />
          </motion.div>

          {/* Drifting stars */}
          {stars.map((s) => (
            <motion.div
              key={s.id}
              className="absolute rounded-full"
              style={{
                width: s.size,
                height: s.size,
                left: `${s.x}%`,
                top: `${s.y}%`,
                background: "hsl(45 60% 80%)",
              }}
              animate={{
                opacity: [0, 0.8, 0.3, 0],
                y: [0, -10, 0],
              }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Subtle geometric pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23c4a35a' fill-opacity='1'%3E%3Cpath d='M40 0L48 16H32L40 0zM40 80L32 64H48L40 80zM0 40L16 32V48L0 40zM80 40L64 48V32L80 40z'/%3E%3Ccircle cx='40' cy='40' r='8' fill='none' stroke='%23c4a35a' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "80px 80px",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RamadanOverlay;
