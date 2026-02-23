/**
 * ProfileManager.ts
 * ─────────────────────────────────────────────────────────────────
 * Abstracted storage layer for multi-profile study tracking.
 *
 * Architecture:
 * - All data lives in localStorage under a single key
 * - Storage interface is abstracted for future backend migration
 * - Auto-migrates legacy progress data into a "Default" profile
 * - Each profile owns: subjects, lesson counts, progress, notes
 */

// ─── Types ────────────────────────────────────────────────────────

export interface Subject {
    name: string;
    totalLessons: number;
    color?: string; // optional accent color
    priority?: "High" | "Medium" | "Low";
    notes?: string;
}

export interface ProfileLesson {
    subjectName: string;
    lessonNumber: number;
    topic: string;
    priority?: "High" | "Medium" | "Low";
    duration?: number;
}

export interface ProfileScheduleDay {
    day: number;
    date: string;
    subjects: ProfileLesson[];
}

export interface Profile {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    subjects: Subject[];
    schedule: ProfileScheduleDay[];
    progress: { [key: string]: boolean };     // "dayIdx-subIdx" → true
    notes: { [key: string]: string };          // "dayIdx-subIdx" → note text
    startDate: string;                         // ISO date string
    endDate?: string;                          // Optional target end date
    lessonsPerDay: number;
}

export interface ProfileStore {
    version: number;
    activeProfileId: string | null;
    profiles: Profile[];
}

// ─── Constants ────────────────────────────────────────────────────

const STORE_KEY = "study-dashboard-v2";
const CURRENT_VERSION = 1;

// Legacy keys (for migration)
const LEGACY_PROGRESS_KEY = "study-dashboard-progress";
const LEGACY_NOTES_KEY = "study-dashboard-notes";

// ─── Default subjects (matching original hardcoded schedule) ──────

export const DEFAULT_SUBJECTS: Subject[] = [
    { name: "Nahw", totalLessons: 10 },
    { name: "Trigonometry", totalLessons: 7 },
    { name: "Science", totalLessons: 8 },
    { name: "History", totalLessons: 6 },
    { name: "Nosoos", totalLessons: 6 },
    { name: "Matrices", totalLessons: 5 },
    { name: "A'dab", totalLessons: 4 },
    { name: "Straight Line", totalLessons: 4 },
    { name: "Vectors", totalLessons: 3 },
    { name: "Reading", totalLessons: 3 },
    { name: "Balagha", totalLessons: 2 },
    { name: "Linear Programming", totalLessons: 2 },
];

// ─── Storage Interface ────────────────────────────────────────────
// Abstracted for future backend migration (swap localStorage with API)

interface StorageAdapter {
    load(): ProfileStore | null;
    save(store: ProfileStore): void;
}

