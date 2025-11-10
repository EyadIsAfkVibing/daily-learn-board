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

// START DATE - November 10, 2025
const START_DATE = new Date('2025-11-10');

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
        {
            subjects: [
                { name: "Science", lesson: 3, topic: "Physical Properties of Water" },
                { name: "Algebra", lesson: 1, topic: "Complex Numbers" },
                { name: "History", lesson: 1, topic: "Ancient Civilizations" }
            ]
        },
        // DAY 2
        {
            subjects: [
                { name: "Science", lesson: 4, topic: "Chemical Reactions" },
                { name: "Arabic Reading", lesson: 2, topic: "Modern Literature" },
                { name: "Trigonometry", lesson: 2, topic: "Sine & Cosine Functions" }
            ]
        },
        // DAY 3
        {
            subjects: [
                { name: "Science", lesson: 5, topic: "Force & Motion" },
                { name: "Similarity", lesson: 3, topic: "Triangle Similarity Theorems" },
                { name: "History", lesson: 2, topic: "Medieval Period" }
            ]
        },
        // DAY 4
        {
            subjects: [
                { name: "Science", lesson: 6, topic: "Electricity & Magnetism" },
                { name: "Arabic Balagha", lesson: 3, topic: "Rhetorical Devices" },
                { name: "Algebra", lesson: 5, topic: "Polynomials" }
            ]
        },
        // DAY 5
        {
            subjects: [
                { name: "Science", lesson: 7, topic: "Waves & Sound" },
                { name: "Trigonometry", lesson: 3, topic: "Tangent & Unit Circle" },
                { name: "History", lesson: 3, topic: "Renaissance Era" }
            ]
        },
        // DAY 6
        {
            subjects: [
                { name: "Science", lesson: 8, topic: "Light & Optics" },
                { name: "Arabic AlA'dab", lesson: 1, topic: "Literary Periods" },
                { name: "Similarity", lesson: 4, topic: "Applications" }
            ]
        },
        // DAY 7
        {
            subjects: [
                { name: "Science", lesson: 9, topic: "Atomic Structure" },
                { name: "Algebra", lesson: 6, topic: "Sequences & Series" },
                { name: "History", lesson: 4, topic: "Industrial Revolution" }
            ]
        },
        // DAY 8
        {
            subjects: [
                { name: "Science", lesson: 10, topic: "Periodic Table" },
                { name: "Arabic Nosoos", lesson: 2, topic: "Prose Analysis" },
                { name: "Trigonometry", lesson: 4, topic: "Trigonometric Identities" }
            ]
        },
        // DAY 9
        {
            subjects: [
                { name: "Science", lesson: 11, topic: "Organic Chemistry" },
                { name: "Similarity", lesson: 5, topic: "Proof Techniques" },
                { name: "History", lesson: 5, topic: "World Wars" }
            ]
        },
        // DAY 10
        {
            subjects: [
                { name: "Science", lesson: 12, topic: "Thermodynamics" },
                { name: "Arabic Grammar", lesson: 3, topic: "Advanced Syntax" },
                { name: "Trigonometry", lesson: 5, topic: "Applications & Word Problems" }
            ]
        },
        // DAY 11
        {
            subjects: [
                { name: "History", lesson: 6, topic: "Modern Era" },
                { name: "Arabic Reading", lesson: 3, topic: "Comparative Literature" },
                { name: "Similarity", lesson: 6, topic: "Advanced Problems" }
            ]
        },
        // DAY 12
        {
            subjects: [
                { name: "History", lesson: 7, topic: "Contemporary Issues" },
                { name: "Arabic Balagha", lesson: 4, topic: "Imagery & Symbolism" },
                { name: "Trigonometry", lesson: 6, topic: "Advanced Topics" }
            ]
        },
        // DAY 13
        {
            subjects: [
                { name: "History", lesson: 8, topic: "Future Challenges" },
                { name: "Arabic AlA'dab", lesson: 2, topic: "Famous Authors" },
                { name: "Similarity", lesson: 7, topic: "Review & Practice" }
            ]
        },
        // DAY 14
        {
            subjects: [
                { name: "History", lesson: 9, topic: "Comprehensive Review" },
                { name: "Arabic Nosoos", lesson: 3, topic: "Historical Texts" },
                { name: "Similarity", lesson: 8, topic: "Final Topics" }
            ]
        },
        // DAY 15 - Arabic Only Phase
        {
            subjects: [
                { name: "Arabic Nosoos", lesson: 4, topic: "Contemporary Poetry" },
                { name: "Arabic Grammar", lesson: 4, topic: "Modifiers & Adjectives" }
            ]
        },
        // DAY 16
        {
            subjects: [
                { name: "Arabic Nosoos", lesson: 5, topic: "Critical Analysis" },
                { name: "Arabic Grammar", lesson: 5, topic: "Complex Sentences" }
            ]
        },
        // DAY 17
        {
            subjects: [
                { name: "Arabic Nosoos", lesson: 6, topic: "Advanced Analysis" },
                { name: "Arabic AlA'dab", lesson: 3, topic: "Literary Movements" }
            ]
        },
        // DAY 18 - Review Day
        {
            subjects: [
                { name: "Review", lesson: 1, topic: "Comprehensive Review & Practice" }
            ]
        },
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
    return `${lesson.name} (${lesson.topic})`;
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