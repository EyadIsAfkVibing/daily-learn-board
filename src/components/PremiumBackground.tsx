import { motion } from "framer-motion";
import FloatingParticles from "./FloatingParticles";

const PremiumBackground = () => {
  return (
    <>
      {/* Layer 1 — Base mesh gradient */}
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

      {/* Layer 2 — Drifting orbs (GPU-accelerated) */}
      <motion.div
        className="fixed pointer-events-none z-0 will-change-transform"
        style={{
          width: "700px",
          height: "700px",
          top: "-5%",
          left: "0%",
          background: "radial-gradient(circle, hsl(260 70% 50% / 0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.12, 0.93, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="fixed pointer-events-none z-0 will-change-transform"
        style={{
          width: "600px",
          height: "600px",
          bottom: "0%",
          right: "5%",
          background: "radial-gradient(circle, hsl(185 60% 45% / 0.07) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{ x: [0, -40, 25, 0], y: [0, 30, -35, 0], scale: [1, 1.1, 0.94, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="fixed pointer-events-none z-0 will-change-transform"
        style={{
          width: "500px",
          height: "500px",
          top: "35%",
          left: "45%",
          background: "radial-gradient(circle, hsl(230 50% 25% / 0.06) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
        animate={{ x: [0, 35, -40, 0], y: [0, -20, 35, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 3 — Warm accent orb */}
      <motion.div
        className="fixed pointer-events-none z-0 will-change-transform"
        style={{
          width: "400px",
          height: "400px",
          top: "60%",
          left: "15%",
          background: "radial-gradient(circle, hsl(var(--glow-warm) / 0.04) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
        animate={{ x: [0, 20, -15, 0], y: [0, -25, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 4 — Subtle drifting geometric shapes */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-[0.015]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.circle
          cx="15%"
          cy="25%"
          r="60"
          fill="none"
          stroke="hsl(var(--glow-primary))"
          strokeWidth="0.5"
          animate={{ cy: ["25%", "22%", "28%", "25%"], cx: ["15%", "17%", "13%", "15%"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.rect
          x="75%"
          y="60%"
          width="80"
          height="80"
          rx="8"
          fill="none"
          stroke="hsl(var(--glow-accent))"
          strokeWidth="0.4"
          style={{ transformOrigin: "center" }}
          animate={{ rotate: [0, 45, 0], y: ["60%", "57%", "63%", "60%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.polygon
          points="50,10 90,90 10,90"
          fill="none"
          stroke="hsl(var(--glow-primary))"
          strokeWidth="0.3"
          style={{ transformOrigin: "50px 63px" }}
          animate={{ rotate: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Layer 5 — Grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--glow-primary) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--glow-primary) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Layer 6 — Noise texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
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
