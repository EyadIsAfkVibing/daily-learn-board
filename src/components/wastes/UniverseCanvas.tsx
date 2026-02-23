/**
 * UniverseCanvas.tsx
 *
 * One physics engine. Two souls.
 *
 * NON-RAMADAN: Deep space. Particles have mass. Cursor is gravity.
 *   Scroll creates turbulence. Cards pulse magnetic fields.
 *
 * RAMADAN: Same engine — particles become light-fragments of Arabic
 *   calligraphy, pulled into sacred geometry attractors then dissolved.
 *   The moon radiates a warm field that recolors every particle.
 *   Lanterns have real spring-pendulum physics.
 */

import { useEffect, useRef, useCallback, CSSProperties } from "react";

// ─── Core physics types ───────────────────────────────────────────────────────

interface Vec2 { x: number; y: number }

interface Particle {
    // Position & velocity
    pos: Vec2;
    vel: Vec2;
    acc: Vec2;
    // Rest position (for spring return)
    rest: Vec2;
    // Visual
    radius: number;
    baseRadius: number;
    // Color in HSL components (animated)
    h: number; targetH: number;
    s: number; targetS: number;
    l: number; targetL: number;
    a: number; targetA: number;
    // Unique phase for organic breathing
    phase: number;
    phaseSpeed: number;
    // Mass (affects gravity response)
    mass: number;
    // Ramadan: attractor index (-1 = free)
    attractorIdx: number;
    attractorStrength: number;
    // Connection state
    connected: boolean;
}

interface Attractor {
    pos: Vec2;
    strength: number;
    radius: number;
    active: boolean;
}

interface Pendulum {
    // Angular state
    angle: number;
    angleVel: number;
    angleAcc: number;
    // Pivot (world space)
    pivot: Vec2;
    length: number;
    // Visual
    colorH: number;
    glowIntensity: number;
    targetGlow: number;
    // Which lantern
    idx: number;
}

interface MoonState {
    x: number;
    y: number;
    breathPhase: number;
    glowRadius: number;
    targetGlow: number;
    // Warm field strength (colors nearby particles)
    fieldStrength: number;
}

export interface UniverseCanvasProps {
    isRamadan: boolean;
    scrollY?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TAU = Math.PI * 2;
const PARTICLE_COUNT = 220;
const GRID_COLS = 20;
const GRID_ROWS = 11;

// Space palette
const SPACE_HUES = [210, 220, 200, 240, 185, 230];
// Ramadan warm palette
const RAMADAN_HUES = [35, 42, 28, 48, 32, 38];

// Physics
const SPRING_K = 0.055;          // spring stiffness (return to rest)
const DAMPING = 0.88;            // velocity damping
const CURSOR_GRAVITY = 180;      // gravity well radius
const CURSOR_FORCE = 2.8;        // gravity force multiplier
const REPEL_RADIUS = 45;         // inner repel zone
const MAX_SPEED = 5;             // terminal velocity
const CONNECTION_DIST = 90;      // max line-connection distance
const PENDULUM_GRAVITY = 0.004;  // pendulum g constant
const PENDULUM_DAMPING = 0.995;  // air resistance
const MOON_FIELD_RADIUS = 280;   // warm light field
const SCROLL_TURBULENCE = 0.003; // scroll → particle kick

// Sacred geometry attractor positions (normalized 0-1, scaled to canvas)
// These are vertices of an 8-pointed star and inner octagon
const SACRED_GEOMETRY = (() => {
    const pts: Vec2[] = [];
    const cx = 0.5, cy = 0.38;
    // Outer 8-point star
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU - Math.PI / 2;
        pts.push({ x: cx + 0.18 * Math.cos(a), y: cy + 0.18 * Math.sin(a) });
        // Inner octagon
        const ai = ((i + 0.5) / 8) * TAU - Math.PI / 2;
        pts.push({ x: cx + 0.09 * Math.cos(ai), y: cy + 0.09 * Math.sin(ai) });
    }
    // Center
    pts.push({ x: cx, y: cy });
    return pts;
})();

// Lantern positions (normalized)
const LANTERN_POSITIONS: Vec2[] = [
    { x: 0.08, y: 0.04 },
    { x: 0.22, y: 0.03 },
    { x: 0.38, y: 0.05 },
    { x: 0.62, y: 0.05 },
    { x: 0.78, y: 0.03 },
    { x: 0.92, y: 0.04 },
];

const LANTERN_COLORS = [
    { h: 8, label: "ember" },
    { h: 30, label: "gold" },
    { h: 320, label: "rose" },
    { h: 200, label: "sapphire" },
    { h: 270, label: "violet" },
    { h: 155, label: "jade" },
];

