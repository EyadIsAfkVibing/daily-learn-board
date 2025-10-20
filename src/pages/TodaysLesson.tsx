// This replaces your existing TodaysLesson.tsx
// Key Changes: Click on lesson card opens Focus Mode with notes on side

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { ENHANCED_SCHEDULE, STORAGE_KEY, NOTES_STORAGE_KEY, getLessonDisplayName } from "@/lib/schedule";

const TodaysLesson = () => {
    const navigate = useNavigate();
    const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
    const [progress, setProgress] = useState<{ [key: string]: boolean }>({});
    const [notes, setNotes] = useState<{ [key: string]: string }>({});
    const [todaySchedule, setTodaySchedule] = useState<any>(null);
    const [dayIndex, setDayIndex] = useState<number>(-1);

    // Focus Mode States
    const [focusMode, setFocusMode] = useState(false);
    const [focusLesson, setFocusLesson] = useState<any>(null);
    const [focusLessonIndex, setFocusLessonIndex] = useState<number>(0);
    const [timerMinutes, setTimerMinutes] = useState(25);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setProgress(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved progress", e);
            }
        }

        const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
        if (savedNotes) {
            try {
                setNotes(JSON.parse(savedNotes));
            } catch (e) {
                console.error("Failed to parse saved notes", e);
            }
        }

        const today = new Date().toISOString().split("T")[0];
        const todayIndex = ENHANCED_SCHEDULE.findIndex((day: any) => day.date === today);

        if (todayIndex >= 0) {
            setTodaySchedule(ENHANCED_SCHEDULE[todayIndex]);
            setDayIndex(todayIndex);
        } else {
            navigate("/dashboard");
        }
    }, [navigate]);

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isTimerRunning && focusMode) {
            interval = setInterval(() => {
                if (timerSeconds === 0) {
                    if (timerMinutes === 0) {
                        setIsTimerRunning(false);
                        toast.success("Focus session complete! 🎉");
                        confetti({ particleCount: 100, spread: 70 });
                        setTimerMinutes(25);
                    } else {
                        setTimerMinutes(timerMinutes - 1);
                        setTimerSeconds(59);
                    }
                } else {
                    setTimerSeconds(timerSeconds - 1);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isTimerRunning, timerMinutes, timerSeconds, focusMode]);

    const handleOpenFocusMode = (subject: any, index: number) => {
        if (progress[`${dayIndex}-${index}`]) {
            toast.info("This lesson is already completed!");
            return;
        }
        setFocusLesson(subject);
        setFocusLessonIndex(index);
        setFocusMode(true);
        setTimerMinutes(25);
        setTimerSeconds(0);
        setIsTimerRunning(true);
    };

    const handleMarkComplete = () => {
        if (!todaySchedule || dayIndex < 0) return;

        const key = `${dayIndex}-${focusLessonIndex}`;
        const newProgress = { ...progress, [key]: true };
        setProgress(newProgress);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));

        const newCompleted = new Set(completedLessons);
        newCompleted.add(focusLessonIndex);
        setCompletedLessons(newCompleted);

        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
        });

        toast.success("Lesson completed! Great job! 🎉");
        setFocusMode(false);

        if (newCompleted.size === todaySchedule.subjects.length) {
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        }
    };

    const handleNoteChange = (value: string) => {
        if (!todaySchedule || dayIndex < 0) return;

        const key = `${dayIndex}-${focusLessonIndex}`;
        const newNotes = { ...notes, [key]: value };
        setNotes(newNotes);
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(newNotes));
    };

    if (!todaySchedule) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <h2 className="text-2xl font-bold text-primary mb-4">No Lesson Today! 🎉</h2>
                    <p className="text-muted-foreground mb-6">Enjoy your day off!</p>
                    <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
                </motion.div>
            </div>
        );
    }

    const allComplete = completedLessons.size === todaySchedule.subjects.length;

    // Focus Mode View
    if (focusMode && focusLesson) {
        const noteKey = `${dayIndex}-${focusLessonIndex}`;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black z-50"
            >
                <div className="h-full flex">
                    {/* Main Focus Area */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        {/* Exit Button */}
                        <Button
                            onClick={() => setFocusMode(false)}
                            variant="ghost"
                            className="absolute top-4 left-4 text-white hover:bg-white/10"
                        >
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </Button>

                        {/* Lesson Info */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center mb-8"
                        >
                            <h1 className="text-5xl font-bold text-white mb-4 neon-text">
                                {getLessonDisplayName(focusLesson)}
                            </h1>
                            <p className="text-white/60 text-xl">Focus Mode Active 🎯</p>
                        </motion.div>

                        {/* Timer */}
                        <motion.div
                            className="mb-8"
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <div className="text-white text-8xl font-bold font-mono mb-4">
                                {String(timerMinutes).padStart(2, "0")}:{String(timerSeconds).padStart(2, "0")}
                            </div>
                            <div className="flex gap-4 justify-center">
                                {!isTimerRunning ? (
                                    <Button
                                        onClick={() => setIsTimerRunning(true)}
                                        size="lg"
                                        className="bg-green-500 hover:bg-green-600 text-white px-8"
                                    >
                                        ▶️ Start
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => setIsTimerRunning(false)}
                                        size="lg"
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-8"
                                    >
                                        ⏸️ Pause
                                    </Button>
                                )}
                                <Button
                                    onClick={() => {
                                        setIsTimerRunning(false);
                                        setTimerMinutes(25);
                                        setTimerSeconds(0);
                                    }}
                                    size="lg"
                                    variant="outline"
                                    className="bg-white/10 text-white border-white/20 hover:bg-white/20 px-8"
                                >
                                    🔄 Reset
                                </Button>
                            </div>
                        </motion.div>

                        {/* Complete Button */}
                        <Button
                            onClick={handleMarkComplete}
                            size="lg"
                            className="premium-button text-lg px-12 py-6"
                        >
                            ✓ Mark as Complete
                        </Button>
                    </div>

                    {/* Notes Sidebar */}
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="w-96 bg-black/40 backdrop-blur-xl border-l border-white/10 p-6 overflow-y-auto"
                    >
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Lesson Notes
                        </h3>
                        <Textarea
                            value={notes[noteKey] || ""}
                            onChange={(e) => handleNoteChange(e.target.value)}
                            placeholder="Write your notes here..."
                            className="min-h-[400px] bg-white/5 text-white border-white/20 resize-none"
                        />
                        <p className="text-white/40 text-sm mt-4">
                            💡 Tip: Write key concepts, formulas, or important points you learn
                        </p>
                    </motion.div>
                </div>

                {/* Ambient Animation */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                        background: [
                            "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)",
                            "radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)",
                            "radial-gradient(circle at 50% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)",
                        ]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
            </motion.div>
        );
    }

    // Regular Today's Lesson View
    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-6xl mx-auto">
                <AnimatePresence mode="wait">
                    {allComplete ? (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="min-h-screen flex items-center justify-center"
                        >
                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                    className="text-8xl mb-6"
                                >
                                    🎉
                                </motion.div>
                                <h2 className="text-4xl font-bold text-primary mb-4">All Done!</h2>
                                <p className="text-muted-foreground text-lg mb-8">
                                    Great job completing today's lessons!
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="lessons"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mb-8"
                            >
                                <h1 className="text-5xl font-bold text-primary mb-3 neon-text">
                                    Today's Lessons
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    {new Date().toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric"
                                    })}
                                </p>
                                <motion.div
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 glass rounded-full glow"
                                    animate={{
                                        boxShadow: [
                                            "0 0 20px rgba(139, 92, 246, 0.4)",
                                            "0 0 40px rgba(139, 92, 246, 0.8)",
                                            "0 0 20px rgba(139, 92, 246, 0.4)",
                                        ]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <span className="text-sm font-semibold text-accent">
                                        {completedLessons.size} / {todaySchedule.subjects.length} Complete
                                    </span>
                                </motion.div>
                            </motion.div>

                            {/* Lesson Cards */}
                            <div className="grid gap-6 lg:grid-cols-2">
                                {todaySchedule.subjects.map((subject: any, index: number) => {
                                    const isCompleted = completedLessons.has(index) || progress[`${dayIndex}-${index}`];

                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.15, type: "spring" }}
                                            whileHover={{ scale: isCompleted ? 1 : 1.03, y: isCompleted ? 0 : -5 }}
                                            whileTap={{ scale: isCompleted ? 1 : 0.98 }}
                                        >
                                            <Card
                                                className={`premium-card luxury-shadow cursor-pointer transition-all ${isCompleted ? "opacity-60" : "glow"
                                                    }`}
                                                onClick={() => !isCompleted && handleOpenFocusMode(subject, index)}
                                            >
                                                <div className="p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-primary mb-1">
                                                                {subject.name}
                                                            </h3>
                                                            <p className="text-muted-foreground font-medium">
                                                                {subject.topic}
                                                            </p>
                                                        </div>

                                                        {isCompleted ? (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center"
                                                            >
                                                                <svg className="w-7 h-7 text-success" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                animate={{ rotate: [0, 10, -10, 0] }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                                className="text-4xl"
                                                            >
                                                                🎯
                                                            </motion.div>
                                                        )}
                                                    </div>

                                                    {!isCompleted && (
                                                        <Button className="w-full premium-button mt-4">
                                                            Start Focus Mode →
                                                        </Button>
                                                    )}
                                                </div>
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Skip Button */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="text-center mt-8"
                            >
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate("/dashboard")}
                                    className="text-muted-foreground hover:text-primary"
                                >
                                    Skip to Dashboard →
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TodaysLesson;