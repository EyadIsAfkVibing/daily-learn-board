import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ENHANCED_SCHEDULE, STORAGE_KEY, isDayComplete } from "@/lib/schedule";

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    requirement: number;
    category: "lessons" | "streak" | "days" | "special";
    unlocked: boolean;
    progress: number;
}

const ACHIEVEMENTS_CONFIG = [
    { id: "first_lesson", title: "First Steps", description: "Complete your first lesson", icon: "🎯", requirement: 1, category: "lessons" as const },
    { id: "5_lessons", title: "Getting Started", description: "Complete 5 lessons", icon: "📚", requirement: 5, category: "lessons" as const },
    { id: "10_lessons", title: "Dedicated Learner", description: "Complete 10 lessons", icon: "🌟", requirement: 10, category: "lessons" as const },
    { id: "25_lessons", title: "Knowledge Seeker", description: "Complete 25 lessons", icon: "🔥", requirement: 25, category: "lessons" as const },
    { id: "50_lessons", title: "Master Student", description: "Complete 50 lessons", icon: "👑", requirement: 50, category: "lessons" as const },
    { id: "all_lessons", title: "Perfect Score!", description: "Complete ALL lessons", icon: "🏆", requirement: 56, category: "lessons" as const },

    { id: "3_day_streak", title: "Consistent", description: "3 day streak", icon: "🔥", requirement: 3, category: "streak" as const },
    { id: "7_day_streak", title: "Week Warrior", description: "7 day streak", icon: "⚡", requirement: 7, category: "streak" as const },
    { id: "14_day_streak", title: "Unstoppable", description: "14 day streak", icon: "💪", requirement: 14, category: "streak" as const },
    { id: "28_day_streak", title: "Legendary", description: "Complete all 28 days", icon: "🎖️", requirement: 28, category: "streak" as const },

    { id: "5_days", title: "Good Start", description: "Complete 5 full days", icon: "📅", requirement: 5, category: "days" as const },
    { id: "10_days", title: "Half Way", description: "Complete 10 full days", icon: "🎉", requirement: 10, category: "days" as const },
    { id: "20_days", title: "Almost There", description: "Complete 20 full days", icon: "🚀", requirement: 20, category: "days" as const },

    { id: "weekend_warrior", title: "Weekend Warrior", description: "Study on weekend", icon: "💼", requirement: 1, category: "special" as const },
    { id: "early_bird", title: "Early Bird", description: "Complete before 9 AM", icon: "🌅", requirement: 1, category: "special" as const },
    { id: "night_owl", title: "Night Owl", description: "Complete after 10 PM", icon: "🦉", requirement: 1, category: "special" as const },
];

const ACHIEVEMENTS_KEY = "study-achievements";

interface RewardsSystemProps {
    progress: { [key: string]: boolean };
}

