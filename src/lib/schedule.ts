// Enhanced Schedule with Custom Lesson Names and Topics
// This replaces the basic SCHEDULE constant in all your files

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
        // ARABIC READING (3 lessons total)
        { subjects: [{ name: "Arabic Reading", lesson: 1, topic: "Introduction to Classical Texts" }] },
        { subjects: [{ name: "Arabic Reading", lesson: 2, topic: "Modern Literature" }] },
        { subjects: [{ name: "Arabic Reading", lesson: 3, topic: "Comparative Literature" }] },

        // ARABIC BALAGHA (4 lessons total)
        { subjects: [{ name: "Arabic Balagha", lesson: 1, topic: "Figures of Speech" }] },
        { subjects: [{ name: "Arabic Balagha", lesson: 2, topic: "Metaphors & Similes" }] },
        { subjects: [{ name: "Arabic Balagha", lesson: 3, topic: "Rhetorical Devices" }] },
        { subjects: [{ name: "Arabic Balagha", lesson: 4, topic: "Imagery & Symbolism" }] },

        // ARABIC A'DAB (3 lessons total)
        { subjects: [{ name: "Arabic AlA'dab", lesson: 1, topic: "Literary Periods" }] },
        { subjects: [{ name: "Arabic AlA'dab", lesson: 2, topic: "Famous Authors" }] },
        { subjects: [{ name: "Arabic AlA'dab", lesson: 3, topic: "Literary Movements" }] },

        // ARABIC NOSOOS (6 lessons total)
        { subjects: [{ name: "Arabic Nosoos", lesson: 1, topic: "Poetry Analysis Basics" }] },
        { subjects: [{ name: "Arabic Nosoos", lesson: 2, topic: "Prose Analysis" }] },
        { subjects: [{ name: "Arabic Nosoos", lesson: 3, topic: "Historical Texts" }] },
        { subjects: [{ name: "Arabic Nosoos", lesson: 4, topic: "Contemporary Poetry" }] },
        { subjects: [{ name: "Arabic Nosoos", lesson: 5, topic: "Critical Analysis" }] },
        { subjects: [{ name: "Arabic Nosoos", lesson: 6, topic: "Advanced Analysis" }] },

        // ARABIC GRAMMAR (5 lessons total)
        { subjects: [{ name: "Arabic Grammar", lesson: 1, topic: "Sentence Structure" }] },
        { subjects: [{ name: "Arabic Grammar", lesson: 2, topic: "Verb Conjugation" }] },
        { subjects: [{ name: "Arabic Grammar", lesson: 3, topic: "Advanced Syntax" }] },
        { subjects: [{ name: "Arabic Grammar", lesson: 4, topic: "Modifiers & Adjectives" }] },
        { subjects: [{ name: "Arabic Grammar", lesson: 5, topic: "Complex Sentences" }] },

        // SCIENCE (14 lessons total)
        { subjects: [{ name: "Science", lesson: 1, topic: "Scientific Method" }] },
        { subjects: [{ name: "Science", lesson: 2, topic: "Lab Safety & Equipment" }] },
        { subjects: [{ name: "Science", lesson: 3, topic: "Matter & Energy" }] },
        { subjects: [{ name: "Science", lesson: 4, topic: "Chemical Reactions" }] },
        { subjects: [{ name: "Science", lesson: 5, topic: "Force & Motion" }] },
        { subjects: [{ name: "Science", lesson: 6, topic: "Electricity & Magnetism" }] },
        { subjects: [{ name: "Science", lesson: 7, topic: "Waves & Sound" }] },
        { subjects: [{ name: "Science", lesson: 8, topic: "Light & Optics" }] },
        { subjects: [{ name: "Science", lesson: 9, topic: "Atomic Structure" }] },
        { subjects: [{ name: "Science", lesson: 10, topic: "Periodic Table" }] },
        { subjects: [{ name: "Science", lesson: 11, topic: "Organic Chemistry" }] },
        { subjects: [{ name: "Science", lesson: 12, topic: "Thermodynamics" }] },
        { subjects: [{ name: "Science", lesson: 13, topic: "Genetics & DNA" }] },
        { subjects: [{ name: "Science", lesson: 14, topic: "Evolution & Natural Selection" }] },

        // ALGEBRA (6 lessons total)
        { subjects: [{ name: "Algebra", lesson: 1, topic: "Complex Numbers" }] },
        { subjects: [{ name: "Algebra", lesson: 2, topic: "Quadratic Equations" }] },
        { subjects: [{ name: "Algebra", lesson: 3, topic: "Functions & Graphs" }] },
        { subjects: [{ name: "Algebra", lesson: 4, topic: "Logarithms & Exponents" }] },
        { subjects: [{ name: "Algebra", lesson: 5, topic: "Polynomials" }] },
        { subjects: [{ name: "Algebra", lesson: 6, topic: "Sequences & Series" }] },

        // TRIGONOMETRY (6 lessons total)
        { subjects: [{ name: "Trigonometry", lesson: 1, topic: "Angles & Radians" }] },
        { subjects: [{ name: "Trigonometry", lesson: 2, topic: "Sine & Cosine Functions" }] },
        { subjects: [{ name: "Trigonometry", lesson: 3, topic: "Tangent & Unit Circle" }] },
        { subjects: [{ name: "Trigonometry", lesson: 4, topic: "Trigonometric Identities" }] },
        { subjects: [{ name: "Trigonometry", lesson: 5, topic: "Applications & Word Problems" }] },
        { subjects: [{ name: "Trigonometry", lesson: 6, topic: "Advanced Topics" }] },

        // SIMILARITY (8 lessons total)
        { subjects: [{ name: "Similarity", lesson: 1, topic: "Basic Similarity Concepts" }] },
        { subjects: [{ name: "Similarity", lesson: 2, topic: "Similar Triangles" }] },
        { subjects: [{ name: "Similarity", lesson: 3, topic: "Triangle Similarity Theorems" }] },
        { subjects: [{ name: "Similarity", lesson: 4, topic: "Applications" }] },
        { subjects: [{ name: "Similarity", lesson: 5, topic: "Proof Techniques" }] },
        { subjects: [{ name: "Similarity", lesson: 6, topic: "Advanced Problems" }] },
        { subjects: [{ name: "Similarity", lesson: 7, topic: "Review & Practice" }] },
        { subjects: [{ name: "Similarity", lesson: 8, topic: "Final Topics" }] },

        // HISTORY (9 lessons total)
        { subjects: [{ name: "History", lesson: 1, topic: "Ancient Civilizations" }] },
        { subjects: [{ name: "History", lesson: 2, topic: "Medieval Period" }] },
        { subjects: [{ name: "History", lesson: 3, topic: "Renaissance Era" }] },
        { subjects: [{ name: "History", lesson: 4, topic: "Industrial Revolution" }] },
        { subjects: [{ name: "History", lesson: 5, topic: "World Wars" }] },
        { subjects: [{ name: "History", lesson: 6, topic: "Modern Era" }] },
        { subjects: [{ name: "History", lesson: 7, topic: "Contemporary Issues" }] },
        { subjects: [{ name: "History", lesson: 8, topic: "Future Challenges" }] },
        { subjects: [{ name: "History", lesson: 9, topic: "Comprehensive Review" }] },
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

