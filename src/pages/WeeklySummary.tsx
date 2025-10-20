import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ENHANCED_SCHEDULE, STORAGE_KEY, getLessonDisplayName } from "@/lib/schedule";

const WeeklySummary = () => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setProgress(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse progress", e);
            }
        }
    }, []);

    const weeklyStats = useMemo(() => {
        const weeks = [];
        let currentWeek: any[] = [];

        ENHANCED_SCHEDULE.forEach((day, dayIdx) => {
            let dayCompleted = 0;
            let dayTotal = day.subjects.length;

            day.subjects.forEach((_, subIdx) => {
                if (progress[`${dayIdx}-${subIdx}`]) {
                    dayCompleted++;
                }
            });

            currentWeek.push({
                ...day,
                dayIndex: dayIdx,
                completed: dayCompleted,
                total: dayTotal,
                percentage: Math.round((dayCompleted / dayTotal) * 100),
            });

            if (currentWeek.length === 7 || dayIdx === ENHANCED_SCHEDULE.length - 1) {
                const weekCompleted = currentWeek.reduce((sum, d) => sum + d.completed, 0);
                const weekTotal = currentWeek.reduce((sum, d) => sum + d.total, 0);

                weeks.push({
                    weekNumber: weeks.length + 1,
                    days: currentWeek,
                    completed: weekCompleted,
                    total: weekTotal,
                    percentage: Math.round((weekCompleted / weekTotal) * 100),
                });
                currentWeek = [];
            }
        });

        return weeks;
    }, [progress]);

    const [selectedWeek, setSelectedWeek] = useState(0);
    const currentWeekData = weeklyStats[selectedWeek];

    const getWeekEmoji = (percentage: number) => {
        if (percentage === 100) return "🏆";
        if (percentage >= 80) return "🔥";
        if (percentage >= 60) return "💪";
        if (percentage >= 40) return "📚";
        if (percentage >= 20) return "🌱";
        return "😴";
    };

    const getWeekMessage = (percentage: number) => {
        if (percentage === 100) return "PERFECT WEEK!";
        if (percentage >= 80) return "Excellent Progress!";
        if (percentage >= 60) return "Good Work!";
        if (percentage >= 40) return "Keep Going!";
        if (percentage >= 20) return "Let's Pick Up the Pace!";
        return "Time to Start Studying!";
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-primary mb-2">📊 Weekly Summary</h1>
                            <p className="text-muted-foreground">Track your progress week by week</p>
                        </div>
                        <Button onClick={() => navigate("/dashboard")} variant="outline" className="glass">
                            ← Back
                        </Button>
                    </div>
                </motion.div>

                {/* Week Selector */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                    {weeklyStats.map((week, idx) => (
                        <Button
                            key={idx}
                            variant={selectedWeek === idx ? "default" : "outline"}
                            onClick={() => setSelectedWeek(idx)}
                            className={`min-w-[120px] ${selectedWeek === idx ? "bg-accent" : "glass"}`}
                        >
                            <div className="flex flex-col items-center">
                                <span className="font-bold">Week {week.weekNumber}</span>
                                <span className="text-xs">{week.percentage}%</span>
                            </div>
                        </Button>
                    ))}
                </div>

                {currentWeekData && (
                    <>
                        {/* Week Overview */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8"
                        >
                            <Card className="glass p-8 text-center">
                                <motion.div
                                    className="text-8xl mb-4"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    {getWeekEmoji(currentWeekData.percentage)}
                                </motion.div>
                                <h2 className="text-3xl font-bold text-primary mb-2">
                                    {getWeekMessage(currentWeekData.percentage)}
                                </h2>
                                <div className="text-5xl font-bold text-accent mb-4">
                                    {currentWeekData.percentage}%
                                </div>
                                <p className="text-muted-foreground">
                                    {currentWeekData.completed} / {currentWeekData.total} lessons completed
                                </p>

                                {/* Progress Bar */}
                                <div className="w-full max-w-md mx-auto bg-secondary/30 rounded-full h-4 mt-6 overflow-hidden">
                                    <motion.div
                                        className="bg-accent h-full rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${currentWeekData.percentage}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                            </Card>
                        </motion.div>

                        {/* Daily Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                            {currentWeekData.days.map((day, idx) => {
                                const isComplete = day.percentage === 100;
                                const isStarted = day.completed > 0;

                                return (
                                    <motion.div
                                        key={day.dayIndex}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ scale: 1.03, y: -4 }}
                                    >
                                        <Card
                                            className={`p-5 transition-all ${isComplete
                                                    ? "bg-success/10 border-2 border-success"
                                                    : isStarted
                                                        ? "glass border border-accent/50"
                                                        : "glass"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <div className="text-sm font-semibold text-muted-foreground mb-1">
                                                        Day {day.day}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(day.date).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric"
                                                        })}
                                                    </div>
                                                </div>
                                                <div className="text-2xl">
                                                    {isComplete ? "✓" : isStarted ? "📚" : "○"}
                                                </div>
                                            </div>

                                            {/* Progress */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Progress</span>
                                                    <span>{day.completed} / {day.total}</span>
                                                </div>
                                                <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden">
                                                    <motion.div
                                                        className={`h-full rounded-full ${isComplete ? "bg-success" : "bg-accent"
                                                            }`}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${day.percentage}%` }}
                                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Lessons */}
                                            <div className="mt-3 space-y-1">
                                                {day.subjects.map((subject, subIdx) => {
                                                    const isLessonComplete = progress[`${day.dayIndex}-${subIdx}`];
                                                    return (
                                                        <div
                                                            key={subIdx}
                                                            className={`text-xs p-2 rounded ${isLessonComplete
                                                                    ? "bg-success/20 text-success"
                                                                    : "bg-secondary/20 text-muted-foreground"
                                                                }`}
                                                        >
                                                            {isLessonComplete ? "✓" : "○"} {subject.name}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Week Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="glass p-6 text-center">
                                    <div className="text-4xl font-bold text-accent mb-2">
                                        {currentWeekData.days.filter(d => d.percentage === 100).length}
                                    </div>
                                    <div className="text-sm text-muted-foreground font-semibold">
                                        Perfect Days
                                    </div>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="glass p-6 text-center">
                                    <div className="text-4xl font-bold text-primary mb-2">
                                        {currentWeekData.days.filter(d => d.completed > 0).length}
                                    </div>
                                    <div className="text-sm text-muted-foreground font-semibold">
                                        Active Days
                                    </div>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Card className="glass p-6 text-center">
                                    <div className="text-4xl font-bold text-success mb-2">
                                        {currentWeekData.completed}
                                    </div>
                                    <div className="text-sm text-muted-foreground font-semibold">
                                        Lessons Completed
                                    </div>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Insights */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8"
                        >
                            <Card className="glass p-6">
                                <h3 className="text-xl font-bold text-primary mb-4">📈 Week Insights</h3>
                                <div className="space-y-3">
                                    {currentWeekData.percentage === 100 && (
                                        <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">🏆</span>
                                                <span className="font-semibold text-success">Perfect Week!</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Amazing! You completed every single lesson this week. Keep up the incredible work!
                                            </p>
                                        </div>
                                    )}

                                    {currentWeekData.percentage >= 80 && currentWeekData.percentage < 100 && (
                                        <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">🔥</span>
                                                <span className="font-semibold text-accent">Excellent Progress!</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                You're doing great! Just a few more lessons to hit 100% for the week.
                                            </p>
                                        </div>
                                    )}

                                    {currentWeekData.percentage < 50 && (
                                        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">💪</span>
                                                <span className="font-semibold text-destructive">Room for Improvement</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Let's pick up the pace! Set aside dedicated time each day for studying.
                                            </p>
                                        </div>
                                    )}

                                    {currentWeekData.days.filter(d => d.percentage === 100).length >= 5 && (
                                        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg">⭐</span>
                                                <span className="font-semibold text-primary">Consistency Champion!</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                You completed 5+ perfect days this week. Your consistency is outstanding!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
};

export default WeeklySummary;