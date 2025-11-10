import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { ENHANCED_SCHEDULE, STORAGE_KEY, NOTES_STORAGE_KEY, getLessonDisplayName } from "@/lib/schedule";


interface CalendarViewProps {
    progress: { [key: string]: boolean };
}

const CalendarView = ({ progress }: CalendarViewProps) => {
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    // START AT NOVEMBER 2025 (month 10, since January = 0)
    const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10)); // November 2025

    const isDayComplete = (dayIndex: number, subjectCount: number) => {
        if (!progress) return false; // safeguard
        for (let i = 0; i < subjectCount; i++) {
            const key = `${dayIndex}-${i}`;
            if (!progress[key]) return false;
        }
        return true;
    };

    const getDayProgress = (dayIndex: number, subjectCount: number) => {
        let completed = 0;
        for (let i = 0; i < subjectCount; i++) {
            const key = `${dayIndex}-${i}`;
            if (progress && progress[key]) completed++;

        }
        return Math.round((completed / subjectCount) * 100);
    };

    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const days = [];

        // Add empty cells for days before the month starts
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const scheduleDay = ENHANCED_SCHEDULE.find(s => s.date === dateStr);
            days.push({
                date: day,
                dateStr,
                scheduleDay,
                dayIndex: scheduleDay ? ENHANCED_SCHEDULE.indexOf(scheduleDay) : -1,
            });
        }

        return days;
    }, [currentMonth]);

    const selectedDayData = useMemo(() => {
        if (!selectedDate) return null;
        const scheduleDay = ENHANCED_SCHEDULE.find(s => s.date === selectedDate);
        if (!scheduleDay) return null;
        const dayIndex = ENHANCED_SCHEDULE.indexOf(scheduleDay);
        return { ...scheduleDay, dayIndex };
    }, [selectedDate]);

    const changeMonth = (delta: number) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta));
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-6">
            <Card className="glass p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => changeMonth(-1)}
                        className="glass"
                    >
                        ← Previous
                    </Button>
                    <h3 className="text-2xl font-bold text-primary">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => changeMonth(1)}
                        className="glass"
                    >
                        Next →
                    </Button>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, idx) => {
                        if (!day) {
                            return <div key={`empty-${idx}`} className="aspect-square" />;
                        }

                        const isToday = day.dateStr === today;
                        const hasSchedule = day.scheduleDay !== undefined;
                        const isComplete = hasSchedule && isDayComplete(day.dayIndex, day.scheduleDay.subjects.length);
                        const progressPercent = hasSchedule ? getDayProgress(day.dayIndex, day.scheduleDay.subjects.length) : 0;

                        return (
                            <motion.button
                                key={day.dateStr}
                                whileHover={{ scale: hasSchedule ? 1.05 : 1 }}
                                whileTap={{ scale: hasSchedule ? 0.95 : 1 }}
                                onClick={() => hasSchedule && setSelectedDate(day.dateStr)}
                                className={`
                  aspect-square rounded-xl p-2 transition-all relative
                  ${hasSchedule ? 'cursor-pointer' : 'cursor-default opacity-40'}
                  ${isToday ? 'ring-2 ring-accent' : ''}
                  ${isComplete ? 'bg-success/20 border-2 border-success' : hasSchedule ? 'glass border border-border/50 hover:border-accent/50' : 'glass'}
                  ${selectedDate === day.dateStr ? 'ring-2 ring-primary' : ''}
                `}
                            >
                                <div className="flex flex-col items-center justify-center h-full">
                                    <span className={`text-sm font-semibold ${isComplete ? 'text-success' : 'text-foreground'}`}>
                                        {day.date}
                                    </span>
                                    {hasSchedule && (
                                        <>
                                            {isComplete ? (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="text-lg"
                                                >
                                                    ✓
                                                </motion.div>
                                            ) : (
                                                <div className="w-full h-1 bg-secondary/30 rounded-full mt-1">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progressPercent}%` }}
                                                        className="h-full bg-accent rounded-full"
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {isToday && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-6 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-success/20 border-2 border-success" />
                        <span className="text-muted-foreground">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded glass border border-border/50" />
                        <span className="text-muted-foreground">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded glass opacity-40" />
                        <span className="text-muted-foreground">No Lesson</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded glass ring-2 ring-accent" />
                        <span className="text-muted-foreground">Today</span>
                    </div>
                </div>
            </Card>

            {/* Selected Day Details */}
            <AnimatePresence>
                {selectedDayData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="glass p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-primary">
                                    Day {selectedDayData.day} - {new Date(selectedDate!).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedDate(null)}
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {selectedDayData.subjects.map((subject, idx) => {
                                    const key = `${selectedDayData.dayIndex}-${idx}`;
                                    const isCompleted = progress?.[key] ?? false;

                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`
                        flex items-center justify-between p-3 rounded-lg
                        ${isCompleted ? 'bg-success/10 border border-success/30' : 'glass border border-border/30'}
                      `}
                                        >
                                            <div className="flex items-center gap-3">
                                                {isCompleted ? (
                                                    <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center text-white text-xs">
                                                        ✓
                                                    </div>
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-border" />
                                                )}
                                                <div>
                                                    <div className="font-semibold text-sm">{subject.name}</div>
                                                    <div className="text-xs text-muted-foreground">Lesson {subject.lesson}: {subject.topic}</div>
                                                </div>
                                            </div>
                                            {isCompleted && (
                                                <span className="text-xs text-success font-semibold">Completed</span>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CalendarView;