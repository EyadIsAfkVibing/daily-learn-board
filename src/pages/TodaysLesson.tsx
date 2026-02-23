/**
 * TodaysLesson.tsx — Rebuilt
 * ─────────────────────────────────────────────────────────────────
 * ROOT BUG FIX:
 *   Old code: allComplete = completedLessons.size === subjects.length
 *   `completedLessons` starts as new Set() → size = 0
 *   On mount, if subjects haven't loaded yet → length = 0 too
 *   So 0 === 0 → true → "All Done" screen shown immediately
 *   Then schedule loads → flickers to lessons → header disappears
 *
 *   Fix: NEVER use a local Set to determine allComplete.
 *   Derive everything from profile.progress (the real source of truth).
 *   Local state is only used as an optimistic overlay for instant UI.
 *   Three explicit states: loading, allDone, noSchedule, lessonList.
 */

import FloatingVideoCard from "@/components/FloatingVideoCard";
import NormalCanvas from "@/components/NormalCanvas";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfileContext";
import type { ProfileLesson } from "@/lib/ProfileManager";

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// ─── Priority config ──────────────────────────────────────────────
const PRI: Record<string, { color: string; bg: string; border: string; emoji: string }> = {
    High: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", emoji: "🔴" },
    Medium: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", emoji: "🔵" },
    Low: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", emoji: "🟢" },
};

// ─── Animated progress ring ───────────────────────────────────────
const Ring = ({
    pct, size = 120, stroke = 5,
    color = "hsl(var(--primary))",
    children,
}: {
    pct: number; size?: number; stroke?: number;
    color?: string; children?: React.ReactNode;
}) => {
    const r = (size - stroke * 2) / 2;
    const circ = 2 * Math.PI * r;
    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke="hsla(0,0%,100%,0.07)" strokeWidth={stroke} />
                <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth={stroke} strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
                    transition={{ duration: 1.3, ease }} />
            </svg>
            {children && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {children}
                </div>
            )}
        </div>
    );
};

// ─── Floating ambient orbs (zero canvas cost) ─────────────────────
const Orbs = () => (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[
            { x: 12, y: 20, sz: 320, h: 220, dur: 11, del: 0 },
            { x: 72, y: 55, sz: 260, h: 200, dur: 14, del: 2 },
            { x: 40, y: 78, sz: 200, h: 245, dur: 9, del: 1 },
            { x: 88, y: 18, sz: 280, h: 210, dur: 13, del: 3 },
            { x: 25, y: 60, sz: 180, h: 230, dur: 10, del: 1.5 },
        ].map((o, i) => (
            <motion.div key={i}
                className="absolute rounded-full"
                style={{
                    left: `${o.x}%`, top: `${o.y}%`,
                    width: o.sz, height: o.sz,
                    background: `radial-gradient(circle,hsla(${o.h},60%,55%,0.07) 0%,transparent 70%)`,
                    transform: "translate(-50%,-50%)",
                }}
                animate={{ y: [0, -28, 0, 22, 0], x: [0, 14, -10, 6, 0], scale: [1, 1.08, 0.96, 1.04, 1] }}
                transition={{ duration: o.dur, delay: o.del, repeat: Infinity, ease: "easeInOut" }}
            />
        ))}
    </div>
);

