import { useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    originX: number;
    originY: number;
    size: number;
    color: string;
    alpha: number;
    life: number;
    maxLife: number;
    type: "grid" | "cursor" | "burst";
    hue: number;
    phase: number;        // for sine wobble
    attracted: boolean;
}

interface MouseState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    prevX: number;
    prevY: number;
    down: boolean;
    speed: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const GRID_COLS = 18;
const GRID_ROWS = 10;
const ATTRACT_RADIUS = 140;
const REPEL_RADIUS = 60;
const BURST_ON_CLICK = 22;
const CURSOR_TRAIL_RATE = 2; // particles per frame when moving fast

// Palette: cool blue-violet-cyan tech feel
const PALETTE = [
    "210,90%,70%",   // sky blue
    "240,85%,75%",   // lavender
    "190,95%,65%",   // cyan
    "260,80%,72%",   // violet
    "170,90%,60%",   // teal
];

// ─── Component ────────────────────────────────────────────────────────────────
const AmbientCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef<MouseState>({
        x: -999, y: -999, vx: 0, vy: 0,
        prevX: -999, prevY: -999, down: false, speed: 0,
    });
    const frameRef = useRef(0);

    // ── Build the grid of resting particles ──────────────────────────────────
    const buildGrid = useCallback((W: number, H: number) => {
        const grid: Particle[] = [];
        const xStep = W / (GRID_COLS + 1);
        const yStep = H / (GRID_ROWS + 1);

        for (let row = 1; row <= GRID_ROWS; row++) {
            for (let col = 1; col <= GRID_COLS; col++) {
                const ox = xStep * col;
                const oy = yStep * row;
                const hue = PALETTE[Math.floor(Math.random() * PALETTE.length)];
                grid.push({
                    x: ox, y: oy,
                    vx: 0, vy: 0,
                    originX: ox, originY: oy,
                    size: 1.6 + Math.random() * 1.8,
                    color: hue,
                    alpha: 0.15 + Math.random() * 0.25,
                    life: 1, maxLife: 1,
                    type: "grid",
                    hue: parseFloat(hue),
                    phase: Math.random() * Math.PI * 2,
                    attracted: false,
                });
            }
        }
        return grid;
    }, []);

    // ── Spawn a cursor-trail particle ────────────────────────────────────────
    const spawnTrail = useCallback((mouse: MouseState) => {
        const hue = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        const p: Particle = {
            x: mouse.x + (Math.random() - 0.5) * 8,
            y: mouse.y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 1.2 - mouse.vx * 0.15,
            vy: (Math.random() - 0.5) * 1.2 - mouse.vy * 0.15,
            originX: mouse.x, originY: mouse.y,
            size: 1.5 + Math.random() * 2.5,
            color: hue,
            alpha: 0.7 + Math.random() * 0.3,
            life: 1, maxLife: 1,
            type: "cursor",
            hue: parseFloat(hue),
            phase: 0,
            attracted: false,
        };
        return p;
    }, []);

    // ── Spawn burst on click ─────────────────────────────────────────────────
    const spawnBurst = useCallback((x: number, y: number): Particle[] => {
        return Array.from({ length: BURST_ON_CLICK }, (_, i) => {
            const angle = (i / BURST_ON_CLICK) * Math.PI * 2 + Math.random() * 0.4;
            const speed = 3 + Math.random() * 6;
            const hue = PALETTE[Math.floor(Math.random() * PALETTE.length)];
            return {
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                originX: x, originY: y,
                size: 2 + Math.random() * 3,
                color: hue,
                alpha: 1,
                life: 1, maxLife: 1,
                type: "burst",
                hue: parseFloat(hue),
                phase: 0,
                attracted: false,
            } as Particle;
        });
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;

        let W = 0, H = 0;

        const resize = () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            // Rebuild grid preserving cursor/burst particles
            const existing = particlesRef.current.filter(p => p.type !== "grid");
            particlesRef.current = [...buildGrid(W, H), ...existing];
        };

        resize();
        window.addEventListener("resize", resize);

        // ── Mouse events ──────────────────────────────────────────────────────
        const onMove = (e: MouseEvent) => {
            const m = mouseRef.current;
            m.prevX = m.x; m.prevY = m.y;
            m.x = e.clientX; m.y = e.clientY;
            m.vx = m.x - m.prevX; m.vy = m.y - m.prevY;
            m.speed = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
        };

        const onDown = (e: MouseEvent) => {
            mouseRef.current.down = true;
            particlesRef.current.push(...spawnBurst(e.clientX, e.clientY));
        };

        const onUp = () => { mouseRef.current.down = false; };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mousedown", onDown);
        window.addEventListener("mouseup", onUp);

        // ── Main loop ─────────────────────────────────────────────────────────
        const tick = () => {
            animRef.current = requestAnimationFrame(tick);
            frameRef.current++;

            ctx.clearRect(0, 0, W, H);

            const mouse = mouseRef.current;

            // Spawn trail particles when mouse moves fast
            if (mouse.speed > 3 && frameRef.current % CURSOR_TRAIL_RATE === 0) {
                particlesRef.current.push(spawnTrail(mouse));
            }

            const toRemove: number[] = [];
            const t = frameRef.current * 0.01;

            particlesRef.current.forEach((p, i) => {
                // ── GRID PARTICLES ────────────────────────────────────────────────
                if (p.type === "grid") {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Wobble at rest
                    const wobbleX = Math.sin(t * 0.8 + p.phase) * 0.4;
                    const wobbleY = Math.cos(t * 0.6 + p.phase * 1.3) * 0.4;

                    if (dist < ATTRACT_RADIUS) {
                        p.attracted = true;
                        const force = (ATTRACT_RADIUS - dist) / ATTRACT_RADIUS;

                        if (dist < REPEL_RADIUS) {
                            // Repel from cursor core
                            const repel = (REPEL_RADIUS - dist) / REPEL_RADIUS;
                            p.vx -= (dx / dist) * repel * 4;
                            p.vy -= (dy / dist) * repel * 4;
                        } else {
                            // Attract toward cursor ring
                            p.vx += (dx / dist) * force * 2.2;
                            p.vy += (dy / dist) * force * 2.2;
                        }
                    } else {
                        p.attracted = false;
                    }

                    // Spring back to origin
                    const toOx = p.originX - p.x;
                    const toOy = p.originY - p.y;
                    p.vx += (toOx + wobbleX) * 0.06;
                    p.vy += (toOy + wobbleY) * 0.06;

                    // Friction
                    p.vx *= 0.82;
                    p.vy *= 0.82;

                    p.x += p.vx;
                    p.y += p.vy;

                    // Dynamic alpha: brighter when attracted
                    const targetAlpha = p.attracted
                        ? 0.6 + Math.sin(t * 3 + p.phase) * 0.2
                        : 0.1 + Math.sin(t * 0.5 + p.phase) * 0.06;
                    p.alpha += (targetAlpha - p.alpha) * 0.1;

                    // Dynamic size
                    const targetSize = p.attracted
                        ? (p.size * 2.2)
                        : p.size;
                    const currentSize = p.attracted ? targetSize : p.size;

                    // Draw
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize * 2);
                    gradient.addColorStop(0, `hsla(${p.color},${p.alpha})`);
                    gradient.addColorStop(1, `hsla(${p.color},0)`);

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, currentSize * 2, 0, Math.PI * 2);
                    ctx.fillStyle = gradient;
                    ctx.fill();

                    // Draw connection lines between nearby attracted particles
                    if (p.attracted) {
                        particlesRef.current.forEach((q) => {
                            if (q !== p && q.attracted && q.type === "grid") {
                                const ex = q.x - p.x;
                                const ey = q.y - p.y;
                                const ed = Math.sqrt(ex * ex + ey * ey);
                                if (ed < 80) {
                                    const lineAlpha = (1 - ed / 80) * 0.18;
                                    ctx.beginPath();
                                    ctx.moveTo(p.x, p.y);
                                    ctx.lineTo(q.x, q.y);
                                    ctx.strokeStyle = `hsla(${p.color},${lineAlpha})`;
                                    ctx.lineWidth = 0.6;
                                    ctx.stroke();
                                }
                            }
                        });
                    }
                }

                // ── CURSOR TRAIL PARTICLES ────────────────────────────────────────
                if (p.type === "cursor") {
                    p.life -= 0.04;
                    if (p.life <= 0) { toRemove.push(i); return; }

                    p.vx *= 0.92;
                    p.vy *= 0.92;
                    p.vy -= 0.04; // slight float up

                    p.x += p.vx;
                    p.y += p.vy;

                    const a = p.life * 0.8;
                    const s = p.size * p.life;

                    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 2.5);
                    g.addColorStop(0, `hsla(${p.color},${a})`);
                    g.addColorStop(0.5, `hsla(${p.color},${a * 0.4})`);
                    g.addColorStop(1, `hsla(${p.color},0)`);

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, s * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = g;
                    ctx.fill();
                }

                // ── BURST PARTICLES ───────────────────────────────────────────────
                if (p.type === "burst") {
                    p.life -= 0.025;
                    if (p.life <= 0) { toRemove.push(i); return; }

                    p.vx *= 0.94;
                    p.vy *= 0.94;
                    p.vy -= 0.08; // float upward

                    p.x += p.vx;
                    p.y += p.vy;

                    const a = p.life;
                    const s = p.size * (0.5 + p.life * 0.5);

                    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * 3);
                    g.addColorStop(0, `hsla(${p.color},${a})`);
                    g.addColorStop(0.4, `hsla(${p.color},${a * 0.5})`);
                    g.addColorStop(1, `hsla(${p.color},0)`);

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, s * 3, 0, Math.PI * 2);
                    ctx.fillStyle = g;
                    ctx.fill();
                }
            });

            // Remove dead particles (reverse to preserve indices)
            for (let i = toRemove.length - 1; i >= 0; i--) {
                particlesRef.current.splice(toRemove[i], 1);
            }

            // ── Draw soft cursor glow ─────────────────────────────────────────
            if (mouse.x > 0) {
                const cg = ctx.createRadialGradient(
                    mouse.x, mouse.y, 0,
                    mouse.x, mouse.y, ATTRACT_RADIUS
                );
                cg.addColorStop(0, "hsla(220,90%,70%,0.04)");
                cg.addColorStop(0.4, "hsla(220,90%,70%,0.02)");
                cg.addColorStop(1, "hsla(220,90%,70%,0)");

                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, ATTRACT_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = cg;
                ctx.fill();

                // Inner cursor dot
                const ig = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 8);
                ig.addColorStop(0, "hsla(200,100%,80%,0.5)");
                ig.addColorStop(1, "hsla(200,100%,80%,0)");
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = ig;
                ctx.fill();
            }
        };

        tick();

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mousedown", onDown);
            window.removeEventListener("mouseup", onUp);
        };
    }, [buildGrid, spawnTrail, spawnBurst]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 0,
                pointerEvents: "none",
                opacity: 1,
            }}
        />
    );
};

export default AmbientCanvas;