// For backwards compatibility - export SCHEDULE as well
export const SCHEDULE = ENHANCED_SCHEDULE;

// ==================== SCHEDULE MANAGEMENT FUNCTIONS ====================

export interface SavedSchedule {
    id: string;
    name: string;
    startDate: string;
    createdAt: string;
    schedule: ScheduleDay[];
}

/**
 * Add a new schedule with a custom start date
 */
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

/**
 * Delete a schedule by ID
 */
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

/**
 * Get all saved schedules
 */
export const getAllSchedules = (): SavedSchedule[] => {
    const stored = localStorage.getItem(SCHEDULES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

/**
 * Get a specific schedule by ID
 */
export const getScheduleById = (scheduleId: string): SavedSchedule | null => {
    const schedules = getAllSchedules();
    return schedules.find(s => s.id === scheduleId) || null;
};

/**
 * Set the active schedule
 */
export const setActiveSchedule = (scheduleId: string): void => {
    localStorage.setItem(ACTIVE_SCHEDULE_KEY, scheduleId);
};

/**
 * Get the currently active schedule ID
 */
export const getActiveScheduleId = (): string | null => {
    return localStorage.getItem(ACTIVE_SCHEDULE_KEY);
};

/**
 * Get the currently active schedule
 */
export const getActiveSchedule = (): SavedSchedule | null => {
    const activeId = getActiveScheduleId();
    return activeId ? getScheduleById(activeId) : null;
};