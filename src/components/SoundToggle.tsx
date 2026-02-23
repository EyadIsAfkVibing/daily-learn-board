/**
 * SoundToggle.tsx
 * Minimal, elegant mute/unmute button.
 * Animated waveform bars when unmuted. Flat line when muted.
 */

import { useState, CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SoundToggleProps {
    onToggle: () => boolean;   // returns new muted state
    isRamadan?: boolean;
}

const SoundToggle = ({ onToggle, isRamadan = false }: SoundToggleProps) => {
    const [muted, setMuted] = useState(false);

    const handleClick = () => {
        const newMuted = onToggle();
        setMuted(newMuted);
    };

    const barCount = 4;
    const heights = [8, 14, 10, 16];
    const delays = [0, 0.1, 0.05, 0.15];

    const accent = isRamadan ? "hsla(42,80%,65%,0.85)" : "hsla(210,80%,70%,0.85)";

    return (
        <button
            onClick={handleClick}
            title={muted ? "Unmute ambient sound" : "Mute ambient sound"}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2.5,
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: `1px solid ${muted ? "hsla(0,0%,100%,0.1)" : "hsla(0,0%,100%,0.18)"}`,
                background: muted ? "hsla(0,0%,100%,0.04)" : "hsla(0,0%,100%,0.07)",
                backdropFilter: "blur(8px)",
                cursor: "pointer",
                outline: "none",
                transition: "border-color 0.3s, background 0.3s",
                flexShrink: 0,
            } as CSSProperties}
        >
            {barCount > 0 && Array.from({ length: barCount }, (_, i) => (
                <motion.div
                    key={i}
                    style={{
                        width: 2.5,
                        borderRadius: 2,
                        background: accent,
                        transformOrigin: "bottom center",
                    } as CSSProperties}
                    animate={muted
                        ? { height: 2, opacity: 0.3 }
                        : {
                            height: [heights[i] * 0.4, heights[i], heights[i] * 0.55, heights[i]],
                            opacity: 1,
                        }
                    }
                    transition={muted
                        ? { duration: 0.25 }
                        : {
                            duration: 0.9 + i * 0.12,
                            delay: delays[i],
                            repeat: Infinity,
                            ease: "easeInOut",
                        }
                    }
                />
            ))}
        </button>
    );
};

export default SoundToggle;