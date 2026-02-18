import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ENHANCED_SCHEDULE, STORAGE_KEY } from "@/lib/schedule";
import StreakCounter from "@/components/StreakCounter";
import ScrollReveal from "@/components/ScrollReveal";

const antiGravity: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const CleanDashboard = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<{ [key: string]: boolean }>({});
  const [darkMode, setDarkMode] = useState(false);

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
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      path: "/",
    },
    {
      label: "My Notes",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      path: "/notes",
    },
    {
      label: "Calendar",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      path: "/calendar",
    },
    {
      label: "Statistics",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      path: "/statistics",
    },
    {
      label: "Achievements",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      path: "/achievements",
    },
    {
      label: "Weekly Summary",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      path: "/weekly-summary",
    },
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 relative z-20">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: antiGravity }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-semibold text-primary mb-2 neon-text">
                Welcome Back
              </h1>
              <p className="text-muted-foreground text-lg">
                Continue your quest for knowledge
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="glass border-border/50 text-foreground hover:bg-secondary"
              >
                {darkMode ? "☀️ Light" : "🌙 Dark"}
              </Button>
            </motion.div>
          </div>

          {/* Engraved Divider */}
          <div className="engraved-divider" />

          {/* Overall Progress — Engraved Meter */}
          <ScrollReveal delay={0.1}>
            <Card className="glass-strong p-6 rounded-2xl ornament-corner">
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-serif font-semibold text-foreground">
                  Overall Progress
                </span>
                <span className="text-lg font-semibold text-primary">
                  {completedLessons} / {totalLessons} ({progressPercent}%)
                </span>
              </div>
              {/* Engraved progress bar */}
              <div className="w-full rounded-full h-4 overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, hsl(30 15% 12%) 0%, hsl(30 15% 16%) 100%)",
                  boxShadow: "inset 0 2px 4px hsl(30 18% 5% / 0.6), inset 0 -1px 0 hsl(38 30% 25% / 0.2)",
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, hsl(38 55% 35%), hsl(38 70% 50%), hsl(35 55% 45%))",
                    boxShadow: "0 0 8px hsl(38 70% 50% / 0.3), inset 0 1px 0 hsl(38 70% 60% / 0.3)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.4, ease: antiGravity, delay: 0.3 }}
                />
              </div>
            </Card>
          </ScrollReveal>
        </motion.header>

        {/* Quick Actions Grid */}
        <ScrollReveal delay={0.05}>
          <h2 className="text-2xl font-serif font-semibold text-primary mb-4">
            Quick Actions
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {quickActions.map((action, idx) => (
            <ScrollReveal key={action.path + action.label} delay={idx * 0.06} direction={idx % 2 === 0 ? "up" : "left"}>
              <motion.div
                whileHover={{
                  y: -6,
                  scale: 1.03,
                  boxShadow: "0 12px 32px hsl(38 70% 50% / 0.15)",
                  transition: { duration: 0.35, ease: antiGravity },
                }}
                whileTap={{ scale: 0.96 }}
              >
                <Card
                  onClick={() => navigate(action.path)}
                  className="glass ornament-corner p-5 cursor-pointer text-center rounded-2xl transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Ambient highlight sweep on hover */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(120deg, transparent 20%, hsl(38 70% 50% / 0.06) 50%, transparent 80%)",
                      backgroundSize: "200% 100%",
                    }}
                    animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="text-primary mb-3 flex justify-center opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                    {action.icon}
                  </div>
                  <div className="text-foreground font-semibold text-sm">
                    {action.label}
                  </div>
                </Card>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Engraved Divider */}
        <div className="engraved-divider" />

        {/* Streak Counter */}
        <ScrollReveal delay={0.1}>
          <div className="mb-8">
            <StreakCounter progress={progress} />
          </div>
        </ScrollReveal>

        {/* Subject Progress Overview */}
        <ScrollReveal delay={0.05}>
          <h2 className="text-2xl font-serif font-semibold text-primary mb-4">
            Subject Progress
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uniqueSubjects.map((subject, idx) => {
            const { completed, total } = subjectProgress[subject];
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            return (
              <ScrollReveal key={subject} delay={0.04 * idx} direction={idx % 3 === 0 ? "up" : idx % 3 === 1 ? "left" : "right"}>
                <motion.div
                  whileHover={{
                    y: -5,
                    scale: 1.02,
                    boxShadow: "0 10px 28px hsl(38 70% 50% / 0.12)",
                    transition: { duration: 0.35, ease: antiGravity },
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="glass ornament-corner p-4 rounded-2xl relative overflow-hidden group">
                    {/* Shimmer sweep on hover */}
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 shine" />
                    <div className="text-sm font-semibold text-muted-foreground mb-2 truncate" title={subject}>
                      {subject}
                    </div>
                    <div className="text-2xl font-serif font-bold text-primary mb-2">
                      {completed}/{total}
                    </div>
                    {/* Engraved mini progress bar */}
                    <div className="w-full rounded-full h-2 overflow-hidden"
                      style={{
                        background: "linear-gradient(180deg, hsl(30 15% 12%) 0%, hsl(30 15% 16%) 100%)",
                        boxShadow: "inset 0 1px 3px hsl(30 18% 5% / 0.5)",
                      }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: "linear-gradient(90deg, hsl(38 55% 35%), hsl(38 70% 50%))",
                          boxShadow: "0 0 4px hsl(38 70% 50% / 0.2)",
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, delay: 0.15 * idx, ease: antiGravity }}
                      />
                    </div>
                    <div className="text-xs text-primary font-semibold mt-1">{percent}%</div>
                  </Card>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Engraved Divider */}
        <div className="engraved-divider mt-8" />

        {/* Motivational Quote */}
        <ScrollReveal delay={0.2} direction="up">
          <Card className="glass-strong ornament-corner p-8 text-center rounded-2xl mt-6">
            <p className="text-xl font-serif font-semibold text-primary mb-2">
              "The expert in anything was once a beginner."
            </p>
            <p className="text-sm text-muted-foreground">Keep pushing forward</p>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default CleanDashboard;