// ─── 3D tilt lesson card ──────────────────────────────────────────
const LessonCard = ({
    subject, isCompleted, onStart, delay,
}: {
    subject: ProfileLesson; isCompleted: boolean;
    onStart: () => void; delay: number;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const rotX = useTransform(my, [-60, 60], [7, -7]);
    const rotY = useTransform(mx, [-100, 100], [-7, 7]);

    const onMove = (e: React.MouseEvent) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set(e.clientX - r.left - r.width / 2);
        my.set(e.clientY - r.top - r.height / 2);
    };

    const pri = subject.priority ? PRI[subject.priority] : PRI.Medium;
    const name = `${subject.subjectName} – Lesson ${subject.lessonNumber}`;

    return (
        <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={() => { mx.set(0); my.set(0); }}
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, ease }}
            style={{ perspective: 900, transformStyle: "preserve-3d" }}>

            <motion.div style={{ rotateX: rotX, rotateY: rotY }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}>
                <Card
                    onClick={() => !isCompleted && onStart()}
                    className={`relative overflow-hidden transition-all duration-300 group
            ${isCompleted
                            ? "glass opacity-50 cursor-default"
                            : "glass-strong cursor-pointer hover:ring-1 hover:ring-primary/35 hover:shadow-lg hover:shadow-primary/10"}`}
                >
                    {/* Top accent line */}
                    <div className="absolute top-0 inset-x-0 h-px"
                        style={{
                            background: isCompleted
                                ? "hsla(0,0%,100%,0.08)"
                                : "linear-gradient(90deg,hsl(var(--primary)),hsl(var(--accent)),transparent)"
                        }} />

                    {/* Hover shimmer */}
                    {!isCompleted && (
                        <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                            style={{
                                background: "linear-gradient(120deg,transparent 20%,hsla(0,0%,100%,0.04) 50%,transparent 80%)",
                                backgroundSize: "200% 100%", transition: "opacity .4s",
                            }}
                            animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                            transition={{ duration: 2.6, repeat: Infinity, ease: "linear" }} />
                    )}

                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-foreground truncate mb-1">{name}</h3>
                                {subject.topic && (
                                    <p className="text-sm text-muted-foreground">{subject.topic}</p>
                                )}
                            </div>

                            {isCompleted ? (
                                <motion.div
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 14 }}
                                    className="w-11 h-11 rounded-full bg-green-500/15 border border-green-500/30
                    flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd" />
                                    </svg>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20
                    flex items-center justify-center flex-shrink-0 text-xl"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>
                                    🎯
                                </motion.div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-5">
                            {subject.priority && (
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border
                  ${pri.color} ${pri.bg} ${pri.border}`}>
                                    {pri.emoji} {subject.priority}
                                </span>
                            )}
                            {subject.duration && (
                                <span className="text-xs text-muted-foreground/55">⏱ {subject.duration} min</span>
                            )}
                        </div>

                        {isCompleted ? (
                            <p className="text-sm text-green-400/80 font-medium flex items-center gap-1.5">
                                ✓ Completed
                            </p>
                        ) : (
                            <motion.div whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.97 }}>
                                <Button className="w-full premium-button py-5 text-sm font-semibold">
                                    Enter Focus Mode →
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════
// FOCUS MODE
// ═══════════════════════════════════════════════════════════════════
const FocusMode = ({
    lesson, dayIndex, lessonIndex, notes,
    onClose, onComplete, onNoteChange,
}: {
    lesson: ProfileLesson; dayIndex: number; lessonIndex: number;
    notes: Record<string, string>;
    onClose: () => void; onComplete: () => void; onNoteChange: (v: string) => void;
}) => {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(true);
    const [ytUrl, setYtUrl] = useState("");
    const [videoId, setVideoId] = useState<string | null>(null);

    const noteKey = `${dayIndex}-${lessonIndex}`;
    const maxSecs = 25 * 60;
    const elapsed = maxSecs - (minutes * 60 + seconds);
    const pct = Math.round((elapsed / maxSecs) * 100);

    useEffect(() => {
        if (!running) return;
        const id = setInterval(() => {
            setSeconds(s => {
                if (s > 0) return s - 1;
                setMinutes(m => {
                    if (m === 0) {
                        setRunning(false);
                        toast.success("Focus session complete! 🎉");
                        confetti({ particleCount: 120, spread: 70 });
                        return 25;
                    }
                    return m - 1;
                });
                return 59;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [running]);

    const addVideo = () => {
        const m = ytUrl.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/);
        if (m) { setVideoId(m[1]); toast.success("Video added!"); setYtUrl(""); }
        else toast.error("Invalid YouTube link.");
    };

    const name = `${lesson.subjectName} – Lesson ${lesson.lessonNumber}`;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex overflow-hidden"
            style={{ background: "radial-gradient(ellipse at 35% 20%,hsl(248,52%,9%),hsl(238,58%,4%) 75%)" }}>

            <Orbs />

            {/* Breathing ambient glow */}
            <motion.div className="absolute inset-0 pointer-events-none"
                animate={{
                    background: [
                        "radial-gradient(circle at 18% 45%,hsla(260,65%,52%,0.13) 0%,transparent 52%)",
                        "radial-gradient(circle at 78% 32%,hsla(220,72%,58%,0.13) 0%,transparent 52%)",
                        "radial-gradient(circle at 48% 78%,hsla(260,65%,52%,0.11) 0%,transparent 52%)",
                    ]
                }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />

            {/* Main */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
                <button onClick={onClose}
                    className="absolute top-5 left-5 flex items-center gap-1.5 text-sm
            text-white/40 hover:text-white transition-colors">
                    <motion.span whileHover={{ x: -3 }} transition={{ duration: 0.18 }}>←</motion.span>
                    Back
                </button>

                <motion.div className="text-center mb-10"
                    initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, ease }}>
                    <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">
                        Focus Mode · Active
                    </p>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{name}</h1>
                    {lesson.topic && <p className="text-white/40 mt-2">{lesson.topic}</p>}
                </motion.div>

                {/* Timer ring */}
                <motion.div className="mb-8"
                    initial={{ scale: 0.82, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.18, ease }}>
                    <Ring pct={pct} size={210} stroke={6}
                        color={running ? "hsl(var(--primary))" : "hsla(0,0%,100%,0.18)"}>
                        <div className="text-center">
                            <div className="text-5xl font-bold font-mono text-white tabular-nums leading-none">
                                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                            </div>
                            <p className="text-xs text-white/30 mt-2 uppercase tracking-wider">
                                {running ? "focusing…" : "paused"}
                            </p>
                        </div>
                    </Ring>
                </motion.div>

                {/* Controls */}
                <motion.div className="flex items-center gap-3 mb-8"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26, ease }}>
                    <button onClick={() => setRunning(r => !r)}
                        className="w-14 h-14 rounded-full bg-primary/15 border border-primary/30
              flex items-center justify-center text-xl
              hover:bg-primary/25 hover:scale-105 active:scale-95 transition-all duration-200">
                        {running ? "⏸" : "▶️"}
                    </button>
                    <button onClick={() => { setRunning(false); setMinutes(25); setSeconds(0); }}
                        className="w-10 h-10 rounded-full bg-white/6 border border-white/10
              flex items-center justify-center text-base
              hover:bg-white/12 hover:scale-105 active:scale-95 transition-all duration-200">
                        🔄
                    </button>
                </motion.div>

                {/* CTA + YouTube */}
                <motion.div className="w-full max-w-sm space-y-3"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.34, ease }}>
                    <motion.button onClick={onComplete}
                        className="w-full py-4 rounded-2xl font-bold text-base premium-button"
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        ✓ Mark as Complete
                    </motion.button>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Paste YouTube link…"
                            value={ytUrl} onChange={e => setYtUrl(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && addVideo()}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-white/6 border border-white/10
                text-sm text-white placeholder:text-white/25
                focus:outline-none focus:border-white/25 transition-all" />
                        <button onClick={addVideo}
                            className="px-4 py-2.5 rounded-xl bg-primary/14 border border-primary/24
                text-sm text-primary font-semibold hover:bg-primary/24 transition-all whitespace-nowrap">
                            🎬 Add
                        </button>
                    </div>
                </motion.div>
            </div>

            {videoId && <FloatingVideoCard videoId={videoId} onClose={() => setVideoId(null)} />}

            {/* Notes sidebar */}
            <motion.aside
                initial={{ x: 340, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.14, duration: 0.4, ease }}
                className="w-80 lg:w-96 flex-shrink-0 border-l border-white/8 bg-black/28
          backdrop-blur-2xl flex flex-col p-6 relative z-10">
                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">
                    ✏️ Lesson Notes
                </h3>
                <Textarea
                    value={notes[noteKey] || ""}
                    onChange={e => onNoteChange(e.target.value)}
                    placeholder="Key concepts, formulas, insights…"
                    className="flex-1 bg-white/4 border-white/10 text-white
            placeholder:text-white/20 resize-none focus:border-white/22
            text-sm leading-relaxed min-h-[280px]" />
                <p className="text-xs text-white/18 mt-3">💡 Auto-saved per lesson</p>
            </motion.aside>
        </motion.div>
    );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
export default function TodaysLesson() {
    const navigate = useNavigate();
    const { profile, markLesson, updateNote } = useProfile();

    // Optimistic local overlay — only for instant UI after marking done
    const [localDone, setLocalDone] = useState<Record<string, true>>({});

    const [focusLesson, setFocusLesson] = useState<ProfileLesson | null>(null);
    const [focusIndex, setFocusIndex] = useState(0);

    useEffect(() => {
        if (!profile) navigate("/");
    }, [profile, navigate]);

    // ── THE FIX ────────────────────────────────────────────────────
    // Scan schedule for the first day that isn't fully complete.
    // Completion = profile.progress[key] OR localDone[key].
    // This runs on every render — no stale local Set.
    const { todaySchedule, dayIndex } = useMemo(() => {
        if (!profile) return { todaySchedule: null, dayIndex: -1 };
        for (let i = 0; i < profile.schedule.length; i++) {
            const day = profile.schedule[i];
            const allDone = day.subjects.every(
                (_: ProfileLesson, j: number) => profile.progress[`${i}-${j}`] || localDone[`${i}-${j}`]
            );
            if (!allDone) return { todaySchedule: day, dayIndex: i };
        }
        return { todaySchedule: null, dayIndex: -1 };
    }, [profile, localDone]);

    // ── Three clean states, never ambiguous ────────────────────────
    const isLoading = !profile;
    const allDone = !!profile && !todaySchedule && profile.schedule.length > 0;
    const noSchedule = !!profile && !todaySchedule && profile.schedule.length === 0;

    const isComplete = useCallback((j: number) => {
        const k = `${dayIndex}-${j}`;
        return !!(profile?.progress[k] || localDone[k]);
    }, [profile, localDone, dayIndex]);

    const completedCount = todaySchedule
        ? todaySchedule.subjects.filter((_: ProfileLesson, j: number) => isComplete(j)).length : 0;
    const totalCount = todaySchedule?.subjects.length ?? 0;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const openFocus = (subject: ProfileLesson, idx: number) => {
        if (isComplete(idx)) { toast.info("Already completed!"); return; }
        setFocusLesson(subject);
        setFocusIndex(idx);
    };

    const handleComplete = () => {
        if (!todaySchedule || dayIndex < 0 || !focusLesson) return;
        const key = `${dayIndex}-${focusIndex}`;
        markLesson(key, true);
        setLocalDone(prev => ({ ...prev, [key]: true }));
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
        toast.success("Lesson complete! 🎉");
        setFocusLesson(null);
    };

    const handleNote = (val: string) => {
        if (dayIndex < 0) return;
        updateNote(`${dayIndex}-${focusIndex}`, val);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.p className="text-muted-foreground text-lg"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.6, repeat: Infinity }}>
                    Loading your schedule…
                </motion.p>
            </div>
        );
    }

    return (
        <>
            <NormalCanvas scrollY={0} />
            <Orbs />

            <AnimatePresence>
                {focusLesson && (
                    <FocusMode
                        lesson={focusLesson}
                        dayIndex={dayIndex}
                        lessonIndex={focusIndex}
                        notes={profile?.notes || {}}
                        onClose={() => setFocusLesson(null)}
                        onComplete={handleComplete}
                        onNoteChange={handleNote}
                    />
                )}
            </AnimatePresence>

            <div className="min-h-screen relative z-10 px-4 py-10 md:py-14">
                <div className="max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">

                        {allDone && (
                            <motion.div key="done"
                                initial={{ opacity: 0, scale: 0.88 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="min-h-[80vh] flex flex-col items-center justify-center text-center">
                                <motion.div className="text-8xl mb-6"
                                    animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.12, 1] }}
                                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
                                    🏆
                                </motion.div>
                                <h2 className="text-4xl font-extrabold text-foreground mb-3">Schedule Complete!</h2>
                                <p className="text-muted-foreground text-lg mb-8 max-w-md">
                                    You've finished every lesson. Outstanding work.
                                </p>
                                <Button onClick={() => navigate("/dashboard")} className="premium-button px-10 py-5 text-base">
                                    View Dashboard →
                                </Button>
                            </motion.div>
                        )}

                        {noSchedule && (
                            <motion.div key="empty"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
                                <div className="text-6xl opacity-30">📚</div>
                                <h3 className="text-xl font-bold text-foreground">No schedule set up</h3>
                                <p className="text-muted-foreground text-sm">Your profile doesn't have a study plan yet.</p>
                                <Button onClick={() => navigate("/dashboard")} className="premium-button px-8">
                                    Go to Dashboard →
                                </Button>
                            </motion.div>
                        )}

                        {todaySchedule && (
                            <motion.div key="lessons"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

                                {/* ── Header ── */}
                                <motion.div className="text-center mb-10"
                                    initial={{ opacity: 0, y: -22 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, ease }}>

                                    <p className="text-xs font-semibold text-muted-foreground/45 uppercase tracking-widest mb-2">
                                        {new Date(todaySchedule.date).toLocaleDateString("en-US", {
                                            weekday: "long", month: "long", day: "numeric",
                                        })}
                                    </p>

                                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-2">
                                        Day {todaySchedule.day}
                                        <span className="holographic ml-3">✦</span>
                                    </h1>

                                    <p className="text-muted-foreground mb-6">Next Lessons</p>

                                    {/* Progress ring */}
                                    <div className="flex flex-col items-center gap-2">
                                        <Ring pct={pct} size={94} stroke={5}>
                                            <span className="text-lg font-bold tabular-nums text-foreground">{pct}%</span>
                                        </Ring>
                                        <p className="text-sm text-muted-foreground">{completedCount} of {totalCount} done</p>
                                    </div>
                                </motion.div>

                                {/* ── Cards ── */}
                                <div className="grid gap-4 md:grid-cols-2 mb-10">
                                    {todaySchedule.subjects.map((s: ProfileLesson, i: number) => (
                                        <LessonCard key={i}
                                            subject={s}
                                            isCompleted={isComplete(i)}
                                            onStart={() => openFocus(s, i)}
                                            delay={0.07 * i}
                                        />
                                    ))}
                                </div>

                                {/* ── Skip ── */}
                                <motion.div className="text-center"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    transition={{ delay: 0.45 }}>
                                    <button onClick={() => navigate("/dashboard")}
                                        className="text-sm text-muted-foreground/55 hover:text-muted-foreground
                      transition-colors underline underline-offset-4">
                                        Skip to Dashboard →
                                    </button>
                                </motion.div>

                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </>
    );
}