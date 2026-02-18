// Enhanced Schedule with Custom Lesson Names and Topics

export interface Lesson {
    name: string;
    lesson: number;
    topic: string;
}

export interface ScheduleDay {
    day: number;
    date: string;
    subjects: Lesson[];
}

// START DATE - February 18, 2026 (lessons begin)
const START_DATE = new Date('2026-02-18');

// STORAGE KEYS
export const STORAGE_KEY = "study-dashboard-progress";
export const NOTES_STORAGE_KEY = "study-dashboard-notes";
export const TIMER_STORAGE_KEY = "study-dashboard-timer";
export const SCHEDULES_STORAGE_KEY = "study-dashboard-schedules";
export const ACTIVE_SCHEDULE_KEY = "study-dashboard-active-schedule";

// All lessons to distribute — 2 per day, balanced across subjects
const ALL_LESSONS: Lesson[] = [
    // Distribute evenly: interleave subjects for variety
    // Day 1
    { name: "Nahw", lesson: 1, topic: "" },
    { name: "Trigonometry", lesson: 1, topic: "" },
    // Day 2
    { name: "Science", lesson: 1, topic: "" },
    { name: "History", lesson: 1, topic: "" },
    // Day 3
    { name: "Nosoos", lesson: 1, topic: "" },
    { name: "Matrices", lesson: 1, topic: "" },
    // Day 4
    { name: "Nahw", lesson: 2, topic: "" },
    { name: "A'dab", lesson: 1, topic: "" },
    // Day 5
    { name: "Straight Line", lesson: 1, topic: "" },
    { name: "Science", lesson: 2, topic: "" },
    // Day 6
    { name: "Trigonometry", lesson: 2, topic: "" },
    { name: "Vectors", lesson: 1, topic: "" },
    // Day 7
    { name: "Nahw", lesson: 3, topic: "" },
    { name: "Reading", lesson: 1, topic: "" },
    // Day 8
    { name: "History", lesson: 2, topic: "" },
    { name: "Nosoos", lesson: 2, topic: "" },
    // Day 9
    { name: "Balagha", lesson: 1, topic: "" },
    { name: "Matrices", lesson: 2, topic: "" },
    // Day 10
    { name: "Science", lesson: 3, topic: "" },
    { name: "Nahw", lesson: 4, topic: "" },
    // Day 11
    { name: "Trigonometry", lesson: 3, topic: "" },
    { name: "Linear Programming", lesson: 1, topic: "" },
    // Day 12
    { name: "A'dab", lesson: 2, topic: "" },
    { name: "Nosoos", lesson: 3, topic: "" },
    // Day 13
    { name: "Straight Line", lesson: 2, topic: "" },
    { name: "Nahw", lesson: 5, topic: "" },
    // Day 14
    { name: "Science", lesson: 4, topic: "" },
    { name: "History", lesson: 3, topic: "" },
    // Day 15
    { name: "Trigonometry", lesson: 4, topic: "" },
    { name: "Reading", lesson: 2, topic: "" },
    // Day 16
    { name: "Matrices", lesson: 3, topic: "" },
    { name: "Nahw", lesson: 6, topic: "" },
    // Day 17
    { name: "Vectors", lesson: 2, topic: "" },
    { name: "Nosoos", lesson: 4, topic: "" },
    // Day 18
    { name: "Science", lesson: 5, topic: "" },
    { name: "A'dab", lesson: 3, topic: "" },
    // Day 19
    { name: "Trigonometry", lesson: 5, topic: "" },
    { name: "Nahw", lesson: 7, topic: "" },
    // Day 20
    { name: "History", lesson: 4, topic: "" },
    { name: "Straight Line", lesson: 3, topic: "" },
    // Day 21
    { name: "Nosoos", lesson: 5, topic: "" },
    { name: "Matrices", lesson: 4, topic: "" },
    // Day 22
    { name: "Science", lesson: 6, topic: "" },
    { name: "Nahw", lesson: 8, topic: "" },
    // Day 23
    { name: "Trigonometry", lesson: 6, topic: "" },
    { name: "Balagha", lesson: 2, topic: "" },
    // Day 24
    { name: "Reading", lesson: 3, topic: "" },
    { name: "History", lesson: 5, topic: "" },
    // Day 25
    { name: "A'dab", lesson: 4, topic: "" },
    { name: "Nahw", lesson: 9, topic: "" },
    // Day 26
    { name: "Vectors", lesson: 3, topic: "" },
    { name: "Science", lesson: 7, topic: "" },
    // Day 27
    { name: "Nosoos", lesson: 6, topic: "" },
    { name: "Matrices", lesson: 5, topic: "" },
    // Day 28
    { name: "Trigonometry", lesson: 7, topic: "" },
    { name: "Nahw", lesson: 10, topic: "" },
    // Day 29
    { name: "Straight Line", lesson: 4, topic: "" },
    { name: "Linear Programming", lesson: 2, topic: "" },
    // Day 30
    { name: "Science", lesson: 8, topic: "" },
    { name: "History", lesson: 6, topic: "" },
];

