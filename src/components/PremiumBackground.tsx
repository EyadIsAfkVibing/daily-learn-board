import { motion } from "framer-motion";
import FloatingParticles from "./FloatingParticles";
import { useEffect, useState } from "react";

const PremiumBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <>
      {/* Animated mesh gradient base */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 30%, hsl(260 60% 18% / 0.7) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 80% 70%, hsl(220 50% 12% / 0.6) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 60% 20%, hsl(185 40% 15% / 0.4) 0%, transparent 50%),
            hsl(var(--background))
          `,
        }}
      />

      {/* Slow drifting orb 1 */}
      <motion.div
        className="fixed pointer-events-none z-0"
        style={{
          width: "700px",
          height: "700px",
          top: "0%",
          left: "5%",
          background: "radial-gradient(circle, hsl(260 70% 50% / 0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Slow drifting orb 2 */}
      <motion.div
        className="fixed pointer-events-none z-0"
        style={{
          width: "600px",
          height: "600px",
          bottom: "5%",
          right: "10%",
          background: "radial-gradient(circle, hsl(185 60% 45% / 0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          x: [0, -30, 15, 0],
          y: [0, 20, -25, 0],
          scale: [1, 1.08, 0.96, 1],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Slow drifting orb 3 - midnight blue */}
      <motion.div
        className="fixed pointer-events-none z-0"
        style={{
          width: "500px",
          height: "500px",
          top: "40%",
          left: "50%",
          background: "radial-gradient(circle, hsl(230 50% 25% / 0.06) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
        animate={{
          x: [0, 25, -35, 0],
          y: [0, -15, 30, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Cursor glow spotlight */}
      <div
        className="fixed pointer-events-none z-[2] transition-all duration-700 ease-out"
        style={{
          width: "500px",
          height: "500px",
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, hsl(var(--glow-primary) / 0.04) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
      />

      {/* Geometric grid pattern — very subtle */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--glow-primary) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--glow-primary) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-[3]"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, hsl(var(--background) / 0.7) 100%)",
        }}
      />
    </>
  );
};

export default PremiumBackground;
