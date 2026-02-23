import { useState, useEffect, useRef, useMemo, CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfileContext";
import StreakCounter from "@/components/StreakCounter";
import ScrollReveal from "@/components/ScrollReveal";
import RadialProgress from "@/components/RadialProgress";
import { useRamadanMode } from "@/hooks/useRamadanMode";
import RamadanToggle from "@/components/RamadanToggle";
import NormalCanvas from "@/components/NormalCanvas";
import RamadanCanvas from "@/components/RamadanCanvas";
import SoundToggle from "@/components/SoundToggle";
import { useMagneticHover } from "@/hooks/useMagneticHover";
import { useSound } from "@/hooks/useSound";

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// ─── Spotlight CSS ────────────────────────────────────────────────
const GLOBAL_CSS = `
  .mag-card {
    position: relative;
    transform-style: preserve-3d;
    will-change: transform;
  }
  .mag-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
      ellipse at var(--spot-x,50%) var(--spot-y,50%),
      hsla(220,90%,80%,calc(var(--spot-a,0)*.13)) 0%,
      transparent 68%
    );
    pointer-events: none;
    z-index: 2;
  }
  .ramadan-mode .mag-card::after {
    background: radial-gradient(
      ellipse at var(--spot-x,50%) var(--spot-y,50%),
      hsla(42,90%,75%,calc(var(--spot-a,0)*.14)) 0%,
      transparent 68%
    );
  }
`;

// ─── Magnetic card ────────────────────────────────────────────────
interface MagCardProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  lift?: number;
  onHover?: () => void;
}
const MagCard = ({ children, className = "", strength = 9, lift = 16, onHover }: MagCardProps) => {
  const mag = useMagneticHover({ tiltStrength: strength, liftPx: lift, spring: 0.1 });
  return (
    <div
      ref={mag.ref}
      onMouseMove={mag.onMouseMove}
      onMouseLeave={mag.onMouseLeave}
      onMouseEnter={onHover}
      className={`mag-card ${className}`}
    >
      {children}
    </div>
  );
};

// ─── Action card ─────────────────────────────────────────────────
interface ActionCardProps {
  icon: string;
  label: string;
  onClick: () => void;
  delay?: number;
  onHover?: () => void;
}
const ActionCard = ({ icon, label, onClick, delay = 0, onHover }: ActionCardProps) => {
  const mag = useMagneticHover({ tiltStrength: 13, liftPx: 24, spring: 0.13 });
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay }}
    >
      <div
        ref={mag.ref}
        onMouseMove={mag.onMouseMove}
        onMouseLeave={mag.onMouseLeave}
        onMouseEnter={onHover}
        onClick={onClick}
        className="mag-card"
        style={{ cursor: "pointer" }}
      >
        <Card className="glass p-5 cursor-pointer text-center rounded-2xl overflow-hidden group relative">
          <motion.div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
            style={{
              background: "linear-gradient(120deg,transparent 25%,hsl(var(--glow-primary)/.08) 50%,transparent 75%)",
              backgroundSize: "200% 100%",
              transition: "opacity .4s",
            }}
            animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="text-3xl mb-2 block"
            whileHover={{ scale: 1.22, rotate: [-3, 3, -1, 0] }}
            transition={{ duration: 0.35, ease }}
          >
            {icon}
          </motion.div>
          <div className="text-foreground font-semibold text-sm relative z-10">{label}</div>
        </Card>
      </div>
    </motion.div>
  );
};

