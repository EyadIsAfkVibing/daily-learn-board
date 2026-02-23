/**
 * useSound.ts
 * ─────────────────────────────────────────────────────────────────
 * React hook that wires SoundEngine into components.
 * Handles:
 * • First-interaction initialization (required by browsers)
 * • Mode sync
 * • Cursor pan tracking
 * • Page visibility suspend/resume
 * • Scroll velocity whisper
 */

import { useEffect, useRef, useCallback } from "react";
import {
    initSound,
    setMode,
    updateCursorPan,
    playHover,
    playClick,
    playModeSwitch,
    playScrollWhisper,
    playNavigate,
    toggleMute,
    isMuted,
    suspend,
    resumeAudio,
} from "@/lib/SoundEngine";

interface UseSoundOptions {
    isRamadan: boolean;
    enabled?: boolean;  // default true
}

interface UseSoundReturn {
    // Event handlers to attach to elements
    onCardHover: () => void;
    onButtonHover: () => void;
    onSubjectHover: () => void;
    onAnyClick: () => void;
    onNavigate: () => void;
    // Control
    toggleMute: () => boolean;
    isMuted: () => boolean;
}

export const useSound = ({ isRamadan, enabled = true }: UseSoundOptions): UseSoundReturn => {
    const initializedRef = useRef(false);
    const prevRamadanRef = useRef(isRamadan);
    const prevScrollRef = useRef(0);
    const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>();

    // ── Initialize on first user interaction ─────────────────────
    useEffect(() => {
        if (!enabled) return;
        const init = () => {
            if (initializedRef.current) return;
            initializedRef.current = true;
            initSound(isRamadan ? "ramadan" : "normal");
        };
        // Listen for first interaction
        window.addEventListener("click", init, { once: true });
        window.addEventListener("keydown", init, { once: true });
        window.addEventListener("touchend", init, { once: true });
        return () => {
            window.removeEventListener("click", init);
            window.removeEventListener("keydown", init);
            window.removeEventListener("touchend", init);
        };
    }, [enabled, isRamadan]);

    // ── Sync mode changes ─────────────────────────────────────────
    useEffect(() => {
        if (!initializedRef.current || !enabled) return;
        if (prevRamadanRef.current !== isRamadan) {
            prevRamadanRef.current = isRamadan;
            setMode(isRamadan ? "ramadan" : "normal");
        }
    }, [isRamadan, enabled]);

    // ── Cursor pan tracking ───────────────────────────────────────
    useEffect(() => {
        if (!enabled) return;
        const onMove = (e: MouseEvent) => {
            if (!initializedRef.current) return;
            updateCursorPan(e.clientX / window.innerWidth);
        };
        window.addEventListener("mousemove", onMove, { passive: true });
        return () => window.removeEventListener("mousemove", onMove);
    }, [enabled]);

    // ── Scroll whisper ────────────────────────────────────────────
    useEffect(() => {
        if (!enabled) return;
        const onScroll = () => {
            if (!initializedRef.current) return;
            const current = window.scrollY;
            const velocity = current - prevScrollRef.current;
            prevScrollRef.current = current;
            clearTimeout(scrollTimerRef.current);
            scrollTimerRef.current = setTimeout(() => {
                playScrollWhisper(velocity);
            }, 16);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [enabled]);

    // ── Page visibility ───────────────────────────────────────────
    useEffect(() => {
        if (!enabled) return;
        const onVisibility = () => {
            if (document.hidden) suspend();
            else resumeAudio();
        };
        document.addEventListener("visibilitychange", onVisibility);
        return () => document.removeEventListener("visibilitychange", onVisibility);
    }, [enabled]);

    // ── Handlers ──────────────────────────────────────────────────
    const onCardHover = useCallback(() => { if (enabled) playHover("card"); }, [enabled]);
    const onButtonHover = useCallback(() => { if (enabled) playHover("button"); }, [enabled]);
    const onSubjectHover = useCallback(() => { if (enabled) playHover("subject"); }, [enabled]);
    const onAnyClick = useCallback(() => { if (enabled) playClick(); }, [enabled]);
    const onNavigate = useCallback(() => { if (enabled) playNavigate(); }, [enabled]);
    const handleToggle = useCallback(() => toggleMute(), []);

    return {
        onCardHover,
        onButtonHover,
        onSubjectHover,
        onAnyClick,
        onNavigate,
        toggleMute: handleToggle,
        isMuted,
    };
};