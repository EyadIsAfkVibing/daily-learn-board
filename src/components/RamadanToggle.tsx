import { CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RamadanToggleProps {
    isRamadan: boolean;
    onToggle: () => void;
}

// Inline styles for zero external CSS dependency
const TOGGLE_CSS = `
  @keyframes rtog-shimmer {
    0%,100% { box-shadow: 0 0 8px #f6c86e55, 0 2px 12px #00000033; }
    50%      { box-shadow: 0 0 18px #f6c86eaa, 0 0 32px #f6c86e44, 0 2px 12px #00000033; }
  }
  @keyframes rtog-moon-spin {
    0%   { transform: rotate(-20deg) scale(0.7); opacity: 0; }
    100% { transform: rotate(0deg)   scale(1);   opacity: 1; }
  }
  .rtog-active { animation: rtog-shimmer 3s ease-in-out infinite; }
`;

const RamadanToggle = ({ isRamadan, onToggle }: RamadanToggleProps) => {
    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: TOGGLE_CSS }} />
            <button
                onClick={onToggle}
                className={isRamadan ? "rtog-active" : ""}
                title={isRamadan ? "Disable Ramadan Mode" : "Enable Ramadan Mode"}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px 6px 10px",
                    borderRadius: 999,
                    border: `1.5px solid ${isRamadan ? "#f6c86e88" : "#ffffff22"}`,
                    background: isRamadan
                        ? "linear-gradient(135deg, #1a1060cc, #0d0d3acc)"
                        : "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(8px)",
                    cursor: "pointer",
                    outline: "none",
                    transition: "border-color 0.4s, background 0.4s",
                    willChange: "transform",
                    userSelect: "none",
                } as CSSProperties}
            >
                {/* Animated indicator dot */}
                <span style={{ position: "relative", width: 10, height: 10 }}>
                    <motion.span
                        animate={{
                            backgroundColor: isRamadan ? "#f6c86e" : "#666",
                            boxShadow: isRamadan
                                ? "0 0 6px #f6c86e, 0 0 12px #f6c86e77"
                                : "none",
                        }}
                        transition={{ duration: 0.5 }}
                        style={{
                            display: "block",
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                        } as CSSProperties}
                    />
                </span>

                {/* Moon / circle icon */}
                <AnimatePresence mode="wait">
                    {isRamadan ? (
                        <motion.svg
                            key="moon"
                            viewBox="0 0 20 20"
                            width={16}
                            height={16}
                            initial={{ rotate: -30, opacity: 0, scale: 0.6 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: 30, opacity: 0, scale: 0.6 }}
                            transition={{ duration: 0.35, ease: "backOut" }}
                            style={{ flexShrink: 0 } as CSSProperties}
                        >
                            <defs>
                                <mask id="rtog-cMask">
                                    <circle cx="10" cy="10" r="9" fill="white" />
                                    <circle cx="14.5" cy="7.5" r="7" fill="black" />
                                </mask>
                            </defs>
                            <circle cx="10" cy="10" r="9" fill="#f6c86e" mask="url(#rtog-cMask)" />
                            <polygon
                                points="5.5,9 6.3,11.4 8.8,11.4 6.8,12.8 7.6,15.2 5.5,13.8 3.4,15.2 4.2,12.8 2.2,11.4 4.7,11.4"
                                fill="#fffbe8"
                                opacity="0.9"
                                transform="scale(0.75) translate(1,1)"
                            />
                        </motion.svg>
                    ) : (
                        <motion.svg
                            key="circle"
                            viewBox="0 0 20 20"
                            width={16}
                            height={16}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{ duration: 0.3 }}
                            style={{ flexShrink: 0 } as CSSProperties}
                        >
                            <circle cx="10" cy="10" r="8" fill="none" stroke="#888" strokeWidth="1.5" />
                        </motion.svg>
                    )}
                </AnimatePresence>

                {/* Label */}
                <motion.span
                    animate={{ color: isRamadan ? "#f6c86e" : "#aaa" }}
                    transition={{ duration: 0.4 }}
                    style={{
                        fontSize: 13,
                        fontWeight: 500,
                        letterSpacing: ".02em",
                        whiteSpace: "nowrap",
                    } as CSSProperties}
                >
                    Ramadan Mode
                </motion.span>
            </button>
        </>
    );
};

export default RamadanToggle;