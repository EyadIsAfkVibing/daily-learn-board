/**
 * ProfileContext.tsx
 * ─────────────────────────────────────────────────────────────────
 * React context providing active profile state to the entire app.
 * Components consume this to read/update profile data without
 * prop drilling or direct localStorage access.
 */

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
    Profile,
    getAllProfiles,
    getActiveProfile,
    setActiveProfile as setActiveInStore,
    createProfile as createInStore,
    deleteProfile as deleteFromStore,
    renameProfile as renameInStore,
    updateProfileProgress as updateProgressInStore,
    updateProfileNote as updateNoteInStore,
    getProfileStats,
    getProfileSubjectStats,
    duplicateProfile as duplicateInStore,
    Subject,
    DEFAULT_SUBJECTS,
} from "@/lib/ProfileManager";

interface ProfileContextValue {
    // Active profile
    profile: Profile | null;
    profiles: Profile[];

    // Actions
    switchProfile: (id: string) => void;
    createProfile: (name: string, subjects?: Subject[], startDate?: string, lessonsPerDay?: number, endDate?: string) => Profile;
    deleteProfile: (id: string) => boolean;
    renameProfile: (id: string, name: string) => boolean;
    duplicateProfile: (id: string) => Profile | null;

    // Progress
    markLesson: (key: string, completed: boolean) => void;
    updateNote: (key: string, note: string) => void;

    // Stats
    stats: { total: number; completed: number; percent: number };
    subjectStats: { [key: string]: { total: number; completed: number } };

    // Refresh (after external changes)
    refresh: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
    const [profile, setProfile] = useState<Profile | null>(() => getActiveProfile());
    const [profiles, setProfiles] = useState<Profile[]>(() => getAllProfiles());

    const refresh = useCallback(() => {
        setProfiles(getAllProfiles());
        setProfile(getActiveProfile());
    }, []);

    const switchProfile = useCallback((id: string) => {
        setActiveInStore(id);
        refresh();
    }, [refresh]);

    const handleCreate = useCallback((
        name: string,
        subjects: Subject[] = DEFAULT_SUBJECTS,
        startDate?: string,
        lessonsPerDay?: number,
        endDate?: string,
    ) => {
        const p = createInStore(name, subjects, startDate, lessonsPerDay, endDate);
        refresh();
        return p;
    }, [refresh]);

    const handleDuplicate = useCallback((id: string) => {
        const p = duplicateInStore(id);
        if (p) refresh();
        return p;
    }, [refresh]);

    const handleDelete = useCallback((id: string) => {
        const result = deleteFromStore(id);
        refresh();
        return result;
    }, [refresh]);

    const handleRename = useCallback((id: string, name: string) => {
        const result = renameInStore(id, name);
        refresh();
        return result;
    }, [refresh]);

    const markLesson = useCallback((key: string, completed: boolean) => {
        if (!profile) return;
        updateProgressInStore(profile.id, key, completed);
        refresh();
    }, [profile, refresh]);

    const updateNote = useCallback((key: string, note: string) => {
        if (!profile) return;
        updateNoteInStore(profile.id, key, note);
        refresh();
    }, [profile, refresh]);

    const stats = profile ? getProfileStats(profile) : { total: 0, completed: 0, percent: 0 };
    const subjectStats = profile ? getProfileSubjectStats(profile) : {};

    return (
        <ProfileContext.Provider
            value={{
                profile,
                profiles,
                switchProfile,
                createProfile: handleCreate,
                deleteProfile: handleDelete,
                renameProfile: handleRename,
                duplicateProfile: handleDuplicate,
                markLesson,
                updateNote,
                stats,
                subjectStats,
                refresh,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = (): ProfileContextValue => {
    const ctx = useContext(ProfileContext);
    if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
    return ctx;
};
