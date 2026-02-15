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

// START DATE - February 15, 2026
const START_DATE = new Date('2026-02-15');

// STORAGE KEYS
export const STORAGE_KEY = "study-dashboard-progress";
export const NOTES_STORAGE_KEY = "study-dashboard-notes";
export const TIMER_STORAGE_KEY = "study-dashboard-timer";
export const SCHEDULES_STORAGE_KEY = "study-dashboard-schedules";
export const ACTIVE_SCHEDULE_KEY = "study-dashboard-active-schedule";

// Function to generate dates dynamically
const generateScheduleDates = (startDate: Date = START_DATE) => {
    const schedule: ScheduleDay[] = [];
    const baseSchedule = [
        // DAY 1
        { subjects: [
            { name: "Nahw", lesson: 1, topic: "" },
            { name: "Science", lesson: 1, topic: "" },
            { name: "Trigonometry", lesson: 1, topic: "" },
        ]},
        // DAY 2
        { subjects: [
            { name: "History", lesson: 1, topic: "" },
            { name: "Nosoos", lesson: 1, topic: "" },
            { name: "Matrices", lesson: 1, topic: "" },
        ]},
        // DAY 3
        { subjects: [
            { name: "Nahw", lesson: 2, topic: "" },
            { name: "A'dab", lesson: 1, topic: "" },
            { name: "Straight Line", lesson: 1, topic: "" },
        ]},
        // DAY 4
        { subjects: [
            { name: "Science", lesson: 2, topic: "" },
            { name: "Reading", lesson: 1, topic: "" },
            { name: "Vectors", lesson: 1, topic: "" },
        ]},
        // DAY 5
        { subjects: [
            { name: "Nahw", lesson: 3, topic: "" },
            { name: "Trigonometry", lesson: 2, topic: "" },
            { name: "Balagha", lesson: 1, topic: "" },
        ]},
        // DAY 6
        { subjects: [
            { name: "History", lesson: 2, topic: "" },
            { name: "Nosoos", lesson: 2, topic: "" },
            { name: "Linear Programming", lesson: 1, topic: "" },
        ]},
        // DAY 7
        { subjects: [
            { name: "Nahw", lesson: 4, topic: "" },
            { name: "Science", lesson: 3, topic: "" },
            { name: "Matrices", lesson: 2, topic: "" },
        ]},
        // DAY 8
        { subjects: [
            { name: "A'dab", lesson: 2, topic: "" },
            { name: "Trigonometry", lesson: 3, topic: "" },
            { name: "Straight Line", lesson: 2, topic: "" },
        ]},
        // DAY 9
        { subjects: [
            { name: "Nahw", lesson: 5, topic: "" },
            { name: "Nosoos", lesson: 3, topic: "" },
            { name: "Vectors", lesson: 2, topic: "" },
        ]},
        // DAY 10
        { subjects: [
            { name: "Science", lesson: 4, topic: "" },
            { name: "History", lesson: 3, topic: "" },
            { name: "Reading", lesson: 2, topic: "" },
        ]},
        // DAY 11
        { subjects: [
            { name: "Nahw", lesson: 6, topic: "" },
            { name: "Trigonometry", lesson: 4, topic: "" },
            { name: "Matrices", lesson: 3, topic: "" },
        ]},
        // DAY 12
        { subjects: [
            { name: "Nosoos", lesson: 4, topic: "" },
            { name: "A'dab", lesson: 3, topic: "" },
            { name: "Balagha", lesson: 2, topic: "" },
        ]},
        // DAY 13
        { subjects: [
            { name: "Nahw", lesson: 7, topic: "" },
            { name: "Science", lesson: 5, topic: "" },
            { name: "Straight Line", lesson: 3, topic: "" },
        ]},
        // DAY 14
        { subjects: [
            { name: "History", lesson: 4, topic: "" },
            { name: "Trigonometry", lesson: 5, topic: "" },
            { name: "Linear Programming", lesson: 2, topic: "" },
        ]},
        // DAY 15
        { subjects: [
            { name: "Nahw", lesson: 8, topic: "" },
            { name: "Nosoos", lesson: 5, topic: "" },
            { name: "Matrices", lesson: 4, topic: "" },
        ]},
        // DAY 16
        { subjects: [
            { name: "Science", lesson: 6, topic: "" },
            { name: "Vectors", lesson: 3, topic: "" },
            { name: "Reading", lesson: 3, topic: "" },
        ]},
        // DAY 17
        { subjects: [
            { name: "Nahw", lesson: 9, topic: "" },
            { name: "Trigonometry", lesson: 6, topic: "" },
            { name: "A'dab", lesson: 4, topic: "" },
        ]},
        // DAY 18
        { subjects: [
            { name: "History", lesson: 5, topic: "" },
            { name: "Science", lesson: 7, topic: "" },
            { name: "Straight Line", lesson: 4, topic: "" },
        ]},
        // DAY 19
        { subjects: [
            { name: "Nahw", lesson: 10, topic: "" },
            { name: "Nosoos", lesson: 6, topic: "" },
            { name: "Matrices", lesson: 5, topic: "" },
        ]},
        // DAY 20
        { subjects: [
            { name: "Science", lesson: 8, topic: "" },
            { name: "History", lesson: 6, topic: "" },
            { name: "Trigonometry", lesson: 7, topic: "" },
        ]},
    ];

    baseSchedule.forEach((dayData, index) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + index);

        schedule.push({
            day: index + 1,
            date: date.toISOString().split('T')[0],
            subjects: dayData.subjects
        });
    });

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