// ─── Main dashboard ───────────────────────────────────────────────
const CleanDashboard = () => {
  const navigate = useNavigate();
  const { profile, stats, subjectStats } = useProfile();
  const scrollYRef = useRef(0);
  const { isRamadan, toggle: toggleRamadan } = useRamadanMode();

  // ── Sound system ──────────────────────────────────────────────
  const sound = useSound({ isRamadan });

  // Navigate with sound
  const navigateTo = (path: string) => {
    sound.onNavigate();
    setTimeout(() => navigate(path), 120);
  };

  // Ramadan toggle with sound (sound engine handles the chime internally)
  const handleRamadanToggle = () => {
    toggleRamadan();
  };

  useEffect(() => {
    if (!profile) navigate("/");
  }, [profile, navigate]);

  useEffect(() => {
    const onScroll = () => { scrollYRef.current = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { total: totalLessons, completed: completedLessons, percent: progressPercent } = stats;
  const subjectProgress = subjectStats;

  const uniqueSubjects = Object.keys(subjectProgress).sort();

  const quickActions = [
    { label: "Today's Lesson", icon: "📖", path: "/today" },
    { label: "My Notes", icon: "✏️", path: "/notes" },
    { label: "Calendar", icon: "📅", path: "/calendar" },
    { label: "Statistics", icon: "📊", path: "/statistics" },
    { label: "Achievements", icon: "⭐", path: "/achievements" },
    { label: "Weekly Summary", icon: "📈", path: "/weekly-summary" },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      {/* ── Engine selection — completely isolated renders ── */}
      <AnimatePresence mode="sync">
        {isRamadan ? (
          <motion.div
            key="ramadan-engine"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" } as CSSProperties}
          >
            <RamadanCanvas scrollY={scrollYRef.current} />
          </motion.div>
        ) : (
          <motion.div
            key="normal-engine"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" } as CSSProperties}
          >
            <NormalCanvas scrollY={scrollYRef.current} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dashboard content ── */}
      <div className={`min-h-screen relative z-20 transition-all duration-1000 ${isRamadan ? "ramadan-mode" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="mb-10"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <motion.h1
                  className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-1"
                  animate={{
                    textShadow: isRamadan
                      ? ["0 0 18px hsla(42,80%,70%,0)", "0 0 28px hsla(42,80%,70%,0.22)", "0 0 18px hsla(42,80%,70%,0)"]
                      : ["0 0 0px transparent"],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  Welcome Back{" "}
                  <motion.span
                    className="holographic"
                    animate={{ rotate: isRamadan ? [0, 4, -4, 0] : 0 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ✦
                  </motion.span>
                </motion.h1>
                <p className="text-muted-foreground text-lg">Your study journey continues</p>
              </div>

              {/* Controls row */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Sound toggle */}
                <SoundToggle onToggle={sound.toggleMute} isRamadan={isRamadan} />
                {/* Ramadan toggle — never wrapped in MagCard */}
                <RamadanToggle isRamadan={isRamadan} onToggle={handleRamadanToggle} />
              </div>
            </div>
            <div className="engraved-divider" />
          </motion.header>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <ScrollReveal delay={0.05} className="md:col-span-2 lg:col-span-2">
              <MagCard strength={7} lift={14} onHover={sound.onCardHover}>
                <Card className="glass-strong p-6 rounded-3xl relative overflow-hidden group h-full">
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-600 shine" />
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-foreground">Overall Progress</h2>
                    <motion.span
                      className="text-lg font-bold text-primary tabular-nums"
                      key={progressPercent}
                      initial={{ scale: 1.35, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, ease }}
                    >
                      {progressPercent}%
                    </motion.span>
                  </div>
                  <div
                    className="w-full rounded-full h-4 overflow-hidden"
                    style={{
                      background: "hsl(var(--muted))",
                      boxShadow: "inset 0 2px 4px hsl(var(--background)/.6)",
                    }}
                  >
                    <motion.div
                      className="h-full rounded-full relative overflow-hidden"
                      style={{
                        background: isRamadan
                          ? "linear-gradient(90deg,hsl(32,78%,52%),hsl(42,88%,66%))"
                          : "linear-gradient(90deg,hsl(var(--primary)),hsl(var(--accent)))",
                        boxShadow: isRamadan
                          ? "0 0 14px hsla(42,80%,60%,.5)"
                          : "0 0 12px hsl(var(--glow-primary)/.4)",
                        transition: "background 1s ease, box-shadow 1s ease",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.8, ease, delay: 0.35 }}
                    >
                      <motion.div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(90deg,transparent,hsla(0,0%,100%,.22),transparent)",
                          backgroundSize: "200% 100%",
                        }}
                        animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 1.6 }}
                      />
                    </motion.div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    {completedLessons} of {totalLessons} lessons completed
                  </p>
                </Card>
              </MagCard>
            </ScrollReveal>

            <ScrollReveal delay={0.1} className="md:col-span-2 lg:col-span-2">
              <MagCard strength={7} lift={14} onHover={sound.onCardHover}>
                <StreakCounter progress={profile?.progress || {}} />
              </MagCard>
            </ScrollReveal>
          </div>

          {/* Quick actions */}
          <ScrollReveal delay={0.04}>
            <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
            {quickActions.map((a, idx) => (
              <ActionCard
                key={a.path}
                icon={a.icon}
                label={a.label}
                onClick={() => navigateTo(a.path)}
                delay={0.04 + idx * 0.042}
                onHover={sound.onButtonHover}
              />
            ))}
          </div>

          <div className="engraved-divider" />

          {/* Subject progress */}
          <ScrollReveal delay={0.04}>
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-bold text-foreground">Subject Progress</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <MagCard strength={4} lift={10}>
              <Card className="glass-strong p-6 rounded-3xl">
                <div className="flex flex-wrap gap-5 justify-center md:justify-start">
                  {uniqueSubjects.map((subject, idx) => {
                    const { completed, total } = subjectProgress[subject];
                    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                    return (
                      <motion.div
                        key={subject}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.06 * idx, ease }}
                        whileHover={{ scale: 1.12, y: -5 }}
                        whileTap={{ scale: 0.94 }}
                        onHoverStart={sound.onSubjectHover}
                        className="flex flex-col items-center gap-2"
                      >
                        <RadialProgress
                          percent={percent}
                          size={64}
                          strokeWidth={5}
                          label={subject}
                          delay={0.07 * idx}
                        />
                        {profile?.subjects.find(s => s.name === subject)?.priority && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${profile.subjects.find(s => s.name === subject)?.priority === "High" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                            profile.subjects.find(s => s.name === subject)?.priority === "Low" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                              "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            }`}>
                            {profile.subjects.find(s => s.name === subject)!.priority!.toUpperCase()}
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </MagCard>
          </ScrollReveal>

          <div className="engraved-divider mt-8" />

          {/* Quote */}
          <ScrollReveal delay={0.12} direction="up">
            <MagCard strength={5} lift={12} onHover={sound.onCardHover}>
              <Card className="glass-strong p-8 text-center rounded-3xl mt-6 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    background: isRamadan
                      ? [
                        "radial-gradient(ellipse at 20% 50%,hsla(42,70%,60%,.04) 0%,transparent 70%)",
                        "radial-gradient(ellipse at 80% 50%,hsla(42,70%,60%,.06) 0%,transparent 70%)",
                        "radial-gradient(ellipse at 20% 50%,hsla(42,70%,60%,.04) 0%,transparent 70%)",
                      ]
                      : ["radial-gradient(ellipse at 50%,transparent 0%,transparent 100%)"],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
                <p className="text-xl font-bold text-foreground mb-2 relative z-10">
                  "The expert in anything was once a beginner."
                </p>
                <p className="text-sm text-muted-foreground relative z-10">Keep pushing forward ✦</p>
              </Card>
            </MagCard>
          </ScrollReveal>

        </div>
      </div>
    </>
  );
};

export default CleanDashboard;