// Function to generate dates dynamically — 2 lessons per day
const generateScheduleDates = (startDate: Date = START_DATE) => {
    const schedule: ScheduleDay[] = [];
    const lessonsPerDay = 2;
    const totalDays = Math.ceil(ALL_LESSONS.length / lessonsPerDay);

    for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + dayIdx);

        const dayLessons = ALL_LESSONS.slice(
            dayIdx * lessonsPerDay,
            dayIdx * lessonsPerDay + lessonsPerDay
        );

        schedule.push({
            day: dayIdx + 1,
            date: date.toISOString().split('T')[0],
            subjects: dayLessons,
        });
    }

    return schedule;
};

export const ENHANCED_SCHEDULE: ScheduleDay[] = generateScheduleDates();

// Helper function to get lesson display name
export const getLessonDisplayName = (lesson: Lesson): string => {
    return `${lesson.name} – Lesson ${lesson.lesson}`;
};

// Helper function to check if a day is complete
export const isDayComplete = (
    dayIndex: number,
    subjectCount: number,
    progress: { [key: string]: boolean }
): boolean => {
    for (let i = 0; i < subjectCount; i++) {
        const key = `${dayIndex}-${i}`;
        if (!progress[key]) return false;
    }
    return true;
};

// Helper function to get day progress percentage
export const getDayProgress = (
    dayIndex: number,
    subjectCount: number,
    progress: { [key: string]: boolean }
): number => {
    let completed = 0;
    for (let i = 0; i < subjectCount; i++) {
        const key = `${dayIndex}-${i}`;
        if (progress[key]) completed++;
    }
    return Math.round((completed / subjectCount) * 100);
};

// For backwards compatibility
export const SCHEDULE = ENHANCED_SCHEDULE;

// ==================== SCHEDULE MANAGEMENT FUNCTIONS ====================

export interface SavedSchedule {
    id: string;
    name: string;
    startDate: string;
    createdAt: string;
    schedule: ScheduleDay[];
}

export const addSchedule = (name: string, startDate: Date): SavedSchedule => {
    const schedules = getAllSchedules();
    const newSchedule: SavedSchedule = {
        id: `schedule-${Date.now()}`,
        name,
        startDate: startDate.toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        schedule: generateScheduleDates(startDate)
    };
    schedules.push(newSchedule);
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
    if (schedules.length === 1) {
        setActiveSchedule(newSchedule.id);
    }
    return newSchedule;
};

export const deleteSchedule = (scheduleId: string): boolean => {
    const schedules = getAllSchedules();
    const index = schedules.findIndex(s => s.id === scheduleId);
    if (index === -1) return false;
    schedules.splice(index, 1);
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
    const activeId = getActiveScheduleId();
    if (activeId === scheduleId) {
        localStorage.removeItem(ACTIVE_SCHEDULE_KEY);
        if (schedules.length > 0) {
            setActiveSchedule(schedules[0].id);
        }
    }
    return true;
};

export const getAllSchedules = (): SavedSchedule[] => {
    const stored = localStorage.getItem(SCHEDULES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const getScheduleById = (scheduleId: string): SavedSchedule | null => {
    const schedules = getAllSchedules();
    return schedules.find(s => s.id === scheduleId) || null;
};

export const setActiveSchedule = (scheduleId: string): void => {
    localStorage.setItem(ACTIVE_SCHEDULE_KEY, scheduleId);
};

export const getActiveScheduleId = (): string | null => {
    return localStorage.getItem(ACTIVE_SCHEDULE_KEY);
};

export const getActiveSchedule = (): SavedSchedule | null => {
    const activeId = getActiveScheduleId();
    return activeId ? getScheduleById(activeId) : null;
};
