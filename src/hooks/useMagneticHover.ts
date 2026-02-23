/**
 * useMagneticHover.ts
 *
 * Spring-physics 3D card tilt + cursor-tracked spotlight.
 * Uses rAF-based interpolation so motion is silky at any fps.
 * Zero Framer Motion dependency — pure DOM + requestAnimationFrame.
 */

import { useRef, useCallback, MouseEvent, useEffect } from "react";

interface MagneticOptions {
    tiltStrength?: number;   // max tilt degrees (default 10)
    liftPx?: number;         // translateZ lift (default 18)
    spring?: number;         // 0-1 spring lerp factor (default 0.12)
    returnSpring?: number;   // return speed on leave (default 0.08)
}

interface MagneticHandlers {
    ref: React.RefObject<HTMLDivElement>;
    onMouseMove: (e: MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
}

export const useMagneticHover = (options: MagneticOptions = {}): MagneticHandlers => {
    const {
        tiltStrength = 10,
        liftPx = 18,
        spring = 0.12,
        returnSpring = 0.08,
    } = options;

    const ref = useRef<HTMLDivElement>(null);

    // Current animated state
    const stateRef = useRef({
        rx: 0, ry: 0, z: 0,
        targetRx: 0, targetRy: 0, targetZ: 0,
        spotX: 50, spotY: 50, spotA: 0, targetSpotA: 0,
        animating: false,
    });

    const rafRef = useRef<number>(0);

    const animate = useCallback(() => {
        const s = stateRef.current;
        const el = ref.current;
        if (!el) return;

        const lerpF = s.targetZ > 0 ? spring : returnSpring;

        s.rx += (s.targetRx - s.rx) * lerpF;
        s.ry += (s.targetRy - s.ry) * lerpF;
        s.z += (s.targetZ - s.z) * lerpF;
        s.spotA += (s.targetSpotA - s.spotA) * lerpF;

        el.style.transform = `perspective(900px) rotateX(${s.rx}deg) rotateY(${s.ry}deg) translateZ(${s.z}px)`;
        el.style.setProperty("--spot-x", `${s.spotX}%`);
        el.style.setProperty("--spot-y", `${s.spotY}%`);
        el.style.setProperty("--spot-a", String(s.spotA));

        // Stop animating when settled
        const settled =
            Math.abs(s.rx - s.targetRx) < 0.01 &&
            Math.abs(s.ry - s.targetRy) < 0.01 &&
            Math.abs(s.z - s.targetZ) < 0.01 &&
            Math.abs(s.spotA - s.targetSpotA) < 0.001;

        if (!settled) {
            rafRef.current = requestAnimationFrame(animate);
        } else {
            s.animating = false;
        }
    }, [spring, returnSpring]);

    const startAnimate = useCallback(() => {
        const s = stateRef.current;
        if (!s.animating) {
            s.animating = true;
            rafRef.current = requestAnimationFrame(animate);
        }
    }, [animate]);

    const onMouseMove = useCallback(
        (e: MouseEvent<HTMLElement>) => {
            const el = ref.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            // Normalized -1..+1
            const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

            const s = stateRef.current;
            s.targetRx = -ny * tiltStrength;
            s.targetRy = nx * tiltStrength;
            s.targetZ = liftPx;
            s.spotX = ((e.clientX - rect.left) / rect.width) * 100;
            s.spotY = ((e.clientY - rect.top) / rect.height) * 100;
            s.targetSpotA = 1;
            startAnimate();
        },
        [tiltStrength, liftPx, startAnimate]
    );

    const onMouseLeave = useCallback(() => {
        const s = stateRef.current;
        s.targetRx = 0;
        s.targetRy = 0;
        s.targetZ = 0;
        s.targetSpotA = 0;
        startAnimate();
    }, [startAnimate]);

    useEffect(() => {
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    return { ref, onMouseMove, onMouseLeave };
};