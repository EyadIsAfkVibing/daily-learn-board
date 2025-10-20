import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ENHANCED_SCHEDULE, STORAGE_KEY } from "@/lib/schedule";
import StreakCounter from "@/components/StreakCounter";

const CleanDashboard = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<{ [key: string]: boolean }>({});
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved progress", e);
      }
    }
  }, []);

  const { totalLessons, completedLessons } = useMemo(() => {
    let total = 0;
    let completed = 0;
    ENHANCED_SCHEDULE.forEach((day, dayIdx) => {
      day.subjects.forEach((_, subIdx) => {
        total++;
        if (progress[`${dayIdx}-${subIdx}`]) completed++;
      });
    });
    return { totalLessons: total, completedLessons: completed };
  }, [progress]);

  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const subjectProgress = useMemo(() => {
    const subjects: { [key: string]: { total: number; completed: number } } = {};
    ENHANCED_SCHEDULE.forEach((day, dayIdx) => {
      day.subjects.forEach((subject, subIdx) => {
        if (!subjects[subject.name]) {
          subjects[subject.name] = { total: 0, completed: 0 };
        }
        subjects[subject.name].total++;
        if (progress[`${dayIdx}-${subIdx}`]) {
          subjects[subject.name].completed++;
        }
      });
    });
    return subjects;
  }, [progress]);

  const uniqueSubjects = Object.keys(subjectProgress).sort();

  const quickActions = [
    {
      label: "Today's Lesson",
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
      path: "/",
      color: "bg-purple-500"
    },
    {
      label: "My Notes",
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
      path: "/notes",
      color: "bg-blue-500"
    },
    {
      label: "Calendar",
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      path: "/calendar",
      color: "bg-green-500"
    },
    {
      label: "Statistics",
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      path: "/statistics",
      color: "bg-yellow-500"
    },
    {
      label: "Achievements",
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
      path: "/achievements",
      color: "bg-orange-500"
    },
    {
      label: "Weekly Summary",
      icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
      path: "/weekly-summary",
      color: "bg-red-500"
    },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
                Welcome Back! 👋
              </h1>
              <p className="text-muted-foreground text-lg">
                Ready to continue your learning journey?
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="glass"
              >
                {darkMode ? "☀️ Light" : "🌙 Dark"}
              </Button>
            </motion.div>
          </div>

          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="glass-strong p-6 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-foreground">Overall Progress</span>
                <span className="text-lg font-bold text-accent">
                  {completedLessons} / {totalLessons} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-secondary/30 rounded-full h-4 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </Card>
          </motion.div>
        </motion.header>

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-primary mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, idx) => (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  onClick={() => navigate(action.path)}
                  className={`${action.color} p-6 cursor-pointer text-center shadow-lg hover:shadow-xl transition-all`}
                >
                  <div className="text-4xl mb-2">{action.icon}</div>
                  <div className="text-white font-semibold text-sm">{action.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Streak Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <StreakCounter progress={progress} />
        </motion.div>

        {/* Subject Progress Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-primary mb-4">📚 Subject Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uniqueSubjects.map((subject, idx) => {
              const { completed, total } = subjectProgress[subject];
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <motion.div
                  key={subject}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * idx }}
                  whileHover={{ scale: 1.03, y: -3 }}
                >
                  <Card className="glass p-4 shadow-md hover:shadow-lg transition-all">
                    <div className="text-sm font-bold text-muted-foreground mb-2 truncate" title={subject}>
                      {subject}
                    </div>
                    <div className="text-2xl font-bold text-primary mb-2">
                      {completed}/{total}
                    </div>
                    <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="bg-accent h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.6, delay: 0.1 * idx }}
                      />
                    </div>
                    <div className="text-xs text-accent font-bold mt-1">{percent}%</div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8"
        >
          <Card className="glass-strong p-8 text-center">
            <div className="text-6xl mb-4">💡</div>
            <p className="text-xl font-semibold text-primary mb-2">
              "The expert in anything was once a beginner."
            </p>
            <p className="text-sm text-muted-foreground">Keep pushing forward! 🚀</p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CleanDashboard;