// ─── Utility ──────────────────────────────────────────────────────────────────

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const dist2 = (a: Vec2, b: Vec2) => {
    const dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
};
const dist = (a: Vec2, b: Vec2) => Math.sqrt(dist2(a, b));

// ─── Component ────────────────────────────────────────────────────────────────

const UniverseCanvas = ({ isRamadan, scrollY = 0 }: UniverseCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const frameRef = useRef(0);
    const prevScrollRef = useRef(0);

    // Physics state
    const particlesRef = useRef<Particle[]>([]);
    const attractorsRef = useRef<Attractor[]>([]);
    const pendulumRef = useRef<Pendulum[]>([]);
    const moonRef = useRef<MoonState>({
        x: 0, y: 0, breathPhase: 0,
        glowRadius: 160, targetGlow: 160,
        fieldStrength: 0,
    });
    const mouseRef = useRef<Vec2>({ x: -9999, y: -9999 });
    const mousePrevRef = useRef<Vec2>({ x: -9999, y: -9999 });
    const mouseVelRef = useRef<Vec2>({ x: 0, y: 0 });
    const modeRef = useRef(isRamadan);
    const sizeRef = useRef({ W: 0, H: 0 });

    // ── Initialize particles ──────────────────────────────────────────────────
    const initParticles = useCallback((W: number, H: number, ramadan: boolean) => {
        const ps: Particle[] = [];
        const xStep = W / (GRID_COLS + 1);
        const yStep = H / (GRID_ROWS + 1);

        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                if (ps.length >= PARTICLE_COUNT) break;
                const rx = xStep * (col + 1) + (Math.random() - 0.5) * xStep * 0.3;
                const ry = yStep * (row + 1) + (Math.random() - 0.5) * yStep * 0.3;
                const hues = ramadan ? RAMADAN_HUES : SPACE_HUES;
                const h = hues[Math.floor(Math.random() * hues.length)];
                const phase = Math.random() * TAU;
                ps.push({
                    pos: { x: rx, y: ry },
                    vel: { x: 0, y: 0 },
                    acc: { x: 0, y: 0 },
                    rest: { x: rx, y: ry },
                    radius: 1.4 + Math.random() * 1.8,
                    baseRadius: 1.4 + Math.random() * 1.8,
                    h, targetH: h,
                    s: ramadan ? 70 : 75, targetS: ramadan ? 70 : 75,
                    l: ramadan ? 68 : 72, targetL: ramadan ? 68 : 72,
                    a: 0.18 + Math.random() * 0.22, targetA: 0.18 + Math.random() * 0.22,
                    phase,
                    phaseSpeed: 0.004 + Math.random() * 0.006,
                    mass: 0.6 + Math.random() * 0.8,
                    attractorIdx: -1,
                    attractorStrength: 0,
                    connected: false,
                });
            }
        }
        return ps;
    }, []);

    // ── Initialize sacred geometry attractors ─────────────────────────────────
    const initAttractors = useCallback((W: number, H: number): Attractor[] => {
        return SACRED_GEOMETRY.map((p) => ({
            pos: { x: p.x * W, y: p.y * H },
            strength: 0,
            radius: 30,
            active: false,
        }));
    }, []);

    // ── Initialize pendulums (lanterns) ──────────────────────────────────────
    const initPendulums = useCallback((W: number, H: number): Pendulum[] => {
        return LANTERN_POSITIONS.map((p, i) => ({
            angle: (Math.random() - 0.5) * 0.3,
            angleVel: 0,
            angleAcc: 0,
            pivot: { x: p.x * W, y: p.y * H * 0.5 },
            length: 60 + Math.random() * 30,
            colorH: LANTERN_COLORS[i].h,
            glowIntensity: 0.5,
            targetGlow: 0.5,
            idx: i,
        }));
    }, []);

    // ── Main setup ────────────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { alpha: true })!;
        let W = 0, H = 0;

        const resize = () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            sizeRef.current = { W, H };
            // Moon lives top-right, organic position
            moonRef.current.x = W * 0.88;
            moonRef.current.y = H * 0.12;
            // Reinit preserving velocities
            particlesRef.current = initParticles(W, H, modeRef.current);
            attractorsRef.current = initAttractors(W, H);
            pendulumRef.current = initPendulums(W, H);
        };

        resize();
        window.addEventListener("resize", resize, { passive: true });

        // ── Mouse tracking ────────────────────────────────────────────────────
        const onMove = (e: MouseEvent) => {
            const prev = mouseRef.current;
            mousePrevRef.current = { x: prev.x, y: prev.y };
            mouseRef.current = { x: e.clientX, y: e.clientY };
            mouseVelRef.current = {
                x: e.clientX - prev.x,
                y: e.clientY - prev.y,
            };
        };

        window.addEventListener("mousemove", onMove, { passive: true });

        // ── Draw utilities ────────────────────────────────────────────────────

        const drawGlowCircle = (
            cx: number, cy: number, r: number,
            color: string, alpha: number, glowR?: number
        ) => {
            const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR ?? r * 2.5);
            gr.addColorStop(0, color.replace(")", `,${alpha})`).replace("hsl(", "hsla("));
            gr.addColorStop(0.4, color.replace(")", `,${alpha * 0.5})`).replace("hsl(", "hsla("));
            gr.addColorStop(1, color.replace(")", ",0)").replace("hsl(", "hsla("));
            ctx.beginPath();
            ctx.arc(cx, cy, glowR ?? r * 2.5, 0, TAU);
            ctx.fillStyle = gr;
            ctx.fill();
        };

        const hsla = (h: number, s: number, l: number, a: number) =>
            `hsla(${h},${s}%,${l}%,${a})`;

        // ── DRAW MOON ─────────────────────────────────────────────────────────
        const drawMoon = (t: number) => {
            const moon = moonRef.current;
            moon.breathPhase += 0.012;

            const mouse = mouseRef.current;
            const d = dist(moon, mouse);
            const proximity = clamp(1 - d / 400, 0, 1);
            moon.targetGlow = 140 + Math.sin(moon.breathPhase) * 25 + proximity * 60;
            moon.glowRadius = lerp(moon.glowRadius, moon.targetGlow, 0.05);
            moon.fieldStrength = lerp(moon.fieldStrength, proximity, 0.03);

            // Outer light field
            const field = ctx.createRadialGradient(
                moon.x, moon.y, 0,
                moon.x, moon.y, MOON_FIELD_RADIUS + moon.glowRadius * 0.5
            );
            field.addColorStop(0, `hsla(42,80%,70%,${0.06 + proximity * 0.04})`);
            field.addColorStop(0.5, `hsla(38,70%,60%,${0.03 + proximity * 0.02})`);
            field.addColorStop(1, "hsla(38,60%,50%,0)");
            ctx.beginPath();
            ctx.arc(moon.x, moon.y, MOON_FIELD_RADIUS + moon.glowRadius * 0.5, 0, TAU);
            ctx.fillStyle = field;
            ctx.fill();

            // Glow halo layers
            for (let layer = 3; layer >= 0; layer--) {
                const lr = moon.glowRadius * (0.5 + layer * 0.3);
                const la = (0.08 - layer * 0.016) * (0.7 + Math.sin(moon.breathPhase) * 0.3);
                drawGlowCircle(moon.x, moon.y, 50, "hsl(42,80%,72%)", la, lr);
            }

            // Moon body — crescent via clipping
            ctx.save();
            // Clip: full circle minus offset circle
            const bodyR = 52;
            const region = new Path2D();
            region.arc(moon.x, moon.y, bodyR, 0, TAU);
            ctx.clip(region);

            // Fill body gradient
            const bodyGrad = ctx.createRadialGradient(
                moon.x - bodyR * 0.25, moon.y - bodyR * 0.2, 0,
                moon.x, moon.y, bodyR
            );
            bodyGrad.addColorStop(0, "hsla(48,90%,92%,0.95)");
            bodyGrad.addColorStop(0.5, "hsla(42,85%,75%,0.9)");
            bodyGrad.addColorStop(1, "hsla(32,70%,55%,0.85)");
            ctx.fillStyle = bodyGrad;
            ctx.fill();

            // "Bite" that creates crescent — composite out
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.arc(moon.x + bodyR * 0.7, moon.y - bodyR * 0.15, bodyR * 0.82, 0, TAU);
            ctx.fillStyle = "rgba(0,0,0,1)";
            ctx.fill();
            ctx.globalCompositeOperation = "source-over";
            ctx.restore();

            // Star inside crescent
            const sx = moon.x - bodyR * 0.32;
            const sy = moon.y + bodyR * 0.05;
            const starPulse = 0.8 + Math.sin(moon.breathPhase * 1.7 + 1) * 0.2;
            ctx.save();
            ctx.globalAlpha = 0.85 * starPulse;
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * TAU - Math.PI / 2;
                const ai = ((i + 0.5) / 5) * TAU - Math.PI / 2;
                const or = 7 * starPulse, ir = 3.2 * starPulse;
                const x1 = sx + or * Math.cos(a), y1 = sy + or * Math.sin(a);
                const x2 = sx + ir * Math.cos(ai), y2 = sy + ir * Math.sin(ai);
                if (i === 0) ctx.moveTo(x1, y1);
                else {
                    ctx.lineTo(x1, y1);
                }
                ctx.lineTo(x2, y2);
            }
            ctx.closePath();
            ctx.fillStyle = "hsla(48,95%,92%,1)";
            ctx.shadowBlur = 8;
            ctx.shadowColor = "hsla(48,90%,85%,0.9)";
            ctx.fill();
            ctx.restore();
        };

        // ── DRAW LANTERNS ─────────────────────────────────────────────────────
        const drawLanterns = () => {
            const mouse = mouseRef.current;
            const moon = moonRef.current;

            pendulumRef.current.forEach((pen) => {
                // Proximity to mouse — disturb swing
                const bob: Vec2 = {
                    x: pen.pivot.x + Math.sin(pen.angle) * pen.length,
                    y: pen.pivot.y + Math.cos(pen.angle) * pen.length,
                };
                const dm = dist(bob, mouse);
                const prox = clamp(1 - dm / 180, 0, 1);

                // Spring force from mouse proximity
                if (prox > 0.01) {
                    const dx = bob.x - mouse.x;
                    pen.angleVel += (dx / pen.length) * prox * 0.006;
                }

                // Moon warmth affects glow
                const moonProx = clamp(1 - dist(bob, moon) / MOON_FIELD_RADIUS, 0, 1);

                pen.angleAcc = -PENDULUM_GRAVITY * Math.sin(pen.angle);
                pen.angleVel += pen.angleAcc;
                pen.angleVel *= PENDULUM_DAMPING;
                pen.angle += pen.angleVel;

                pen.targetGlow = 0.4 + prox * 0.5 + moonProx * 0.2 +
                    Math.sin(frameRef.current * 0.04 + pen.idx) * 0.08;
                pen.glowIntensity = lerp(pen.glowIntensity, pen.targetGlow, 0.06);

                const bx = pen.pivot.x + Math.sin(pen.angle) * pen.length;
                const by = pen.pivot.y + Math.cos(pen.angle) * pen.length;

                const h = pen.colorH;
                const gi = pen.glowIntensity;

                // Cord
                ctx.beginPath();
                ctx.moveTo(pen.pivot.x, pen.pivot.y - 2);
                // Organic cord: bezier with slight curve from sway
                ctx.bezierCurveTo(
                    pen.pivot.x + Math.sin(pen.angle) * pen.length * 0.3,
                    pen.pivot.y + pen.length * 0.3,
                    bx + Math.sin(pen.angle) * 5,
                    by - pen.length * 0.3,
                    bx, by - 14
                );
                ctx.strokeStyle = `hsla(36,50%,55%,0.45)`;
                ctx.lineWidth = 0.8;
                ctx.stroke();

                // Outer glow field
                drawGlowCircle(bx, by, 18, `hsl(${h},80%,65%)`, gi * 0.25, 38);
                // Mid glow
                drawGlowCircle(bx, by, 10, `hsl(${h},85%,70%)`, gi * 0.5, 22);

                // Lantern body — organic barrel shape
                ctx.save();
                ctx.translate(bx, by);
                ctx.rotate(pen.angle * 0.3);

                const lW = 13, lH = 22;

                // Body gradient
                const lg = ctx.createLinearGradient(-lW, -lH, lW, lH);
                lg.addColorStop(0, `hsla(${h},80%,62%,${0.8 + gi * 0.15})`);
                lg.addColorStop(0.4, `hsla(${h + 10},60%,82%,${0.5 + gi * 0.2})`);
                lg.addColorStop(1, `hsla(${h},75%,48%,${0.8 + gi * 0.1})`);

                ctx.beginPath();
                // Organic barrel: series of bezier curves
                ctx.moveTo(0, -lH);
                ctx.bezierCurveTo(lW * 0.6, -lH * 0.7, lW, -lH * 0.3, lW, 0);
                ctx.bezierCurveTo(lW, lH * 0.3, lW * 0.6, lH * 0.7, 0, lH);
                ctx.bezierCurveTo(-lW * 0.6, lH * 0.7, -lW, lH * 0.3, -lW, 0);
                ctx.bezierCurveTo(-lW, -lH * 0.3, -lW * 0.6, -lH * 0.7, 0, -lH);
                ctx.closePath();
                ctx.fillStyle = lg;
                ctx.fill();

                // Inner flame glow
                const fg = ctx.createRadialGradient(0, lH * 0.1, 0, 0, 0, lH * 0.6);
                fg.addColorStop(0, `hsla(48,100%,85%,${gi * 0.8})`);
                fg.addColorStop(0.5, `hsla(${h + 15},90%,70%,${gi * 0.4})`);
                fg.addColorStop(1, `hsla(${h},80%,55%,0)`);
                ctx.fillStyle = fg;
                ctx.fill();

                // Top & bottom cap
                ctx.fillStyle = `hsla(36,55%,52%,0.9)`;
                ctx.beginPath();
                ctx.ellipse(0, -lH, lW * 0.55, 3.5, 0, 0, TAU);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(0, lH, lW * 0.55, 3.5, 0, 0, TAU);
                ctx.fill();

                // Tassel
                ctx.beginPath();
                ctx.moveTo(0, lH + 3.5);
                ctx.bezierCurveTo(1.5, lH + 8, 0.5, lH + 11, 0, lH + 14);
                ctx.strokeStyle = `hsla(36,55%,52%,0.7)`;
                ctx.lineWidth = 1.2;
                ctx.stroke();

                ctx.restore();

                // Light pool beneath
                drawGlowCircle(bx, by + lH + 14, 3, `hsl(${h},80%,70%)`, gi * 0.18, 28);
            });
        };

        // ── DRAW GEOMETRIC PATTERN ────────────────────────────────────────────
        // Pattern morphs: attractors pull particles; pattern itself is drawn
        // as a soft ghost, while particles fill it
        const drawGeometricGhost = (W: number, H: number, strength: number) => {
            if (strength < 0.01) return;
            const cx = W * 0.5, cy = H * 0.38;
            ctx.save();
            ctx.globalAlpha = strength * 0.08;

            // 8-pointed star outline
            const R = W * 0.18, r = W * 0.09;
            ctx.beginPath();
            for (let i = 0; i < 16; i++) {
                const a = (i / 16) * TAU - Math.PI / 2;
                const rad = i % 2 === 0 ? R : r;
                const x = cx + rad * Math.cos(a);
                const y = cy + rad * Math.sin(a);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.strokeStyle = "hsla(42,80%,72%,1)";
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Inner octagon
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const a = (i / 8) * TAU - Math.PI / 2;
                const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();

            ctx.restore();
        };

        // ── CALLIGRAPHY ATTRACTOR PULSE ───────────────────────────────────────
        // Attractors breathe in & out — when active, particles rush to them
        const updateAttractors = (t: number, ramadan: boolean) => {
            const atts = attractorsRef.current;
            if (!ramadan) {
                atts.forEach((a) => { a.strength = lerp(a.strength, 0, 0.05); });
                return;
            }
            // Slow breath cycle: attractors activate in waves
            const wave = Math.sin(t * 0.0008);
            const globalStrength = clamp((wave + 1) * 0.5, 0, 1);

            atts.forEach((a, i) => {
                const phaseOffset = (i / atts.length) * TAU;
                const localS = clamp(Math.sin(t * 0.0012 + phaseOffset) * 0.5 + 0.5, 0, 1);
                a.strength = lerp(a.strength, localS * globalStrength * 0.7, 0.02);
                a.active = a.strength > 0.1;
            });
        };

        // ── PARTICLE PHYSICS ──────────────────────────────────────────────────
        const updateParticles = (W: number, H: number, ramadan: boolean, t: number) => {
            const mouse = mouseRef.current;
            const moon = moonRef.current;
            const particles = particlesRef.current;
            const attractors = attractorsRef.current;

            particles.forEach((p, i) => {
                // Reset acceleration
                p.acc.x = 0;
                p.acc.y = 0;

                // ── Spring toward rest position ────────────────────────────────
                const springX = (p.rest.x - p.pos.x) * SPRING_K;
                const springY = (p.rest.y - p.pos.y) * SPRING_K;
                p.acc.x += springX;
                p.acc.y += springY;

                // ── Organic breathing (sinusoidal drift) ──────────────────────
                p.phase += p.phaseSpeed;
                const breathAmp = 0.08;
                p.acc.x += Math.sin(p.phase) * breathAmp;
                p.acc.y += Math.cos(p.phase * 1.3) * breathAmp;

                // ── Cursor gravity well ────────────────────────────────────────
                const dx = mouse.x - p.pos.x;
                const dy = mouse.y - p.pos.y;
                const d = Math.sqrt(dx * dx + dy * dy);

                if (d < CURSOR_GRAVITY && d > 0.1) {
                    const norm = 1 / d;
                    if (d < REPEL_RADIUS) {
                        // Inner zone: repel
                        const repelF = (REPEL_RADIUS - d) / REPEL_RADIUS;
                        p.acc.x -= dx * norm * repelF * 3.5 / p.mass;
                        p.acc.y -= dy * norm * repelF * 3.5 / p.mass;
                    } else {
                        // Outer zone: soft magnetic pull
                        const falloff = Math.pow(1 - d / CURSOR_GRAVITY, 2);
                        p.acc.x += dx * norm * falloff * CURSOR_FORCE / p.mass;
                        p.acc.y += dy * norm * falloff * CURSOR_FORCE / p.mass;
                    }

                    // Light up toward cursor
                    p.targetL = ramadan ? 82 : 88;
                    p.targetA = 0.85;
                    p.targetS = 90;
                } else {
                    // Settle back
                    p.targetL = ramadan ? 68 : 72;
                    p.targetA = 0.18 + Math.sin(p.phase) * 0.04;
                    p.targetS = ramadan ? 70 : 75;
                }

                // ── Moon warm field (Ramadan only) ─────────────────────────────
                if (ramadan) {
                    const dm = dist(p.pos, moon);
                    if (dm < MOON_FIELD_RADIUS) {
                        const warmth = clamp(1 - dm / MOON_FIELD_RADIUS, 0, 1) * moon.fieldStrength;
                        p.targetH = lerp(p.h, RAMADAN_HUES[0], warmth * 0.6);
                        p.targetL = lerp(p.l, 85, warmth * 0.5);
                        p.targetA = lerp(p.a, 0.7, warmth * 0.4);
                    } else {
                        const baseH = RAMADAN_HUES[i % RAMADAN_HUES.length];
                        p.targetH = lerp(p.h, baseH, 0.05);
                    }
                }

                // ── Sacred geometry attractors ─────────────────────────────────
                if (ramadan) {
                    let totalAF = 0;
                    attractors.forEach((att, ai) => {
                        if (!att.active || att.strength < 0.01) return;
                        const da = dist(p.pos, att.pos);
                        if (da < att.radius * 3) {
                            const f = (1 - da / (att.radius * 3)) * att.strength;
                            const nx = (att.pos.x - p.pos.x) / (da + 0.1);
                            const ny = (att.pos.y - p.pos.y) / (da + 0.1);
                            p.acc.x += nx * f * 1.2;
                            p.acc.y += ny * f * 1.2;
                            totalAF += f;
                        }
                    });
                    if (totalAF > 0.3) {
                        p.targetA = Math.min(p.targetA + totalAF * 0.4, 0.95);
                        p.targetL = Math.min(p.targetL + totalAF * 20, 92);
                    }
                }

                // ── Integrate ─────────────────────────────────────────────────
                p.vel.x = (p.vel.x + p.acc.x) * DAMPING;
                p.vel.y = (p.vel.y + p.acc.y) * DAMPING;

                // Clamp speed
                const speed = Math.sqrt(p.vel.x ** 2 + p.vel.y ** 2);
                if (speed > MAX_SPEED) {
                    const scale = MAX_SPEED / speed;
                    p.vel.x *= scale;
                    p.vel.y *= scale;
                }

                p.pos.x += p.vel.x;
                p.pos.y += p.vel.y;

                // Soft boundary — push back from edges
                const margin = 20;
                if (p.pos.x < margin) p.vel.x += (margin - p.pos.x) * 0.1;
                if (p.pos.x > W - margin) p.vel.x -= (p.pos.x - (W - margin)) * 0.1;
                if (p.pos.y < margin) p.vel.y += (margin - p.pos.y) * 0.1;
                if (p.pos.y > H - margin) p.vel.y -= (p.pos.y - (H - margin)) * 0.1;

                // ── Color interpolation (smooth) ──────────────────────────────
                p.h = lerp(p.h, p.targetH, 0.04);
                p.s = lerp(p.s, p.targetS, 0.04);
                p.l = lerp(p.l, p.targetL, 0.04);
                p.a = lerp(p.a, p.targetA, 0.06);

                // ── Dynamic radius ────────────────────────────────────────────
                const targetR = d < CURSOR_GRAVITY
                    ? p.baseRadius * (1 + (1 - d / CURSOR_GRAVITY) * 1.8)
                    : p.baseRadius;
                p.radius = lerp(p.radius, targetR, 0.1);
            });
        };

        // ── DRAW PARTICLES ────────────────────────────────────────────────────
        const drawParticles = (ramadan: boolean) => {
            const particles = particlesRef.current;
            const mouse = mouseRef.current;

            particles.forEach((p, i) => {
                // Core glow dot
                const gr = ctx.createRadialGradient(
                    p.pos.x, p.pos.y, 0,
                    p.pos.x, p.pos.y, p.radius * 3
                );
                gr.addColorStop(0, hsla(p.h, p.s, p.l, p.a));
                gr.addColorStop(0.45, hsla(p.h, p.s, p.l, p.a * 0.4));
                gr.addColorStop(1, hsla(p.h, p.s, p.l, 0));

                ctx.beginPath();
                ctx.arc(p.pos.x, p.pos.y, p.radius * 3, 0, TAU);
                ctx.fillStyle = gr;
                ctx.fill();

                // Connection web — only between nearby attracted particles
                if (p.a > 0.4) {
                    for (let j = i + 1; j < particles.length; j++) {
                        const q = particles[j];
                        if (q.a < 0.25) continue;
                        const ed = dist(p.pos, q.pos);
                        if (ed < CONNECTION_DIST) {
                            const lineA = (1 - ed / CONNECTION_DIST) * Math.min(p.a, q.a) * 0.2;
                            // Organic curved connection: bezier through midpoint with slight offset
                            const mx = (p.pos.x + q.pos.x) * 0.5;
                            const my = (p.pos.y + q.pos.y) * 0.5;
                            const offset = Math.sin(frameRef.current * 0.01 + i * 0.3) * 4;
                            ctx.beginPath();
                            ctx.moveTo(p.pos.x, p.pos.y);
                            ctx.quadraticCurveTo(mx + offset, my - offset, q.pos.x, q.pos.y);
                            ctx.strokeStyle = hsla(
                                (p.h + q.h) * 0.5,
                                (p.s + q.s) * 0.5,
                                (p.l + q.l) * 0.5,
                                lineA
                            );
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }
                }
            });
        };

        // ── DRAW CURSOR GLOW ──────────────────────────────────────────────────
        const drawCursorGlow = (ramadan: boolean) => {
            const m = mouseRef.current;
            if (m.x < 0) return;

            const speed = Math.sqrt(mouseVelRef.current.x ** 2 + mouseVelRef.current.y ** 2);
            const hue = ramadan ? 42 : 210;
            const glowR = CURSOR_GRAVITY * (0.8 + speed * 0.02);

            const cg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, glowR);
            cg.addColorStop(0, hsla(hue, 80, 75, 0.035 + speed * 0.003));
            cg.addColorStop(0.5, hsla(hue, 70, 65, 0.015));
            cg.addColorStop(1, hsla(hue, 60, 55, 0));
            ctx.beginPath();
            ctx.arc(m.x, m.y, glowR, 0, TAU);
            ctx.fillStyle = cg;
            ctx.fill();

            // Tiny inner core
            const ig = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 6);
            ig.addColorStop(0, hsla(hue, 90, 90, 0.4 + speed * 0.04));
            ig.addColorStop(1, hsla(hue, 80, 80, 0));
            ctx.beginPath();
            ctx.arc(m.x, m.y, 6, 0, TAU);
            ctx.fillStyle = ig;
            ctx.fill();
        };

        // ── DRAW ARCHES ───────────────────────────────────────────────────────
        const drawArches = (W: number, H: number, ramadan: boolean) => {
            if (!ramadan) return;
            const count = 7;
            const archW = W / count;
            const archH = 160;

            // Gradient fill
            const ag = ctx.createLinearGradient(0, H - archH, 0, H);
            ag.addColorStop(0, "hsla(240,35%,12%,0)");
            ag.addColorStop(0.3, "hsla(240,35%,8%,0.6)");
            ag.addColorStop(1, "hsla(240,40%,5%,0.98)");

            ctx.save();
            ctx.beginPath();
            for (let i = 0; i < count; i++) {
                const x = i * archW;
                const mid = x + archW / 2;
                const peak = H - archH + 10;
                if (i === 0) ctx.moveTo(x, H);
                ctx.lineTo(x, H - archH * 0.6);
                // Organic bezier arch — no straight lines
                ctx.bezierCurveTo(
                    x + archW * 0.05, H - archH * 0.85,
                    mid - archW * 0.2, peak,
                    mid, peak
                );
                ctx.bezierCurveTo(
                    mid + archW * 0.2, peak,
                    x + archW * 0.95, H - archH * 0.85,
                    x + archW, H - archH * 0.6
                );
                ctx.lineTo(x + archW, H);
            }
            ctx.closePath();
            ctx.fillStyle = ag;
            ctx.fill();

            // Gold trim — organic curve
            ctx.beginPath();
            for (let i = 0; i < count; i++) {
                const x = i * archW;
                const mid = x + archW / 2;
                const peak = H - archH + 10;
                if (i === 0) ctx.moveTo(x, H - archH * 0.6);
                else ctx.lineTo(x, H - archH * 0.6);
                ctx.bezierCurveTo(
                    x + archW * 0.05, H - archH * 0.85,
                    mid - archW * 0.2, peak,
                    mid, peak
                );
                ctx.bezierCurveTo(
                    mid + archW * 0.2, peak,
                    x + archW * 0.95, H - archH * 0.85,
                    x + archW, H - archH * 0.6
                );
            }
            ctx.strokeStyle = "hsla(42,80%,60%,0.4)";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.restore();
        };

        // ── AMBIENT BACKGROUND ────────────────────────────────────────────────
        const drawBackground = (W: number, H: number, ramadan: boolean, t: number) => {
            const breathe = Math.sin(t * 0.0006) * 0.03;
            if (ramadan) {
                // Deep indigo-navy night
                const bg = ctx.createRadialGradient(W * 0.68, H * 0.08, 0, W * 0.5, H * 0.5, H);
                bg.addColorStop(0, `hsla(245,55%,${13 + breathe * 100}%,1)`);
                bg.addColorStop(0.4, "hsla(240,45%,8%,1)");
                bg.addColorStop(1, "hsla(235,50%,4%,1)");
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, W, H);

                // Subtle nebula wisps — organic blobs
                const wispT = t * 0.0004;
                [[W * 0.2, H * 0.25, 200], [W * 0.7, H * 0.15, 150], [W * 0.45, H * 0.5, 180]].forEach(
                    ([wx, wy, wr]) => {
                        const wg = ctx.createRadialGradient(
                            wx + Math.sin(wispT) * 20, wy + Math.cos(wispT * 0.7) * 15, 0,
                            wx, wy, wr
                        );
                        wg.addColorStop(0, "hsla(260,40%,18%,0.35)");
                        wg.addColorStop(1, "hsla(260,30%,10%,0)");
                        ctx.beginPath();
                        ctx.arc(wx, wy, wr, 0, TAU);
                        ctx.fillStyle = wg;
                        ctx.fill();
                    }
                );
            } else {
                // Deep space — near-black with a cool blue-violet tinge
                const bg = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.6, H * 1.1);
                bg.addColorStop(0, `hsla(225,40%,${7 + breathe * 60}%,1)`);
                bg.addColorStop(0.5, "hsla(220,35%,4%,1)");
                bg.addColorStop(1, "hsla(215,40%,2%,1)");
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, W, H);
            }
        };

        // ── SCROLL TURBULENCE ─────────────────────────────────────────────────
        const applyScrollTurbulence = (dy: number) => {
            if (Math.abs(dy) < 0.5) return;
            particlesRef.current.forEach((p) => {
                p.vel.y += dy * SCROLL_TURBULENCE * (Math.random() - 0.3);
                p.vel.x += (Math.random() - 0.5) * Math.abs(dy) * SCROLL_TURBULENCE * 0.5;
            });
        };

        // ── MAIN LOOP ─────────────────────────────────────────────────────────
        const tick = (t: number) => {
            animRef.current = requestAnimationFrame(tick);
            frameRef.current++;
            const { W, H } = sizeRef.current;
            const ramadan = modeRef.current;

            // Scroll turbulence
            const scrollDelta = (scrollY - prevScrollRef.current);
            prevScrollRef.current = scrollY;
            applyScrollTurbulence(scrollDelta);

            ctx.clearRect(0, 0, W, H);

            // 1. Background
            drawBackground(W, H, ramadan, t);

            // 2. Sacred geometry ghost
            if (ramadan) {
                const totalStrength = attractorsRef.current.reduce(
                    (sum, a) => sum + a.strength, 0
                ) / attractorsRef.current.length;
                drawGeometricGhost(W, H, totalStrength);
                updateAttractors(t, ramadan);
            }

            // 3. Update particle physics
            updateParticles(W, H, ramadan, t);

            // 4. Draw particles
            drawParticles(ramadan);

            // 5. Ramadan elements
            if (ramadan) {
                drawMoon(t);
                drawLanterns();
                drawArches(W, H, ramadan);
            }

            // 6. Cursor glow (top layer)
            drawCursorGlow(ramadan);
        };

        animRef.current = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMove);
        };
    }, [initParticles, initAttractors, initPendulums]);

    // ── Sync mode changes (smooth transition) ────────────────────────────────
    useEffect(() => {
        modeRef.current = isRamadan;
        // Recolor particles toward new palette
        const hues = isRamadan ? RAMADAN_HUES : SPACE_HUES;
        particlesRef.current.forEach((p, i) => {
            p.targetH = hues[i % hues.length];
            p.targetS = isRamadan ? 70 : 75;
        });
    }, [isRamadan]);

    // ── Sync scroll ───────────────────────────────────────────────────────────
    useEffect(() => {
        // handled via ref inside loop
    }, [scrollY]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 0,
                pointerEvents: "none",
                width: "100%",
                height: "100%",
            } as CSSProperties}
        />
    );
};

export default UniverseCanvas;