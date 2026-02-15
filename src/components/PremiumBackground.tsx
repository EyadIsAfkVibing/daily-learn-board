import { motion } from "framer-motion";

const PremiumBackground = () => {
  return (
    <>
      {/* Warm Aurora */}
      <div className="aurora" />

      {/* Castle Silhouette Overlay — very subtle */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 400'%3E%3Cpath d='M0 400V320h40v-40h20v40h60v-60h20v-30h10v30h20v60h80v-80h15v-20h10v20h15v80h100v-50h20v50h60v-100h10v-20h20v20h10v100h80v-40h30v40h60v-70h15v-25h10v25h15v70h100v-90h20v-30h10v30h20v90h80v-50h30v50h60v-60h20v60h100V400z' fill='%23000' opacity='0.06'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-x",
          backgroundPosition: "bottom center",
          backgroundSize: "1440px 400px",
        }}
      />

      {/* Compass / Map-like Pattern — very faint */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, transparent 60%, hsl(38 30% 25% / 0.04) 61%, transparent 62%),
            radial-gradient(circle at 50% 50%, transparent 38%, hsl(38 30% 25% / 0.03) 39%, transparent 40%)
          `,
          backgroundSize: "300px 300px",
          backgroundPosition: "center center",
        }}
      />

      {/* Subtle grain texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Warm ambient glow — top left */}
      <motion.div
        className="fixed pointer-events-none z-0"
        style={{
          width: "600px",
          height: "600px",
          top: "5%",
          left: "10%",
          background: "radial-gradient(circle, hsl(38 70% 50% / 0.04) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Warm ambient glow — bottom right */}
      <motion.div
        className="fixed pointer-events-none z-0"
        style={{
          width: "500px",
          height: "500px",
          bottom: "10%",
          right: "15%",
          background: "radial-gradient(circle, hsl(30 50% 35% / 0.05) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, hsl(30 18% 5% / 0.6) 100%)",
        }}
      />
    </>
  );
};

export default PremiumBackground;
