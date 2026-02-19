import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface RamadanOverlayProps {
  active: boolean;
}

const RamadanOverlay = ({ active }: RamadanOverlayProps) => {
  const stars = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 60,
        size: 1 + Math.random() * 2.5,
        duration: 3 + Math.random() * 5,
        delay: Math.random() * 5,
      })),
    []
  );

  const lanterns = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: 8 + i * 16 + (Math.random() - 0.5) * 8,
        y: 5 + Math.random() * 15,
        size: 14 + Math.random() * 10,
        swayDuration: 4 + Math.random() * 3,
        glowDuration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
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
          transition={{ duration: 1.5 }}
        >
          {/* Deep night sky gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 50% 0%, hsl(250 40% 18% / 0.3) 0%, transparent 60%),
                radial-gradient(ellipse 60% 40% at 75% 15%, hsl(45 70% 50% / 0.05) 0%, transparent 50%),
                radial-gradient(ellipse 50% 40% at 25% 80%, hsl(155 55% 45% / 0.04) 0%, transparent 50%)
              `,
            }}
          />

          {/* Light beams behind hero */}
          <motion.div
            className="absolute"
            style={{
              top: "0%",
              left: "30%",
              width: "40%",
              height: "60%",
              background:
                "conic-gradient(from 180deg at 50% 0%, transparent 40%, hsl(45 60% 50% / 0.03) 48%, transparent 52%, hsl(45 60% 50% / 0.02) 56%, transparent 60%)",
            }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Crescent moon — large with layered glow */}
          <motion.div
            className="absolute"
            style={{ top: "5%", right: "10%", width: "80px", height: "80px" }}
            animate={{
              opacity: [0.7, 1, 0.7],
              filter: [
                "drop-shadow(0 0 20px hsl(45 80% 60% / 0.5)) drop-shadow(0 0 60px hsl(45 80% 60% / 0.2))",
                "drop-shadow(0 0 30px hsl(45 80% 60% / 0.7)) drop-shadow(0 0 80px hsl(45 80% 60% / 0.3))",
                "drop-shadow(0 0 20px hsl(45 80% 60% / 0.5)) drop-shadow(0 0 60px hsl(45 80% 60% / 0.2))",
              ],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 100 100" fill="none">
              <path
                d="M50 5C28 5 10 23 10 45s18 40 40 40c8 0 15-2 22-6C60 85 50 72 50 55s10-30 22-36C65 13 58 5 50 5z"
                fill="hsl(45, 80%, 65%)"
                opacity="0.9"
              />
            </svg>
          </motion.div>

          {/* Floating lantern silhouettes with sway */}
          {lanterns.map((l) => (
            <motion.div
              key={`lantern-${l.id}`}
              className="absolute"
              style={{
                left: `${l.x}%`,
                top: `${l.y}%`,
                width: `${l.size}px`,
                height: `${l.size * 1.5}px`,
              }}
              animate={{
                x: [-3, 3, -3],
                y: [-2, 2, -2],
                rotate: [-2, 2, -2],
              }}
              transition={{
                duration: l.swayDuration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: l.delay,
              }}
            >
              {/* Lantern body */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(180deg, hsl(45 75% 55% / 0.7), hsl(25 80% 45% / 0.5))`,
                  borderRadius: "25% 25% 40% 40%",
                  position: "relative",
                }}
              >
                {/* Inner glow */}
                <motion.div
                  style={{
                    position: "absolute",
                    inset: "20%",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, hsl(45 90% 70% / 0.8) 0%, transparent 70%)",
                  }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: l.glowDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: l.delay + 0.5,
                  }}
                />
              </div>
              {/* Hanging string */}
              <div
                style={{
                  width: "1px",
                  height: `${l.size * 0.6}px`,
                  background: "hsl(45 50% 50% / 0.3)",
                  margin: "0 auto",
                  position: "absolute",
                  top: `-${l.size * 0.6}px`,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
              {/* Light pool beneath */}
              <div
                style={{
                  position: "absolute",
                  bottom: `-${l.size}px`,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: `${l.size * 3}px`,
                  height: `${l.size * 2}px`,
                  background: "radial-gradient(ellipse, hsl(45 70% 55% / 0.06) 0%, transparent 70%)",
                }}
              />
            </motion.div>
          ))}

          {/* Arch shapes framing top */}
          <svg
            className="absolute top-0 left-0 w-full opacity-[0.04]"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{ height: "120px" }}
          >
            <path d="M0,120 Q150,10 300,120 Q450,10 600,120 Q750,10 900,120 Q1050,10 1200,120" fill="none" stroke="hsl(45,70%,55%)" strokeWidth="1" />
            <path d="M0,120 Q150,30 300,120 Q450,30 600,120 Q750,30 900,120 Q1050,30 1200,120" fill="none" stroke="hsl(45,60%,50%)" strokeWidth="0.5" />
          </svg>

          {/* Twinkling star field */}
          {stars.map((s) => (
            <motion.div
              key={s.id}
              className="absolute rounded-full"
              style={{
                width: s.size,
                height: s.size,
                left: `${s.x}%`,
                top: `${s.y}%`,
                background: "hsl(45 60% 85%)",
                boxShadow: `0 0 ${s.size * 2}px hsl(45 60% 80% / 0.4)`,
              }}
              animate={{
                opacity: [0, 0.9, 0.3, 0.8, 0],
                scale: [0.8, 1.2, 0.9, 1.1, 0.8],
              }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Islamic geometric pattern — animated rotation */}
          <motion.div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23c4a35a' fill-opacity='1'%3E%3Cpath d='M40 0L48 16H32L40 0zM40 80L32 64H48L40 80zM0 40L16 32V48L0 40zM80 40L64 48V32L80 40z'/%3E%3Ccircle cx='40' cy='40' r='8' fill='none' stroke='%23c4a35a' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "80px 80px",
            }}
            animate={{ backgroundPosition: ["0px 0px", "80px 80px"] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />

          {/* Second geometric layer — offset */}
          <motion.div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%23c4a35a' stroke-width='0.3'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3Ccircle cx='30' cy='30' r='12'/%3E%3Cpath d='M30 10L30 50M10 30L50 30M16 16L44 44M44 16L16 44'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
            animate={{ backgroundPosition: ["0px 0px", "-60px -60px"] }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RamadanOverlay;
