import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ENHANCED_SCHEDULE, STORAGE_KEY, isDayComplete } from "@/lib/schedule";

interface StreakCounterProps {
    progress: { [key: string]: boolean };
}

const StreakCounter = ({ progress }: StreakCounterProps) => {
    const [currentStreak, setCurrentStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);
    const [totalDaysCompleted, setTotalDaysCompleted] = useState(0);

    useEffect(() => {
        calculateStreaks();
    }, [progress]);

    const calculateStreaks = () => {
        let streak = 0;
        let maxStreak = 0;
        let tempStreak = 0;
        let daysCompleted = 0;

        const today = new Date().toISOString().split("T")[0];
        const todayIndex = ENHANCED_SCHEDULE.findIndex((day) => day.date === today);

        // Calculate from start to today (or end if today hasn't come yet)
        const endIndex = todayIndex >= 0 ? todayIndex + 1 : ENHANCED_SCHEDULE.length;

        for (let i = 0; i < endIndex; i++) {
            const day = ENHANCED_SCHEDULE[i];
            const dayComplete = isDayComplete(i, day.subjects.length, progress);

            if (dayComplete) {
                tempStreak++;
                daysCompleted++;
                maxStreak = Math.max(maxStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        }

        // Current streak is the last consecutive completed days
        for (let i = endIndex - 1; i >= 0; i--) {
            const day = ENHANCED_SCHEDULE[i];
            if (isDayComplete(i, day.subjects.length, progress)) {
                streak++;
            } else {
                break;
            }
        }

        setCurrentStreak(streak);
        setLongestStreak(maxStreak);
        setTotalDaysCompleted(daysCompleted);
    };

    const getStreakEmoji = () => {
        if (currentStreak === 0) return "😴";
        if (currentStreak < 3) return "🔥";
        if (currentStreak < 7) return "🔥🔥";
        if (currentStreak < 14) return "🔥🔥🔥";
        return "🔥🔥🔥🔥";
    };

    const getStreakMessage = () => {
        if (currentStreak === 0) return "Start your streak today!";
        if (currentStreak === 1) return "Great start! Keep it up!";
        if (currentStreak < 7) return "You're on fire!";
        if (currentStreak < 14) return "Incredible dedication!";
        return "LEGENDARY STREAK!";
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="glass shadow-lg p-6 border-2 border-accent/30">
                <div className="text-center mb-4">
                    <motion.div
                        className="text-6xl mb-3"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {getStreakEmoji()}
                    </motion.div>
                    <h3 className="text-2xl font-bold text-primary mb-1">
                        {currentStreak} Day Streak
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                        {getStreakMessage()}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <motion.div
                        className="glass-strong p-4 rounded-xl text-center"
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="text-3xl font-bold text-accent mb-1">
                            {longestStreak}
                        </div>
                        <div className="text-xs text-muted-foreground font-semibold">
                            Longest Streak
                        </div>
                    </motion.div>

                    <motion.div
                        className="glass-strong p-4 rounded-xl text-center"
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="text-3xl font-bold text-accent mb-1">
                            {totalDaysCompleted}
                        </div>
                        <div className="text-xs text-muted-foreground font-semibold">
                            Days Completed
                        </div>
                    </motion.div>
                </div>

                {currentStreak > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-accent/10 rounded-lg text-center"
                    >
                        <p className="text-xs text-accent font-semibold">
                            Don't break the chain! 💪
                        </p>
                    </motion.div>
                )}
            </Card>
        </motion.div>
    );
};

export default StreakCounter;