const RewardsSystem = ({ progress }: RewardsSystemProps) => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
    const [totalPoints, setTotalPoints] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        calculateAchievements();
    }, [progress]);

    const calculateStats = () => {
        let totalCompleted = 0;
        let daysCompleted = 0;
        let currentStreak = 0;
        let tempStreak = 0;

        const today = new Date().toISOString().split("T")[0];
        const todayIndex = ENHANCED_SCHEDULE.findIndex((day) => day.date === today);
        const endIndex = todayIndex >= 0 ? todayIndex + 1 : ENHANCED_SCHEDULE.length;

        for (let i = 0; i < endIndex; i++) {
            const day = ENHANCED_SCHEDULE[i];
            const dayComplete = isDayComplete(i, day.subjects.length, progress);

            if (dayComplete) {
                tempStreak++;
                daysCompleted++;
            } else {
                tempStreak = 0;
            }

            for (let j = 0; j < day.subjects.length; j++) {
                if (progress[`${i}-${j}`]) totalCompleted++;
            }
        }

        for (let i = endIndex - 1; i >= 0; i--) {
            const day = ENHANCED_SCHEDULE[i];
            if (isDayComplete(i, day.subjects.length, progress)) {
                currentStreak++;
            } else {
                break;
            }
        }

        return { totalCompleted, daysCompleted, currentStreak };
    };

    const calculateAchievements = () => {
        const stats = calculateStats();
        const savedAchievements = localStorage.getItem(ACHIEVEMENTS_KEY);
        const previousUnlocked = savedAchievements ? JSON.parse(savedAchievements) : {};

        const updatedAchievements = ACHIEVEMENTS_CONFIG.map(config => {
            let currentProgress = 0;
            let unlocked = false;

            switch (config.category) {
                case "lessons":
                    currentProgress = stats.totalCompleted;
                    unlocked = currentProgress >= config.requirement;
                    break;
                case "streak":
                    currentProgress = stats.currentStreak;
                    unlocked = currentProgress >= config.requirement;
                    break;
                case "days":
                    currentProgress = stats.daysCompleted;
                    unlocked = currentProgress >= config.requirement;
                    break;
                case "special":
                    currentProgress = previousUnlocked[config.id] ? 1 : 0;
                    unlocked = previousUnlocked[config.id] || false;
                    break;
            }

            if (unlocked && !previousUnlocked[config.id]) {
                triggerAchievementUnlock(config);
                previousUnlocked[config.id] = true;
            }

            return {
                ...config,
                unlocked,
                progress: Math.min(currentProgress, config.requirement),
            };
        });

        setAchievements(updatedAchievements);
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(previousUnlocked));

        const points = updatedAchievements.filter(a => a.unlocked).length * 100;
        setTotalPoints(points);
    };

    const triggerAchievementUnlock = (achievement: typeof ACHIEVEMENTS_CONFIG[0]) => {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#8b5cf6', '#06b6d4', '#10b981']
        });

        toast.success(`🏆 Achievement Unlocked: ${achievement.title}!`, {
            description: achievement.description,
            duration: 5000,
        });
    };

    const unlockedAchievements = achievements.filter(a => a.unlocked);

    const categories = [
        { name: "All", value: "all" },
        { name: "Lessons", value: "lessons" },
        { name: "Streaks", value: "streak" },
        { name: "Days", value: "days" },
        { name: "Special", value: "special" },
    ];

    const filteredAchievements = selectedCategory === "all"
        ? achievements
        : achievements.filter(a => a.category === selectedCategory);

    return (
        <div className="space-y-6">
            {/* Points Header */}
            <Card className="glass p-6 text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    <div className="text-6xl font-bold text-accent mb-2">{totalPoints}</div>
                    <div className="text-lg text-muted-foreground font-semibold">Achievement Points</div>
                    <div className="text-sm text-muted-foreground mt-1">
                        {unlockedAchievements.length} / {achievements.length} Unlocked
                    </div>
                </motion.div>

                <div className="w-full bg-secondary/30 rounded-full h-3 mt-4 overflow-hidden">
                    <motion.div
                        className="bg-accent h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${achievements.length > 0 ? (unlockedAchievements.length / achievements.length) * 100 : 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
            </Card>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <Button
                        key={cat.value}
                        variant={selectedCategory === cat.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat.value)}
                        className={selectedCategory === cat.value ? "bg-accent" : "glass"}
                    >
                        {cat.name}
                    </Button>
                ))}
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAchievements.map((achievement, idx) => (
                    <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.03, y: -5 }}
                        onClick={() => setSelectedAchievement(achievement)}
                    >
                        <Card
                            className={`
                p-5 cursor-pointer transition-all
                ${achievement.unlocked
                                    ? 'glass border-2 border-accent/50 shadow-lg'
                                    : 'glass opacity-60 grayscale'
                                }
              `}
                        >
                            <div className="flex items-start gap-4">
                                <motion.div
                                    className={`text-5xl ${achievement.unlocked ? '' : 'opacity-40'}`}
                                    animate={achievement.unlocked ? { rotate: [0, 10, -10, 0] } : {}}
                                    transition={{ duration: 0.5 }}
                                >
                                    {achievement.icon}
                                </motion.div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-primary">{achievement.title}</h4>
                                        {achievement.unlocked && (
                                            <Badge className="bg-accent text-accent-foreground">Unlocked</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {achievement.description}
                                    </p>

                                    {!achievement.unlocked && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Progress</span>
                                                <span>{achievement.progress} / {achievement.requirement}</span>
                                            </div>
                                            <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden">
                                                <motion.div
                                                    className="bg-accent h-full rounded-full"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(achievement.progress / achievement.requirement) * 100}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {achievement.unlocked && (
                                        <div className="text-xs text-success font-semibold">
                                            +100 Points ✓
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Achievement Detail Modal */}
            <AnimatePresence>
                {selectedAchievement && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedAchievement(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            onClick={(e) => e.stopPropagation()}
                            className="max-w-md w-full"
                        >
                            <Card className="glass-strong p-8 text-center">
                                <motion.div
                                    className="text-8xl mb-4"
                                    animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {selectedAchievement.icon}
                                </motion.div>

                                <h2 className="text-3xl font-bold text-primary mb-2">
                                    {selectedAchievement.title}
                                </h2>

                                <p className="text-muted-foreground mb-6">
                                    {selectedAchievement.description}
                                </p>

                                {selectedAchievement.unlocked ? (
                                    <div className="space-y-4">
                                        <div className="bg-success text-white text-lg px-4 py-2 rounded-full font-bold inline-block">
                                            ✓ UNLOCKED
                                        </div>
                                        <p className="text-accent font-bold text-xl">+100 Points</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="text-sm text-muted-foreground">
                                            Progress: {selectedAchievement.progress} / {selectedAchievement.requirement}
                                        </div>
                                        <div className="w-full bg-secondary/30 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="bg-accent h-full rounded-full transition-all"
                                                style={{ width: `${(selectedAchievement.progress / selectedAchievement.requirement) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedAchievement.requirement - selectedAchievement.progress} more to unlock!
                                        </p>
                                    </div>
                                )}

                                <Button
                                    onClick={() => setSelectedAchievement(null)}
                                    className="mt-6 w-full"
                                    variant="outline"
                                >
                                    Close
                                </Button>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RewardsSystem;