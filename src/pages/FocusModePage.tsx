import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const FocusMode = () => {
    const [isActive, setIsActive] = useState(false);
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState<"focus" | "break">("focus");
    const [focusSessions, setFocusSessions] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && isActive) {
            interval = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        // Timer finished
                        handleTimerComplete();
                    } else {
                        setMinutes(minutes - 1);
                        setSeconds(59);
                    }
                } else {
                    setSeconds(seconds - 1);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isRunning, minutes, seconds, isActive]);

    const handleTimerComplete = () => {
        setIsRunning(false);

        if (mode === "focus") {
            setFocusSessions(focusSessions + 1);
            toast.success("Focus session complete! Take a break! 🎉");
            setMode("break");
            setMinutes(5);
            setSeconds(0);
        } else {
            toast.success("Break over! Ready for another focus session? 💪");
            setMode("focus");
            setMinutes(25);
            setSeconds(0);
        }
    };

    const startFocusMode = () => {
        setIsActive(true);
        setIsRunning(true);
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
    };

    const exitFocusMode = () => {
        setIsActive(false);
        setIsRunning(false);
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    };

    const resetTimer = () => {
        setIsRunning(false);
        if (mode === "focus") {
            setMinutes(25);
        } else {
            setMinutes(5);
        }
        setSeconds(0);
    };

    if (!isActive) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Focus Mode
                    </h2>
                    <p className="text-muted-foreground">
                        Eliminate distractions and maximize productivity
                    </p>
                </div>

                <Card className="glass p-8 text-center">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-8xl mb-6"
                    >
                        <svg className="w-32 h-32 mx-auto text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </motion.div>

                    <h3 className="text-2xl font-bold text-primary mb-4">
                        Ready to Focus?
                    </h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Focus Mode will hide all distractions, go fullscreen, and help you concentrate on your studies.
                    </p>

                    <Button
                        onClick={startFocusMode}
                        size="lg"
                        className="bg-accent text-accent-foreground px-8 py-6 text-lg"
                    >
                        Start Focus Session (25 min)
                    </Button>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto">
                        <Card className="glass-strong p-4">
                            <div className="text-3xl font-bold text-accent mb-1">{focusSessions}</div>
                            <div className="text-xs text-muted-foreground font-semibold">
                                Sessions Today
                            </div>
                        </Card>
                        <Card className="glass-strong p-4">
                            <div className="text-3xl font-bold text-primary mb-1">
                                {focusSessions * 25}
                            </div>
                            <div className="text-xs text-muted-foreground font-semibold">
                                Minutes Focused
                            </div>
                        </Card>
                    </div>
                </Card>

                {/* Tips */}
                <Card className="glass p-6">
                    <h3 className="text-lg font-bold text-primary mb-4">💡 Focus Tips</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-accent">•</span>
                            <span>Turn off notifications on your devices</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-accent">•</span>
                            <span>Have water and snacks nearby</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-accent">•</span>
                            <span>Set clear goals for each session</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-accent">•</span>
                            <span>Use breaks to stretch and rest your eyes</span>
                        </li>
                    </ul>
                </Card>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black z-50 flex items-center justify-center"
        >
            {/* Exit Button */}
            <Button
                onClick={exitFocusMode}
                variant="ghost"
                className="absolute top-4 right-4 text-white hover:bg-white/10"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </Button>

            {/* Timer Display */}
            <div className="text-center">
                <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="text-white/60 text-2xl font-semibold mb-4">
                        {mode === "focus" ? "🎯 Focus Time" : "☕ Break Time"}
                    </div>

                    <div className="text-white text-9xl font-bold mb-8 font-mono">
                        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </div>

                    <div className="flex gap-4 justify-center mb-8">
                        {!isRunning ? (
                            <Button
                                onClick={() => setIsRunning(true)}
                                size="lg"
                                className="bg-green-500 hover:bg-green-600 text-white px-8"
                            >
                                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                                Start
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setIsRunning(false)}
                                size="lg"
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-8"
                            >
                                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                </svg>
                                Pause
                            </Button>
                        )}

                        <Button
                            onClick={resetTimer}
                            size="lg"
                            variant="outline"
                            className="bg-white/10 text-white border-white/20 hover:bg-white/20 px-8"
                        >
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reset
                        </Button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-96 mx-auto">
                        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                            <motion.div
                                className="bg-accent h-full rounded-full"
                                style={{
                                    width: `${((mode === "focus" ? 25 : 5) * 60 - (minutes * 60 + seconds)) / ((mode === "focus" ? 25 : 5) * 60) * 100}%`
                                }}
                            />
                        </div>
                    </div>

                    {/* Session Counter */}
                    <div className="mt-8 text-white/60 text-lg">
                        Sessions Completed: {focusSessions}
                    </div>
                </motion.div>
            </div>

            {/* Ambient Animation */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                    background: [
                        "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
                        "radial-gradient(circle at 50% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)",
                    ]
                }}
                transition={{ duration: 10, repeat: Infinity }}
            />
        </motion.div>
    );
};

export default FocusMode;