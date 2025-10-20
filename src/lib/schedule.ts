// Enhanced Schedule with Custom Lesson Names and Topics
// This replaces the basic SCHEDULE constant in all your files

export interface Lesson {
    name: string;
    lesson: number;
    topic: string; // NEW! The specific topic/chapter
}

export interface ScheduleDay {
    day: number;
    date: string;
    subjects: Lesson[];
}

// START DATE - Change this to when you want to start your study schedule
const START_DATE = new Date('2025-10-18'); // Change this to your actual start date or use: new Date() for today

// Function to generate dates dynamically
const generateScheduleDates = () => {
    const schedule: ScheduleDay[] = [];
    const baseSchedule = [
        { subjects: [{ name: "Arabic Reading", lesson: 1, topic: "Introduction to Classical Texts" }, { name: "Science", lesson: 1, topic: "Scientific Method" }] },
        { subjects: [{ name: "Arabic Nosoos", lesson: 1, topic: "Poetry Analysis Basics" }, { name: "Algebra", lesson: 1, topic: "Complex Numbers" }] },
        { subjects: [{ name: "Arabic Grammar", lesson: 1, topic: "Sentence Structure" }, { name: "Science", lesson: 2, topic: "Lab Safety & Equipment" }] },
        { subjects: [{ name: "Arabic AlA'dab", lesson: 1, topic: "Literary Periods" }, { name: "History", lesson: 1, topic: "Ancient Civilizations" }] },
        { subjects: [{ name: "Arabic Balagha", lesson: 1, topic: "Figures of Speech" }, { name: "Geometry", lesson: 1, topic: "Basic Shapes & Angles" }] },
        { subjects: [{ name: "Arabic Reading", lesson: 2, topic: "Modern Literature" }, { name: "Science", lesson: 3, topic: "Matter & Energy" }] },
        { subjects: [{ name: "Arabic Nosoos", lesson: 2, topic: "Prose Analysis" }, { name: "Trigonometry", lesson: 1, topic: "Angles & Radians" }] },
        { subjects: [{ name: "Arabic Grammar", lesson: 2, topic: "Verb Conjugation" }, { name: "Science", lesson: 4, topic: "Chemical Reactions" }] },
        { subjects: [{ name: "Arabic AlA'dab", lesson: 2, topic: "Famous Authors" }, { name: "History", lesson: 2, topic: "Medieval Period" }] },
        { subjects: [{ name: "Arabic Balagha", lesson: 2, topic: "Metaphors & Similes" }, { name: "Science", lesson: 5, topic: "Force & Motion" }] },
        { subjects: [{ name: "Arabic Reading", lesson: 3, topic: "Comparative Literature" }, { name: "Algebra", lesson: 2, topic: "Quadratic Equations" }] },
        { subjects: [{ name: "Arabic Nosoos", lesson: 3, topic: "Historical Texts" }, { name: "Science", lesson: 6, topic: "Electricity & Magnetism" }] },
        { subjects: [{ name: "Arabic Grammar", lesson: 3, topic: "Advanced Syntax" }, { name: "History", lesson: 3, topic: "Renaissance Era" }] },
        { subjects: [{ name: "Arabic AlA'dab", lesson: 3, topic: "Literary Movements" }, { name: "Science", lesson: 7, topic: "Waves & Sound" }] },
        { subjects: [{ name: "Arabic Balagha", lesson: 3, topic: "Rhetorical Devices" }, { name: "Trigonometry", lesson: 2, topic: "Sine & Cosine Functions" }] },
        { subjects: [{ name: "Arabic Nosoos", lesson: 4, topic: "Contemporary Poetry" }, { name: "Science", lesson: 8, topic: "Light & Optics" }] },
        { subjects: [{ name: "Arabic Grammar", lesson: 4, topic: "Modifiers & Adjectives" }, { name: "Algebra", lesson: 3, topic: "Functions & Graphs" }] },
        { subjects: [{ name: "Arabic Balagha", lesson: 4, topic: "Imagery & Symbolism" }, { name: "Science", lesson: 9, topic: "Atomic Structure" }] },
        { subjects: [{ name: "Arabic Nosoos", lesson: 5, topic: "Critical Analysis" }, { name: "Geometry", lesson: 2, topic: "Triangles & Proofs" }] },
        { subjects: [{ name: "Arabic Grammar", lesson: 5, topic: "Complex Sentences" }, { name: "Science", lesson: 10, topic: "Periodic Table" }] },
        { subjects: [{ name: "History", lesson: 4, topic: "Industrial Revolution" }, { name: "Trigonometry", lesson: 3, topic: "Tangent & Unit Circle" }] },
        { subjects: [{ name: "Science", lesson: 11, topic: "Organic Chemistry" }, { name: "Algebra", lesson: 4, topic: "Logarithms & Exponents" }] },
        { subjects: [{ name: "History", lesson: 5, topic: "World Wars" }, { name: "Science", lesson: 12, topic: "Thermodynamics" }] },
        { subjects: [{ name: "Geometry", lesson: 3, topic: "Circles & Arcs" }, { name: "Science", lesson: 13, topic: "Genetics & DNA" }] },
        { subjects: [{ name: "Trigonometry", lesson: 4, topic: "Trigonometric Identities" }, { name: "Science", lesson: 14, topic: "Evolution & Natural Selection" }] },
        { subjects: [{ name: "History", lesson: 6, topic: "Modern Era" }, { name: "Algebra", lesson: 5, topic: "Polynomials" }] },
        { subjects: [{ name: "Geometry", lesson: 4, topic: "3D Shapes & Volume" }, { name: "Trigonometry", lesson: 5, topic: "Applications & Word Problems" }] },
        { subjects: [{ name: "History", lesson: 7, topic: "Contemporary Issues" }, { name: "Geometry", lesson: 5, topic: "Coordinate Geometry" }] },
    ];

    baseSchedule.forEach((dayData, index) => {
        const date = new Date(START_DATE);
        date.setDate(START_DATE.getDate() + index);

        schedule.push({
            day: index + 1,
            date: date.toISOString().split('T')[0],
            subjects: dayData.subjects
        });
    });

    return schedule;
};

export const ENHANCED_SCHEDULE: ScheduleDay[] = generateScheduleDates();

export const STORAGE_KEY = "study-dashboard-progress";
export const NOTES_STORAGE_KEY = "study-dashboard-notes";
export const TIMER_STORAGE_KEY = "study-dashboard-timer";

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