import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const PremiumBackground = () => {
  const [particles, setParticles] = useState<Array<{ id: number; size: number; left: string; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Generate random particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 100 + 50,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <>
      {/* Aurora Background */}
      <div className="aurora" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Large Purple Orb */}
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          initial={{ top: "10%", left: "20%" }}
        />

        {/* Large Blue Orb */}
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          initial={{ bottom: "20%", right: "20%" }}
        />

        {/* Teal Orb */}
        <motion.div
          className="absolute w-80 h-80 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          initial={{ top: "50%", left: "50%" }}
        />

        {/* Pink Orb */}
        <motion.div
          className="absolute w-72 h-72 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
          animate={{
            x: [0, -50, 0],
            y: [0, 60, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          initial={{ bottom: "10%", left: "60%" }}
        />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: particle.left,
              background: `radial-gradient(circle, rgba(139, 92, 246, ${Math.random() * 0.3 + 0.1}) 0%, transparent 70%)`,
              filter: "blur(20px)",
            }}
            animate={{
              y: ["-100vh", "100vh"],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "linear",
            }}
            initial={{ top: "-10%" }}
          />
        ))}
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Vignette Effect */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: "radial-gradient(circle at center, transparent 0%, rgba(15, 23, 42, 0.5) 100%)",
        }}
      />

      {/* Scanline Effect (subtle) */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.01) 2px, rgba(255, 255, 255, 0.01) 4px)",
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </>
  );
};

export default PremiumBackground;