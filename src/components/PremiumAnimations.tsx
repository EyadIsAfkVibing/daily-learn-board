import { motion } from "framer-motion";
import { ReactNode } from "react";

// Fade In Up Animation
export const FadeInUp = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
        {children}
    </motion.div>
);

// Scale In Animation
export const ScaleIn = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay, type: "spring", stiffness: 200 }}
    >
        {children}
    </motion.div>
);

// Slide In From Left
export const SlideInLeft = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
        {children}
    </motion.div>
);

// Slide In From Right
export const SlideInRight = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
        {children}
    </motion.div>
);

// Rotate In Animation
export const RotateIn = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, rotate: -180, scale: 0 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.8, delay, type: "spring" }}
    >
        {children}
    </motion.div>
);

// Float Animation (Continuous)
export const Float = ({ children }: { children: ReactNode }) => (
    <motion.div
        animate={{
            y: [0, -10, 0],
        }}
        transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
        }}
    >
        {children}
    </motion.div>
);

// Pulse Glow Animation (Continuous)
export const PulseGlow = ({ children }: { children: ReactNode }) => (
    <motion.div
        animate={{
            boxShadow: [
                "0 0 20px rgba(139, 92, 246, 0.4)",
                "0 0 40px rgba(139, 92, 246, 0.8)",
                "0 0 20px rgba(139, 92, 246, 0.4)",
            ],
        }}
        transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
        }}
        className="rounded-xl"
    >
        {children}
    </motion.div>
);

// Shimmer Effect
export const Shimmer = ({ children }: { children: ReactNode }) => (
    <motion.div className="relative overflow-hidden">
        {children}
        <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            }}
            animate={{
                x: ["-100%", "200%"],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
            }}
        />
    </motion.div>
);

// Hover Lift Effect
export const HoverLift = ({ children }: { children: ReactNode }) => (
    <motion.div
        whileHover={{
            y: -8,
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)",
        }}
        transition={{ duration: 0.3 }}
    >
        {children}
    </motion.div>
);

// Stagger Children Animation
export const StaggerChildren = ({ children, stagger = 0.1 }: { children: ReactNode; stagger?: number }) => (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={{
            visible: {
                transition: {
                    staggerChildren: stagger,
                },
            },
        }}
    >
        {children}
    </motion.div>
);

// Stagger Item (use inside StaggerChildren)
export const StaggerItem = ({ children }: { children: ReactNode }) => (
    <motion.div
        variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
        }}
    >
        {children}
    </motion.div>
);

// Bounce In
export const BounceIn = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
            duration: 0.6,
            delay,
            type: "spring",
            stiffness: 400,
            damping: 10,
        }}
    >
        {children}
    </motion.div>
);

// Flip In
export const FlipIn = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, rotateY: -90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.6, delay }}
        style={{ transformStyle: "preserve-3d" }}
    >
        {children}
    </motion.div>
);

// Gradient Border Animation
export const AnimatedGradientBorder = ({ children }: { children: ReactNode }) => (
    <motion.div className="relative p-[2px] rounded-xl overflow-hidden">
        <motion.div
            className="absolute inset-0"
            style={{
                background: "linear-gradient(90deg, #667eea, #764ba2, #f093fb, #4facfe, #667eea)",
                backgroundSize: "200% 100%",
            }}
            animate={{
                backgroundPosition: ["0% 50%", "200% 50%"],
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
            }}
        />
        <div className="relative bg-background rounded-xl">
            {children}
        </div>
    </motion.div>
);

// Neon Pulse Text
export const NeonPulseText = ({ children }: { children: ReactNode }) => (
    <motion.div
        animate={{
            textShadow: [
                "0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.6)",
                "0 0 15px rgba(139, 92, 246, 1), 0 0 30px rgba(139, 92, 246, 0.8)",
                "0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.6)",
            ],
        }}
        transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
        }}
    >
        {children}
    </motion.div>
);

// Particle Explosion (for celebration)
export const ParticleExplosion = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        background: `hsl(${i * 18}, 100%, 50%)`,
                        left: "50%",
                        top: "50%",
                    }}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                        scale: [0, 1, 0],
                        x: Math.cos((i * Math.PI * 2) / 20) * 200,
                        y: Math.sin((i * Math.PI * 2) / 20) * 200,
                        opacity: [1, 1, 0],
                    }}
                    transition={{
                        duration: 1.5,
                        ease: "easeOut",
                    }}
                />
            ))}
        </div>
    );
};