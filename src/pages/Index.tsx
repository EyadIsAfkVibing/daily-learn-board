import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { ENHANCED_SCHEDULE, STORAGE_KEY } from "@/lib/schedule";
import StreakCounter from "@/components/StreakCounter";
import ScrollReveal from "@/components/ScrollReveal";
import RadialProgress from "@/components/RadialProgress";
import { useRamadanMode } from "@/hooks/useRamadanMode";

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

/* Duotone-style icon wrapper */
const DuoIcon = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary ${className}`}>
    {children}
  </div>
);

const CleanDashboard = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<{ [key: string]: boolean }>({});
  const { isRamadan, toggle: toggleRamadan } = useRamadanMode();

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
    { label: "Today's Lesson", icon: "📖", path: "/" },
    { label: "My Notes", icon: "✏️", path: "/notes" },
    { label: "Calendar", icon: "📅", path: "/calendar" },
    { label: "Statistics", icon: "📊", path: "/statistics" },
    { label: "Achievements", icon: "⭐", path: "/achievements" },
    { label: "Weekly Summary", icon: "📈", path: "/weekly-summary" },
  ];

  return (
    <div className="min-h-screen relative z-20 transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-1">
                Welcome Back <span className="holographic">✦</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Your study journey continues
              </p>
            </div>
            {/* Ramadan Toggle */}
            <motion.div
              className="glass rounded-2xl px-4 py-3 flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-sm font-medium text-muted-foreground">
                {isRamadan ? "🌙" : "☀️"}
              </span>
              <span className="text-sm font-semibold text-foreground">Ramadan Mode</span>
              <Switch checked={isRamadan} onCheckedChange={toggleRamadan} />
            </motion.div>
          </div>

          <div className="engraved-divider" />
        </motion.header>

        {/* === BENTO GRID === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

          {/* Hero card — overall progress (spans 2 cols) */}
          <ScrollReveal delay={0.05} className="md:col-span-2 lg:col-span-2">
            <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.3, ease }}>
              <Card className="glass-strong p-6 rounded-3xl relative overflow-hidden group h-full">
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 shine" />
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-foreground">Overall Progress</h2>
                  <span className="text-lg font-bold text-primary">
                    {progressPercent}%
                  </span>
                </div>
                {/* Liquid progress bar */}
                <div
                  className="w-full rounded-full h-4 overflow-hidden"
                  style={{
                    background: "hsl(var(--muted))",
                    boxShadow: "inset 0 2px 4px hsl(var(--background) / 0.6)",
                  }}
                >
                  <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{
                      background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
                      boxShadow: "0 0 12px hsl(var(--glow-primary) / 0.4)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1.6, ease, delay: 0.3 }}
                  >
                    {/* Shimmer sweep inside bar */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.2), transparent)",
                        backgroundSize: "200% 100%",
                      }}
                      animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1.5 }}
                    />
                  </motion.div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {completedLessons} of {totalLessons} lessons completed
                </p>
              </Card>
            </motion.div>
          </ScrollReveal>

          {/* Streak card */}
          <ScrollReveal delay={0.1} className="md:col-span-2 lg:col-span-2">
            <StreakCounter progress={progress} />
          </ScrollReveal>
        </div>

        {/* Quick Actions — bento row */}
        <ScrollReveal delay={0.05}>
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {quickActions.map((action, idx) => (
            <ScrollReveal key={action.path} delay={idx * 0.04} direction={idx % 2 === 0 ? "up" : "left"}>
              <motion.div
                whileHover={{
                  y: -6,
                  scale: 1.04,
                  transition: { duration: 0.3, ease },
                }}
                whileTap={{ scale: 0.95, transition: { duration: 0.15 } }}
              >
                <Card
                  onClick={() => navigate(action.path)}
                  className="glass p-5 cursor-pointer text-center rounded-2xl transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Hover highlight sweep */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(120deg, transparent 20%, hsl(var(--glow-primary) / 0.06) 50%, transparent 80%)",
                      backgroundSize: "200% 100%",
                    }}
                    animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="text-3xl mb-2">{action.icon}</div>
                  <div className="text-foreground font-semibold text-sm">{action.label}</div>
                </Card>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <div className="engraved-divider" />

        {/* Subject Progress — Radial Rings */}
        <ScrollReveal delay={0.05}>
          <h2 className="text-xl font-bold text-foreground mb-4">Subject Progress</h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <Card className="glass-strong p-6 rounded-3xl">
            <div className="flex flex-wrap gap-5 justify-center md:justify-start">
              {uniqueSubjects.map((subject, idx) => {
                const { completed, total } = subjectProgress[subject];
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                return (
                  <motion.div
                    key={subject}
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    data-interactive
                  >
                    <RadialProgress
                      percent={percent}
                      size={64}
                      strokeWidth={5}
                      label={subject}
                      delay={0.08 * idx}
                    />
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </ScrollReveal>

        <div className="engraved-divider mt-8" />

        {/* Quote */}
        <ScrollReveal delay={0.15} direction="up">
          <Card className="glass-strong p-8 text-center rounded-3xl mt-6">
            <p className="text-xl font-bold text-foreground mb-2">
              "The expert in anything was once a beginner."
            </p>
            <p className="text-sm text-muted-foreground">Keep pushing forward ✦</p>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default CleanDashboard;
