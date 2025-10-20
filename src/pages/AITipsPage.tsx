import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ENHANCED_SCHEDULE, STORAGE_KEY, isDayComplete } from "@/lib/schedule";

interface Tip {
    id: string;
    icon: JSX.Element;
    title: string;
    description: string;
    type: "motivation" | "strategy" | "warning" | "achievement";
    priority: number;
}

const AIStudyTips = () => {
    const [progress, setProgress] = useState<{ [key: string]: boolean }>({});
    const [dismissedTips, setDismissedTips] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setProgress(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse progress", e);
            }
        }

        const dismissedStr = localStorage.getItem("dismissed-tips");
        if (dismissedStr) {
            try {
                setDismissedTips(JSON.parse(dismissedStr));
            } catch (e) {
                console.error("Failed to parse dismissed tips", e);
            }
        }
    }, []);

    const statistics = useMemo(() => {
        let totalCompleted = 0;
        let totalLessons = 0;
        let daysCompleted = 0;
        let currentStreak = 0;
        let tempStreak = 0;
        const subjectStats: { [key: string]: { completed: number; total: number } } = {};

        const today = new Date().toISOString().split("T")[0];
        const todayIndex = ENHANCED_SCHEDULE.findIndex((day) => day.date === today);
        const endIndex = todayIndex >= 0 ? todayIndex + 1 : ENHANCED_SCHEDULE.length;

        ENHANCED_SCHEDULE.forEach((day, dayIdx) => {
            let dayComplete = true;

            day.subjects.forEach((subject, subIdx) => {
                totalLessons++;

                if (!subjectStats[subject.name]) {
                    subjectStats[subject.name] = { completed: 0, total: 0 };
                }
                subjectStats[subject.name].total++;

                if (progress[`${dayIdx}-${subIdx}`]) {
                    totalCompleted++;
                    subjectStats[subject.name].completed++;
                } else if (dayIdx < endIndex) {
                    dayComplete = false;
                }
            });

            if (dayIdx < endIndex) {
                if (dayComplete) {
                    tempStreak++;
                    daysCompleted++;
                } else {
                    tempStreak = 0;
                }
            }
        });

        // Calculate current streak
        for (let i = endIndex - 1; i >= 0; i--) {
            if (isDayComplete(i, ENHANCED_SCHEDULE[i].subjects.length, progress)) {
                currentStreak++;
            } else {
                break;
            }
        }

        return {
            totalCompleted,
            totalLessons,
            daysCompleted,
            currentStreak,
            completionRate: totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0,
            subjectStats,
            todayIndex,
        };
    }, [progress]);

    const generateTips = (): Tip[] => {
        const tips: Tip[] = [];

        // Streak tips
        if (statistics.currentStreak === 0) {
            tips.push({
                id: "start-streak",
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                title: "Start Your Streak!",
                description: "Complete a full day of lessons to start building a study streak. Consistency is key to mastering new skills!",
                type: "motivation",
                priority: 5,
            });
        } else if (statistics.currentStreak >= 3 && statistics.currentStreak < 7) {
            tips.push({
                id: "streak-3",
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>,
                title: "You're On Fire! 🔥",
                description: `${statistics.currentStreak} days streak! Keep it going to reach a full week. You're building great study habits!`,
                type: "achievement",
                priority: 8,
            });
        } else if (statistics.currentStreak >= 7) {
            tips.push({
                id: "streak-7",
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
                title: "Legendary Streak! 👑",
                description: `Amazing ${statistics.currentStreak} day streak! You're a study champion. This consistency will pay off big time!`,
                type: "achievement",
                priority: 10,
            });
        }

        // Completion rate tips
        if (statistics.completionRate < 30) {
            tips.push({
                id: "low-completion",
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                title: "Time to Pick Up the Pace",
                description: "Try dedicating 30 minutes daily. Small consistent efforts lead to big results!",
                type: "strategy",
                priority: 7,
            });
        } else if (statistics.completionRate >= 80) {
            tips.push({
                id: "high-completion",
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
                title: "Outstanding Progress!",
                description: `You've completed ${Math.round(statistics.completionRate)}% of your lessons. You're crushing it! Keep this momentum going!`,
                type: "achievement",
                priority: 9,
            });
        }

        // Subject-specific tips
        Object.entries(statistics.subjectStats).forEach(([subject, stats]) => {
            const completion = (stats.completed / stats.total) * 100;

            if (completion === 0 && stats.total > 0) {
                tips.push({
                    id: `subject-${subject}`,
                    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
                    title: `Start ${subject}`,
                    description: `You haven't started ${subject} yet. Every expert was once a beginner - take the first step!`,
                    type: "motivation",
                    priority: 6,
                });
            } else if (completion === 100) {
                tips.push({
                    id: `subject-complete-${subject}`,
                    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                    title: `${subject} Mastered! 🎉`,
                    description: `Congratulations! You've completed all ${subject} lessons. Time to apply what you've learned!`,
                    type: "achievement",
                    priority: 8,
                });
            }
        });

        // Study pattern tips
        const now = new Date();
        const hour = now.getHours();

        if (hour >= 22 || hour < 6) {
            tips.push({
                id: "late-night",
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
                title: "Late Night Study?",
                description: "Studying late can affect retention. Consider studying earlier for better focus and sleep quality.",
                type: "warning",
                priority: 4,
            });
        } else if (hour >= 6 && hour < 9) {
            tips.push({
                id: "morning-study",
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
                title: "Perfect Study Time!",
                description: "Morning hours are great for learning! Your brain is fresh and focused. Make the most of it!",
                type: "strategy",
                priority: 6,
            });
        }

        // General tips
        if (statistics.totalCompleted > 10 && statistics.totalCompleted % 10 === 0) {
            tips.push({
                id: "milestone",
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
                title: "Milestone Reached!",
                description: `${statistics.totalCompleted} lessons completed! Every lesson brings you closer to your goals. Keep going!`,
                type: "achievement",
                priority: 7,
            });
        }

        return tips
            .filter(tip => !dismissedTips.includes(tip.id))
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 6);
    };

    const tips = useMemo(() => generateTips(), [statistics, dismissedTips]);

    const dismissTip = (tipId: string) => {
        const updated = [...dismissedTips, tipId];
        setDismissedTips(updated);
        localStorage.setItem("dismissed-tips", JSON.stringify(updated));
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "achievement": return "bg-green-500/20 border-green-500/50 text-green-400";
            case "motivation": return "bg-blue-500/20 border-blue-500/50 text-blue-400";
            case "strategy": return "bg-purple-500/20 border-purple-500/50 text-purple-400";
            case "warning": return "bg-yellow-500/20 border-yellow-500/50 text-yellow-400";
            default: return "bg-accent/20 border-accent/50 text-accent";
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Study Tips
                </h2>
                <p className="text-muted-foreground">
                    Personalized recommendations based on your progress
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass p-4 text-center">
                    <div className="text-3xl font-bold text-accent mb-1">
                        {Math.round(statistics.completionRate)}%
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold">Completion</div>
                </Card>
                <Card className="glass p-4 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                        {statistics.currentStreak}
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold">Day Streak</div>
                </Card>
                <Card className="glass p-4 text-center">
                    <div className="text-3xl font-bold text-success mb-1">
                        {statistics.totalCompleted}
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold">Completed</div>
                </Card>
                <Card className="glass p-4 text-center">
                    <div className="text-3xl font-bold text-purple-500 mb-1">
                        {statistics.totalLessons - statistics.totalCompleted}
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold">Remaining</div>
                </Card>
            </div>

            {/* Tips */}
            {tips.length === 0 ? (
                <Card className="glass p-12 text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-bold text-primary mb-2">You're All Set!</h3>
                    <p className="text-muted-foreground">
                        No new tips right now. Keep up the great work!
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tips.map((tip, idx) => (
                        <motion.div
                            key={tip.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className={`${getTypeColor(tip.type)} border p-5`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div>{tip.icon}</div>
                                        <h3 className="font-bold">{tip.title}</h3>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => dismissTip(tip.id)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </Button>
                                </div>
                                <p className="text-sm opacity-90">{tip.description}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AIStudyTips;