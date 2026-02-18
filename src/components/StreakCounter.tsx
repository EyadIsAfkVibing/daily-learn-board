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
    let streak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    let daysCompleted = 0;

    const today = new Date().toISOString().split("T")[0];
    const todayIndex = ENHANCED_SCHEDULE.findIndex((day) => day.date === today);
    const endIndex = todayIndex >= 0 ? todayIndex + 1 : ENHANCED_SCHEDULE.length;

    for (let i = 0; i < endIndex; i++) {
      const day = ENHANCED_SCHEDULE[i];
      if (isDayComplete(i, day.subjects.length, progress)) {
        tempStreak++;
        daysCompleted++;
        maxStreak = Math.max(maxStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

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
  }, [progress]);

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
    <Card className="glass-strong p-6 rounded-3xl h-full relative overflow-hidden group">
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 shine" />
      <div className="text-center mb-4">
        <motion.div
          className="text-5xl mb-2"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {getStreakEmoji()}
        </motion.div>
        <h3 className="text-2xl font-bold text-foreground mb-0.5">
          {currentStreak} Day Streak
        </h3>
        <p className="text-sm text-muted-foreground font-medium">
          {getStreakMessage()}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <motion.div
          className="glass p-3 rounded-xl text-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-2xl font-bold text-accent mb-0.5">{longestStreak}</div>
          <div className="text-xs text-muted-foreground font-semibold">Longest</div>
        </motion.div>
        <motion.div
          className="glass p-3 rounded-xl text-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-2xl font-bold text-accent mb-0.5">{totalDaysCompleted}</div>
          <div className="text-xs text-muted-foreground font-semibold">Days Done</div>
        </motion.div>
      </div>

      {currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2.5 bg-accent/10 rounded-lg text-center"
        >
          <p className="text-xs text-accent font-semibold">Don't break the chain! 💪</p>
        </motion.div>
      )}
    </Card>
  );
};

export default StreakCounter;
