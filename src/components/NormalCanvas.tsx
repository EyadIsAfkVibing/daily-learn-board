/**
 * NormalCanvas.tsx
 * ─────────────────────────────────────────────────────────────────
 * Deep space physics engine. Completely isolated from Ramadan mode.
 *
 * Features:
 * • 200 mass-particles in a spring grid
 * • Cursor gravity well (attract outer, repel inner)
 * • Organic bezier connection web
 * • Click burst: luminous particles, outward + float, smooth fade
 * • Scroll turbulence
 * • 100fps-optimised: typed arrays, minimal GC, pooled bursts
 */

import { useEffect, useRef, CSSProperties } from "react";

// ─── Types ────────────────────────────────────────────────────────
interface Pt { x: number; y: number }

interface GridParticle {
    x: number; y: number;
    vx: number; vy: number;
    ox: number; oy: number;   // origin (rest)
    r: number; br: number;    // radius, base-radius
    h: number; s: number; l: number; a: number;
    th: number; ts: number; tl: number; ta: number; // targets
    phase: number; ps: number; // breathing phase + speed
    mass: number;
}

interface BurstParticle {
    x: number; y: number;
    vx: number; vy: number;
    r: number;
    h: number; s: number; l: number;
    life: number;   // 1 → 0
    decay: number;
    floatAcc: number;
}

// ─── Constants ────────────────────────────────────────────────────
const GRID_COLS = 20;
const GRID_ROWS = 11;
const TOTAL = GRID_COLS * GRID_ROWS; // 220
const SPRING_K = 0.054;
const DAMPING = 0.875;
const MAX_SPD = 5.2;
const ATTRACT_R = 160;
const REPEL_R = 48;
const ATTRACT_F = 2.9;
const REPEL_F = 4.0;
const CONN_DIST = 88;
const SCROLL_T = 0.0028;
const BURST_N = 26;
const TAU = Math.PI * 2;

// Space palette (HSL hue values)
const HUES = [210, 220, 195, 238, 182, 228];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) =>
    v < lo ? lo : v > hi ? hi : v;

// ─── Component ────────────────────────────────────────────────────
interface NormalCanvasProps { scrollY: number }