const localStorageAdapter: StorageAdapter = {
    load(): ProfileStore | null {
        try {
            const raw = localStorage.getItem(STORE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },
    save(store: ProfileStore) {
        localStorage.setItem(STORE_KEY, JSON.stringify(store));
    },
};

// Active adapter (swap this for backend integration)
let adapter: StorageAdapter = localStorageAdapter;

export const setStorageAdapter = (a: StorageAdapter) => { adapter = a; };

// ─── Schedule Generation ──────────────────────────────────────────

export const generateSchedule = (
    subjects: Subject[],
    startDate: string,
    lessonsPerDay: number = 2,
    endDate?: string,
): ProfileScheduleDay[] => {
    // Collect all lesson items
    const lessons: ProfileLesson[] = [];

    // Determine priority weight
    const getWeight = (p?: string) => {
        if (p === "High") return 3;
        if (p === "Medium") return 2;
        if (p === "Low") return 1;
        return 2; // Default Medium
    };

    // Sort subjects by priority
    const sortedSubjects = [...subjects].sort((a, b) => getWeight(b.priority) - getWeight(a.priority));

    // Interleave lessons by grabbing one lesson from each subject in priority order
    let addedLessons = true;
    const progressMap = new Map<string, number>();
    sortedSubjects.forEach(s => progressMap.set(s.name, 0));

    while (addedLessons) {
        addedLessons = false;
        for (const sub of sortedSubjects) {
            const currentCount = progressMap.get(sub.name)!;
            if (currentCount < sub.totalLessons) {
                lessons.push({
                    subjectName: sub.name,
                    lessonNumber: currentCount + 1,
                    topic: "",
                    priority: sub.priority || "Medium",
                });
                progressMap.set(sub.name, currentCount + 1);
                addedLessons = true;
            }
        }
    }

    // Distribute into days
    const days: ProfileScheduleDay[] = [];

    // If user provided an endDate, recalculate lessonsPerDay dynamically
    let actualLessonsPerDay = lessonsPerDay;
    if (endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dayDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        if (dayDiff > 0) {
            actualLessonsPerDay = Math.ceil(lessons.length / dayDiff);
        }
    }

    const totalDays = Math.ceil(lessons.length / actualLessonsPerDay);
    const start = new Date(startDate);

    for (let d = 0; d < totalDays; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + d);
        days.push({
            day: d + 1,
            date: date.toISOString().split("T")[0],
            subjects: lessons.slice(d * actualLessonsPerDay, d * actualLessonsPerDay + actualLessonsPerDay),
        });
    }

    return days;
};

// ─── Profile CRUD ─────────────────────────────────────────────────

const generateId = () => `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getStore = (): ProfileStore => {
    const store = adapter.load();
    if (store && store.version === CURRENT_VERSION) return store;
    // First run or old version — initialize with migration
    return migrateOrInit();
};

const saveStore = (store: ProfileStore) => {
    adapter.save(store);
};

export const getAllProfiles = (): Profile[] => {
    return getStore().profiles;
};

export const getActiveProfileId = (): string | null => {
    return getStore().activeProfileId;
};

export const getActiveProfile = (): Profile | null => {
    const store = getStore();
    if (!store.activeProfileId) return store.profiles[0] || null;
    return store.profiles.find(p => p.id === store.activeProfileId) || store.profiles[0] || null;
};

export const setActiveProfile = (profileId: string) => {
    const store = getStore();
    store.activeProfileId = profileId;
    saveStore(store);
};

export const createProfile = (
    name: string,
    subjects: Subject[],
    startDate: string = new Date().toISOString().split("T")[0],
    lessonsPerDay: number = 2,
    endDate?: string,
): Profile => {
    const store = getStore();
    const id = generateId();
    const now = new Date().toISOString();

    // Ensure subjects have default priorities
    const enrichedSubjects = subjects.map(s => ({
        ...s,
        priority: s.priority || "Medium"
    }));

    const schedule = generateSchedule(enrichedSubjects, startDate, lessonsPerDay, endDate);

    const profile: Profile = {
        id,
        name,
        createdAt: now,
        updatedAt: now,
        subjects: enrichedSubjects,
        schedule,
        progress: {},
        notes: {},
        startDate,
        endDate,
        lessonsPerDay,
    };

    store.profiles.push(profile);
    if (!store.activeProfileId) store.activeProfileId = id;
    saveStore(store);
    return profile;
};

export const duplicateProfile = (profileId: string): Profile | null => {
    const store = getStore();
    const sourceProfile = store.profiles.find(p => p.id === profileId);
    if (!sourceProfile) return null;

    return createProfile(
        `${sourceProfile.name} (Copy)`,
        sourceProfile.subjects,
        new Date().toISOString().split("T")[0], // Reset start date to today
        sourceProfile.lessonsPerDay,
        // Calculate new end date based on length if it existed
        sourceProfile.endDate ? new Date(new Date().getTime() + (new Date(sourceProfile.endDate).getTime() - new Date(sourceProfile.startDate).getTime())).toISOString().split("T")[0] : undefined
    );
};

export const deleteProfile = (profileId: string): boolean => {
    const store = getStore();
    const idx = store.profiles.findIndex(p => p.id === profileId);
    if (idx === -1) return false;
    store.profiles.splice(idx, 1);
    if (store.activeProfileId === profileId) {
        store.activeProfileId = store.profiles[0]?.id || null;
    }
    saveStore(store);
    return true;
};

export const renameProfile = (profileId: string, newName: string): boolean => {
    const store = getStore();
    const profile = store.profiles.find(p => p.id === profileId);
    if (!profile) return false;
    profile.name = newName;
    profile.updatedAt = new Date().toISOString();
    saveStore(store);
    return true;
};

export const updateProfileProgress = (
    profileId: string,
    key: string,
    completed: boolean,
): boolean => {
    const store = getStore();
    const profile = store.profiles.find(p => p.id === profileId);
    if (!profile) return false;
    profile.progress[key] = completed;
    profile.updatedAt = new Date().toISOString();
    saveStore(store);
    return true;
};

export const updateProfileNote = (
    profileId: string,
    key: string,
    note: string,
): boolean => {
    const store = getStore();
    const profile = store.profiles.find(p => p.id === profileId);
    if (!profile) return false;
    profile.notes[key] = note;
    profile.updatedAt = new Date().toISOString();
    saveStore(store);
    return true;
};

// ─── Profile Stats ────────────────────────────────────────────────

export const getProfileStats = (profile: Profile) => {
    let total = 0, completed = 0;
    if (!profile || !profile.schedule) return { total: 0, completed: 0, percent: 0 };
    profile.schedule.forEach((day, dayIdx) => {
        if (!day || !day.subjects) return;
        day.subjects.forEach((_, subIdx) => {
            total++;
            if (profile.progress && profile.progress[`${dayIdx}-${subIdx}`]) completed++;
        });
    });
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
};

export const getProfileSubjectStats = (profile: Profile) => {
    const stats: { [key: string]: { total: number; completed: number } } = {};
    if (!profile || !profile.schedule) return stats;
    profile.schedule.forEach((day, dayIdx) => {
        if (!day || !day.subjects) return;
        day.subjects.forEach((sub, subIdx) => {
            if (!sub) return;
            if (!stats[sub.subjectName]) stats[sub.subjectName] = { total: 0, completed: 0 };
            stats[sub.subjectName].total++;
            if (profile.progress && profile.progress[`${dayIdx}-${subIdx}`]) stats[sub.subjectName].completed++;
        });
    });
    return stats;
};

// ─── Migration ────────────────────────────────────────────────────

const migrateOrInit = (): ProfileStore => {
    // Try to load legacy data
    let legacyProgress: { [key: string]: boolean } = {};
    let legacyNotes: { [key: string]: string } = {};

    try {
        const rawProgress = localStorage.getItem(LEGACY_PROGRESS_KEY);
        if (rawProgress) legacyProgress = JSON.parse(rawProgress);
    } catch { /* ignore */ }

    try {
        const rawNotes = localStorage.getItem(LEGACY_NOTES_KEY);
        if (rawNotes) legacyNotes = JSON.parse(rawNotes);
    } catch { /* ignore */ }

    const hasLegacyData = Object.keys(legacyProgress).length > 0 || Object.keys(legacyNotes).length > 0;

    const now = new Date().toISOString();
    const defaultStart = "2026-02-18";
    const id = generateId();

    // Generate schedule from default subjects (matches legacy structure)
    const schedule = generateSchedule(DEFAULT_SUBJECTS, defaultStart, 2);

    const defaultProfile: Profile = {
        id,
        name: hasLegacyData ? "My Progress" : "Default",
        createdAt: now,
        updatedAt: now,
        subjects: DEFAULT_SUBJECTS,
        schedule,
        progress: legacyProgress,
        notes: legacyNotes,
        startDate: defaultStart,
        lessonsPerDay: 2,
    };

    const store: ProfileStore = {
        version: CURRENT_VERSION,
        activeProfileId: id,
        profiles: [defaultProfile],
    };

    adapter.save(store);
    return store;
};