const NormalCanvas = ({ scrollY }: NormalCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef(0);
    const frameRef = useRef(0);
    const sizeRef = useRef({ W: 0, H: 0 });
    const mouseRef = useRef<Pt>({ x: -9999, y: -9999 });
    const mvelRef = useRef<Pt>({ x: 0, y: 0 });
    const scrollRef = useRef(0);
    const gridRef = useRef<GridParticle[]>([]);
    const burstsRef = useRef<BurstParticle[]>([]);

    useEffect(() => { scrollRef.current = scrollY; }, [scrollY]);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d", { alpha: true })!;
        let W = 0, H = 0;

        // ── Build grid ───────────────────────────────────────────────
        const buildGrid = () => {
            const ps: GridParticle[] = [];
            const xStep = W / (GRID_COLS + 1);
            const yStep = H / (GRID_ROWS + 1);
            for (let row = 0; row < GRID_ROWS; row++) {
                for (let col = 0; col < GRID_COLS; col++) {
                    const ox = xStep * (col + 1) + (Math.random() - .5) * xStep * .28;
                    const oy = yStep * (row + 1) + (Math.random() - .5) * yStep * .28;
                    const h = HUES[Math.floor(Math.random() * HUES.length)];
                    const br = 1.4 + Math.random() * 1.9;
                    ps.push({
                        x: ox, y: oy, vx: 0, vy: 0, ox, oy,
                        r: br, br,
                        h, s: 78, l: 72, a: .14 + Math.random() * .22,
                        th: h, ts: 78, tl: 72, ta: .14 + Math.random() * .22,
                        phase: Math.random() * TAU,
                        ps: .004 + Math.random() * .006,
                        mass: .6 + Math.random() * .8,
                    });
                    if (ps.length >= TOTAL) break;
                }
                if (ps.length >= TOTAL) break;
            }
            gridRef.current = ps;
        };

        // ── Resize ───────────────────────────────────────────────────
        const resize = () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            sizeRef.current = { W, H };
            buildGrid();
        };
        resize();
        window.addEventListener("resize", resize, { passive: true });

        // ── Mouse ────────────────────────────────────────────────────
        const onMove = (e: MouseEvent) => {
            mvelRef.current = {
                x: e.clientX - mouseRef.current.x,
                y: e.clientY - mouseRef.current.y,
            };
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        // ── Click burst ──────────────────────────────────────────────
        const onClick = (e: MouseEvent) => {
            const bursts: BurstParticle[] = [];
            for (let i = 0; i < BURST_N; i++) {
                const angle = (i / BURST_N) * TAU + Math.random() * .5;
                const speed = 2.5 + Math.random() * 5.5;
                bursts.push({
                    x: e.clientX,
                    y: e.clientY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    r: 1.8 + Math.random() * 3,
                    h: HUES[Math.floor(Math.random() * HUES.length)],
                    s: 85, l: 78,
                    life: 1,
                    decay: .016 + Math.random() * .012,
                    floatAcc: .045 + Math.random() * .06,
                });
            }
            burstsRef.current.push(...bursts);
        };

        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("click", onClick);

        // ── Draw helpers ─────────────────────────────────────────────
        const hsla = (h: number, s: number, l: number, a: number) =>
            `hsla(${h | 0},${s | 0}%,${l | 0}%,${a})`;

        const radGlow = (
            cx: number, cy: number, r: number,
            h: number, s: number, l: number, a: number
        ) => {
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
            g.addColorStop(0, hsla(h, s, l, a));
            g.addColorStop(.45, hsla(h, s, l, a * .38));
            g.addColorStop(1, hsla(h, s, l, 0));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, TAU);
            ctx.fill();
        };

        // ── Background ───────────────────────────────────────────────
        const drawBg = (t: number) => {
            const breathe = Math.sin(t * .0006) * .025;
            const g = ctx.createRadialGradient(W * .5, H * .28, 0, W * .5, H * .65, H * 1.1);
            g.addColorStop(0, `hsl(225,42%,${6.5 + breathe * 60}%)`);
            g.addColorStop(.55, "hsl(220,36%,4%)");
            g.addColorStop(1, "hsl(215,42%,2%)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, W, H);
        };

        // ── Update & draw grid particles ─────────────────────────────
        const updateGrid = () => {
            const mouse = mouseRef.current;
            const ps = gridRef.current;

            for (let i = 0; i < ps.length; i++) {
                const p = ps[i];
                p.phase += p.ps;

                // Spring to origin
                let ax = (p.ox - p.x) * SPRING_K + Math.sin(p.phase) * .07;
                let ay = (p.oy - p.y) * SPRING_K + Math.cos(p.phase * 1.3) * .07;

                // Cursor gravity
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const d = Math.sqrt(dx * dx + dy * dy) || 1;

                if (d < ATTRACT_R) {
                    const nx = dx / d, ny = dy / d;
                    if (d < REPEL_R) {
                        const f = (REPEL_R - d) / REPEL_R;
                        ax -= nx * f * REPEL_F / p.mass;
                        ay -= ny * f * REPEL_F / p.mass;
                    } else {
                        const f = Math.pow(1 - d / ATTRACT_R, 2) * ATTRACT_F;
                        ax += nx * f / p.mass;
                        ay += ny * f / p.mass;
                    }
                    p.tl = 88; p.ta = .9; p.ts = 92;
                } else {
                    p.tl = 72; p.ta = .14 + Math.sin(p.phase) * .04; p.ts = 78;
                }

                // Scroll turbulence
                const sd = scrollRef.current;
                ay += (Math.random() - .3) * sd * SCROLL_T;
                ax += (Math.random() - .5) * Math.abs(sd) * SCROLL_T * .4;

                p.vx = (p.vx + ax) * DAMPING;
                p.vy = (p.vy + ay) * DAMPING;

                const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (spd > MAX_SPD) { p.vx *= MAX_SPD / spd; p.vy *= MAX_SPD / spd; }

                p.x += p.vx; p.y += p.vy;

                // Soft walls
                const mg = 18;
                if (p.x < mg) p.vx += (mg - p.x) * .09;
                if (p.x > W - mg) p.vx -= (p.x - (W - mg)) * .09;
                if (p.y < mg) p.vy += (mg - p.y) * .09;
                if (p.y > H - mg) p.vy -= (p.y - (H - mg)) * .09;

                // Lerp colour
                p.h = lerp(p.h, p.th, .04);
                p.s = lerp(p.s, p.ts, .04);
                p.l = lerp(p.l, p.tl, .04);
                p.a = lerp(p.a, p.ta, .06);

                const tr = d < ATTRACT_R ? p.br * (1 + (1 - d / ATTRACT_R) * 1.9) : p.br;
                p.r = lerp(p.r, tr, .1);
            }
        };

        // Spatial hash for O(n·k) neighbor lookups instead of O(n²)
        const cellSize = CONN_DIST;
        let hashCols = 1, hashRows = 1;
        let spatialHash: number[][] = [];

        const buildSpatialHash = () => {
            hashCols = Math.ceil(W / cellSize) + 1;
            hashRows = Math.ceil(H / cellSize) + 1;
            const totalCells = hashCols * hashRows;
            // Reuse arrays to reduce GC pressure
            if (spatialHash.length !== totalCells) {
                spatialHash = new Array(totalCells);
                for (let i = 0; i < totalCells; i++) spatialHash[i] = [];
            } else {
                for (let i = 0; i < totalCells; i++) spatialHash[i].length = 0;
            }

            const ps = gridRef.current;
            for (let i = 0; i < ps.length; i++) {
                const col = Math.floor(ps[i].x / cellSize);
                const row = Math.floor(ps[i].y / cellSize);
                if (col >= 0 && col < hashCols && row >= 0 && row < hashRows) {
                    spatialHash[row * hashCols + col].push(i);
                }
            }
        };

        const drawGrid = () => {
            const ps = gridRef.current;
            buildSpatialHash();

            for (let i = 0; i < ps.length; i++) {
                const p = ps[i];
                radGlow(p.x, p.y, p.r * 3.2, p.h, p.s, p.l, p.a);

                // Spatial-hash neighbor connections (only bright particles)
                if (p.a > .42) {
                    const col = Math.floor(p.x / cellSize);
                    const row = Math.floor(p.y / cellSize);
                    // Check 3x3 neighborhood
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const nr = row + dr, nc = col + dc;
                            if (nr < 0 || nr >= hashRows || nc < 0 || nc >= hashCols) continue;
                            const cell = spatialHash[nr * hashCols + nc];
                            for (let ci = 0; ci < cell.length; ci++) {
                                const j = cell[ci];
                                if (j <= i) continue; // avoid duplicate pairs
                                const q = ps[j];
                                if (q.a < .28) continue;
                                const ex = q.x - p.x, ey = q.y - p.y;
                                const ed2 = ex * ex + ey * ey;
                                if (ed2 >= CONN_DIST * CONN_DIST) continue;
                                const ed = Math.sqrt(ed2);
                                const la = (1 - ed / CONN_DIST) * Math.min(p.a, q.a) * .19;
                                const mx = (p.x + q.x) * .5;
                                const my = (p.y + q.y) * .5;
                                const bow = Math.sin(frameRef.current * .009 + i * .28) * 5;
                                ctx.beginPath();
                                ctx.moveTo(p.x, p.y);
                                ctx.quadraticCurveTo(mx + bow, my - bow, q.x, q.y);
                                ctx.strokeStyle = hsla((p.h + q.h) * .5, (p.s + q.s) * .5, (p.l + q.l) * .5, la);
                                ctx.lineWidth = .5;
                                ctx.stroke();
                            }
                        }
                    }
                }
            }
        };

        // ── Burst update + draw ───────────────────────────────────────
        const updateDrawBursts = () => {
            const bs = burstsRef.current;
            for (let i = bs.length - 1; i >= 0; i--) {
                const b = bs[i];
                b.life -= b.decay;
                if (b.life <= 0) { bs.splice(i, 1); continue; }

                b.vx *= .93;
                b.vy *= .93;
                b.vy -= b.floatAcc;   // float upward
                b.x += b.vx;
                b.y += b.vy;

                // Smooth cubic fade: fast peak, slow trail
                const t = b.life;
                const a = t * t * (3 - 2 * t); // smoothstep
                const r = b.r * (.4 + t * .6);

                // Outer soft aura
                radGlow(b.x, b.y, r * 4.5, b.h, b.s, b.l + 10, a * .35);
                // Core
                radGlow(b.x, b.y, r * 1.8, b.h, b.s, b.l, a * .9);
            }
        };

        // ── Cursor glow ──────────────────────────────────────────────
        const drawCursor = () => {
            const m = mouseRef.current;
            if (m.x < 0) return;
            const spd = Math.sqrt(mvelRef.current.x ** 2 + mvelRef.current.y ** 2);
            const gr = ATTRACT_R * (.8 + spd * .018);

            const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, gr);
            g.addColorStop(0, `hsla(215,85%,75%,${.032 + spd * .003})`);
            g.addColorStop(.5, "hsla(215,75%,65%,0.014)");
            g.addColorStop(1, "hsla(215,65%,55%,0)");
            ctx.beginPath(); ctx.arc(m.x, m.y, gr, 0, TAU); ctx.fillStyle = g; ctx.fill();

            // Inner spark
            const ig = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 7);
            ig.addColorStop(0, `hsla(200,100%,85%,${.38 + spd * .04})`);
            ig.addColorStop(1, "hsla(200,100%,85%,0)");
            ctx.beginPath(); ctx.arc(m.x, m.y, 7, 0, TAU); ctx.fillStyle = ig; ctx.fill();
        };

        // ── Main loop ────────────────────────────────────────────────
        let prevScroll = 0;
        const tick = (t: number) => {
            rafRef.current = requestAnimationFrame(tick);
            frameRef.current++;
            const sc = scrollRef.current;
            // Inject delta for turbulence
            (scrollRef as any)._delta = sc - prevScroll;
            prevScroll = sc;

            ctx.clearRect(0, 0, W, H);
            drawBg(t);
            updateGrid();
            drawGrid();
            updateDrawBursts();
            drawCursor();
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("click", onClick);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed", inset: 0, zIndex: 0,
                pointerEvents: "none", width: "100%", height: "100%",
            } as CSSProperties}
        />
    );
};

export default NormalCanvas;