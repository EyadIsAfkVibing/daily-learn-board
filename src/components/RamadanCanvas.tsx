/**
 * RamadanCanvas.tsx
 * ─────────────────────────────────────────────────────────────────
 * Completely isolated Ramadan rendering engine.
 * Zero shared logic with NormalCanvas.
 *
 * Architecture:
 * ┌─ Background Engine   4 depth layers, volumetric breathing
 * ├─ Ember Particle Pool organic Brownian + upward drift
 * ├─ Crescent System     particle-mesh halo, breathing glow
 * ├─ Lantern Physics     catenary cord, pendulum inertia
 * ├─ Geometry Engine     attractor trails, dissolving patterns
 * └─ Click Burst Pool    dedicated warm-palette burst system
 *
 * Ramadan 2035: Spiritual. Futuristic. Minimal. Alive.
 */

import { useEffect, useRef, CSSProperties } from "react";

// ─── Types ────────────────────────────────────────────────────────

interface Pt { x: number; y: number }

// Ember: warm floating particle
interface Ember {
    x: number; y: number;
    vx: number; vy: number;
    // Origin (drift anchor)
    ox: number; oy: number;
    r: number;
    // Warm HSL
    h: number; s: number; l: number;
    a: number; ta: number;
    // Brownian phase
    phase: number; ps: number;
    // Upward drift speed
    drift: number;
    // Cursor distortion state
    distX: number; distY: number;
}

// Crescent halo particle (held in formation)
interface HaloParticle {
    // Angle & radius on crescent arc
    arc: number;       // 0-TAU
    arcR: number;      // halo radius
    // World position (computed)
    x: number; y: number;
    // Wobble
    phase: number; ps: number;
    wobble: number;
    r: number;
    a: number; ta: number;
}

// Lantern
interface Lantern {
    pivotX: number; pivotY: number;
    cordLen: number;
    angle: number;
    angleVel: number;
    // Per-lantern colour
    h: number;
    glowI: number; targetGlowI: number;
    // Glow pulse phase
    phase: number;
    idx: number;
}

// Geometry trail node
interface GeoNode {
    // World target position
    tx: number; ty: number;
    // Current position (lerps toward target)
    x: number; y: number;
    // Connection to next node
    nextIdx: number;
    // Trail alpha
    a: number; ta: number;
    phase: number;
}

// Click burst
interface WarmBurst {
    x: number; y: number;
    vx: number; vy: number;
    r: number;
    h: number; s: number; l: number;
    life: number; decay: number;
    floatF: number;   // upward force
    spin: number;     // slight rotation for trail feel
}

// Background layer
interface BgLayer {
    cx: number; cy: number;  // center (parallax-shifted)
    r: number;               // radius
    h: number; s: number; l: number;
    a: number;
    phase: number; ps: number;
    // Parallax depth (0=far, 1=near)
    depth: number;
}

// ─── Constants ────────────────────────────────────────────────────

const TAU = Math.PI * 2;
const EMBER_COUNT = 180;
const HALO_COUNT = 72;         // particles forming crescent halo
const LANTERN_N = 6;
const GEO_NODES = 17;         // 8-pointed star + inner octagon + center
const BURST_N = 30;
const BG_LAYERS = 5;

// Warm Ramadan palette (hue values)
const WARM_H = [38, 32, 44, 28, 48, 35];
const EMBER_H = [40, 34, 46, 30, 50, 36, 38, 42];

// Lantern colours
const LANT_H = [8, 30, 320, 200, 270, 155];

// Physics
const EMBER_DAMPING = 0.96;
const EMBER_SPRING = 0.008;   // very soft — embers barely hold position
const CURSOR_DIST_R = 130;     // distortion radius
const CURSOR_DIST_F = 1.8;     // distortion force
const PEND_G = 0.0038;
const PEND_DAMP = 0.9965;
const SCROLL_K = 0.0022;

// Moon position (normalised)
const MOON_NX = 0.88;
const MOON_NY = 0.13;
const MOON_R = 52;

// Lantern positions (normalised x, pivot y)
const LANT_POS: [number, number][] = [
    [.08, .06], [.22, .04], [.38, .055],
    [.62, .055], [.78, .04], [.92, .06],
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => v < lo ? lo : v > hi ? hi : v;
const hsla = (h: number, s: number, l: number, a: number) =>
    `hsla(${h | 0},${s | 0}%,${l | 0}%,${a.toFixed(3)})`;
const rr = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

// ─── Sacred geometry: 8-point star vertices ───────────────────────
const buildGeoTargets = (W: number, H: number): Pt[] => {
    const cx = W * .5, cy = H * .36;
    const R = Math.min(W, H) * .175;
    const r = R * .48;
    const pts: Pt[] = [];
    for (let i = 0; i < 8; i++) {
        const ao = (i / 8) * TAU - Math.PI / 2;
        const ai = ((i + .5) / 8) * TAU - Math.PI / 2;
        pts.push({ x: cx + R * Math.cos(ao), y: cy + R * Math.sin(ao) });
        pts.push({ x: cx + r * Math.cos(ai), y: cy + r * Math.sin(ai) });
    }
    pts.push({ x: cx, y: cy }); // center
    return pts;
};

// ─── Component ────────────────────────────────────────────────────

interface RamadanCanvasProps { scrollY: number }

const RamadanCanvas = ({ scrollY }: RamadanCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafRef = useRef(0);
    const frameRef = useRef(0);
    const sizeRef = useRef({ W: 0, H: 0 });
    const mouseRef = useRef<Pt>({ x: -9999, y: -9999 });
    const mvelRef = useRef<Pt>({ x: 0, y: 0 });
    const scrollRef = useRef(0);
    const prevScRef = useRef(0);

    // Dedicated Ramadan state — completely isolated
    const embersRef = useRef<Ember[]>([]);
    const haloRef = useRef<HaloParticle[]>([]);
    const lanternsRef = useRef<Lantern[]>([]);
    const geoRef = useRef<GeoNode[]>([]);
    const burstsRef = useRef<WarmBurst[]>([]);
    const bgRef = useRef<BgLayer[]>([]);

    useEffect(() => { scrollRef.current = scrollY; }, [scrollY]);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d", { alpha: true })!;
        let W = 0, H = 0;
        let moonX = 0, moonY = 0;

        // ── GLOW SPRITE CACHE ───────────────────────────────────────
        // Pre-render a tinted glow sprite per unique hue. drawImage is
        // far cheaper than createRadialGradient × 180 per frame.
        const GLOW_SIZE = 32;
        const glowSprites = new Map<number, HTMLCanvasElement>();

        const makeGlowSprite = (h: number, s: number, l: number) => {
            if (glowSprites.has(h)) return;
            const c = document.createElement("canvas");
            c.width = GLOW_SIZE * 2;
            c.height = GLOW_SIZE * 2;
            const g = c.getContext("2d")!;
            const grad = g.createRadialGradient(GLOW_SIZE, GLOW_SIZE, 0, GLOW_SIZE, GLOW_SIZE, GLOW_SIZE);
            grad.addColorStop(0, hsla(h, s, l + 12, 1));
            grad.addColorStop(0.38, hsla(h, s, l, 0.38));
            grad.addColorStop(1, hsla(h, s, l - 8, 0));
            g.fillStyle = grad;
            g.fillRect(0, 0, GLOW_SIZE * 2, GLOW_SIZE * 2);
            glowSprites.set(h, c);
        };

        // Pre-build sprites for all ember hues
        EMBER_H.forEach(h => makeGlowSprite(h, 75, 70));

        // ── INIT BACKGROUND LAYERS ──────────────────────────────────
        const initBg = () => {
            const layers: BgLayer[] = [];
            // Deep nebula wisps at different depths
            const configs = [
                { cx: .18, cy: .22, r: .38, h: 250, s: 35, l: 12, a: .5, ps: .00028, d: .1 },
                { cx: .72, cy: .14, r: .28, h: 245, s: 30, l: 10, a: .4, ps: .00022, d: .18 },
                { cx: .45, cy: .52, r: .42, h: 255, s: 28, l: 8, a: .3, ps: .00034, d: .08 },
                { cx: .82, cy: .65, r: .25, h: 260, s: 32, l: 11, a: .35, ps: .00018, d: .22 },
                { cx: .3, cy: .8, r: .32, h: 248, s: 25, l: 9, a: .28, ps: .00026, d: .12 },
            ];
            configs.forEach(c => layers.push({
                cx: c.cx * W, cy: c.cy * H,
                r: c.r * Math.max(W, H),
                h: c.h, s: c.s, l: c.l, a: c.a,
                phase: Math.random() * TAU, ps: c.ps,
                depth: c.d,
            }));
            bgRef.current = layers;
        };

        // ── INIT EMBERS ─────────────────────────────────────────────
        const initEmbers = () => {
            const es: Ember[] = [];
            for (let i = 0; i < EMBER_COUNT; i++) {
                const x = rr(W * .04, W * .96);
                const y = rr(H * .08, H * .92);
                const h = EMBER_H[i % EMBER_H.length];
                es.push({
                    x, y, vx: 0, vy: 0, ox: x, oy: y,
                    r: rr(.9, 2.6),
                    h, s: rr(65, 85), l: rr(62, 78),
                    a: rr(.08, .28), ta: rr(.08, .28),
                    phase: Math.random() * TAU, ps: rr(.003, .007),
                    drift: rr(.018, .055),
                    distX: 0, distY: 0,
                });
            }
            embersRef.current = es;
        };

        // ── INIT CRESCENT HALO ──────────────────────────────────────
        const initHalo = () => {
            const hp: HaloParticle[] = [];
            // Halo spans the visible crescent arc (~200°)
            for (let i = 0; i < HALO_COUNT; i++) {
                const arc = (i / HALO_COUNT) * (Math.PI * 1.12) + Math.PI * .44;
                const arcR = MOON_R * (1.25 + rr(0, .55));
                const wx = moonX + arcR * Math.cos(arc);
                const wy = moonY + arcR * Math.sin(arc);
                hp.push({
                    arc, arcR,
                    x: wx, y: wy,
                    phase: Math.random() * TAU, ps: rr(.006, .014),
                    wobble: rr(2, 6),
                    r: rr(.6, 1.8),
                    a: rr(.2, .55), ta: rr(.2, .55),
                });
            }
            haloRef.current = hp;
        };

        // ── INIT LANTERNS ───────────────────────────────────────────
        const initLanterns = () => {
            lanternsRef.current = LANT_POS.map(([nx, ny], i) => ({
                pivotX: nx * W,
                pivotY: ny * H,
                cordLen: rr(48, 72),
                angle: (Math.random() - .5) * .25,
                angleVel: 0,
                h: LANT_H[i],
                glowI: .5, targetGlowI: .5,
                phase: Math.random() * TAU,
                idx: i,
            }));
        };

        // ── INIT GEOMETRY ───────────────────────────────────────────
        const initGeo = () => {
            const targets = buildGeoTargets(W, H);
            const nodes: GeoNode[] = targets.map((t, i) => ({
                tx: t.x, ty: t.y,
                x: t.x + rr(-80, 80),
                y: t.y + rr(-80, 80),
                nextIdx: (i + 1) % targets.length,
                a: 0, ta: 0,
                phase: Math.random() * TAU,
            }));
            geoRef.current = nodes;
        };

        // ── RESIZE ──────────────────────────────────────────────────
        const resize = () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            sizeRef.current = { W, H };
            moonX = W * MOON_NX;
            moonY = H * MOON_NY;
            initBg();
            initEmbers();
            initHalo();
            initLanterns();
            initGeo();
        };
        resize();
        window.addEventListener("resize", resize, { passive: true });

        // ── MOUSE ────────────────────────────────────────────────────
        const onMove = (e: MouseEvent) => {
            mvelRef.current = {
                x: e.clientX - mouseRef.current.x,
                y: e.clientY - mouseRef.current.y,
            };
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        // ── CLICK BURST (Ramadan-exclusive) ──────────────────────────
        const onClick = (e: MouseEvent) => {
            const pool: WarmBurst[] = [];
            for (let i = 0; i < BURST_N; i++) {
                const angle = (i / BURST_N) * TAU + rr(-.4, .4);
                const speed = rr(1.8, 6.2);
                const hIdx = i % WARM_H.length;
                pool.push({
                    x: e.clientX, y: e.clientY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    r: rr(1.6, 3.4),
                    h: WARM_H[hIdx], s: rr(80, 92), l: rr(68, 84),
                    life: 1,
                    decay: rr(.013, .022),
                    floatF: rr(.035, .075),
                    spin: rr(-.04, .04),
                });
            }
            burstsRef.current.push(...pool);
        };

        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("click", onClick);

        // ════════════════════════════════════════════════════════════
        // DRAW FUNCTIONS
        // ════════════════════════════════════════════════════════════

        // ── 1. BACKGROUND ────────────────────────────────────────────
        const drawBackground = (t: number) => {
            const mouse = mouseRef.current;
            const breathe = Math.sin(t * .00055) * .018;

            // Base: deep midnight gradient
            const bg = ctx.createRadialGradient(
                W * .65 + Math.sin(t * .0003) * 20,
                H * .08,
                0, W * .5, H * .5, H * 1.15
            );
            bg.addColorStop(0, `hsl(245,52%,${11 + breathe * 100}%)`);
            bg.addColorStop(.32, "hsl(240,44%,7%)");
            bg.addColorStop(.7, "hsl(238,48%,4%)");
            bg.addColorStop(1, "hsl(235,52%,2%)");
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, W, H);

            // Volumetric depth layers with parallax
            const layers = bgRef.current;
            for (let i = 0; i < layers.length; i++) {
                const l = layers[i];
                l.phase += l.ps;
                const breathA = Math.sin(l.phase) * .12;
                const parallaxX = (mouse.x - W * .5) * l.depth * .04;
                const parallaxY = (mouse.y - H * .5) * l.depth * .04;
                const gx = l.cx + parallaxX;
                const gy = l.cy + parallaxY;
                const gr = ctx.createRadialGradient(gx, gy, 0, gx, gy, l.r);
                gr.addColorStop(0, hsla(l.h, l.s, l.l + 4, (l.a + breathA) * .45));
                gr.addColorStop(.4, hsla(l.h, l.s, l.l, (l.a + breathA) * .22));
                gr.addColorStop(1, hsla(l.h, l.s, l.l - 2, 0));
                ctx.beginPath();
                ctx.arc(gx, gy, l.r, 0, TAU);
                ctx.fillStyle = gr;
                ctx.fill();
            }

            // Horizon warm glow (subtle gold reflection from lanterns)
            const hg = ctx.createLinearGradient(0, H * .82, 0, H);
            hg.addColorStop(0, "hsla(38,60%,30%,0)");
            hg.addColorStop(.6, `hsla(38,55%,22%,${.04 + breathe * 1.5})`);
            hg.addColorStop(1, "hsla(38,50%,15%,0.08)");
            ctx.fillStyle = hg;
            ctx.fillRect(0, H * .82, W, H * .18);
        };

        // ── 2. EMBER PARTICLES ────────────────────────────────────────
        const updateDrawEmbers = (t: number) => {
            const mouse = mouseRef.current;
            const es = embersRef.current;
            const scrollV = scrollRef.current - prevScRef.current;

            for (let i = 0; i < es.length; i++) {
                const e = es[i];
                e.phase += e.ps;

                // Organic Brownian drift
                let ax = Math.sin(e.phase * 1.1 + i * .41) * .055 - (e.x - e.ox) * EMBER_SPRING;
                let ay = Math.cos(e.phase * .8 + i * .31) * .055 - (e.y - e.oy) * EMBER_SPRING;

                // Slow upward drift
                ay -= e.drift * .12;

                // Cursor distortion field (heat shimmer, not attraction)
                const dx = e.x - mouse.x;
                const dy = e.y - mouse.y;
                const d = Math.sqrt(dx * dx + dy * dy) || 1;
                if (d < CURSOR_DIST_R) {
                    const f = (1 - d / CURSOR_DIST_R) * CURSOR_DIST_F;
                    // Displacement perpendicular to cursor-particle vector
                    ax += (dy / d) * f * .8;
                    ay -= (dx / d) * f * .8;
                    e.ta = clamp(e.ta + f * .12, .3, .92);
                    e.distX = lerp(e.distX, dx * .015, .08);
                    e.distY = lerp(e.distY, dy * .015, .08);
                } else {
                    e.ta = lerp(e.ta, .08 + Math.sin(e.phase) * .06 + .14, .04);
                    e.distX = lerp(e.distX, 0, .06);
                    e.distY = lerp(e.distY, 0, .06);
                }

                // Scroll kick
                ay += scrollV * SCROLL_K * (Math.random() - .4);

                e.vx = (e.vx + ax) * EMBER_DAMPING;
                e.vy = (e.vy + ay) * EMBER_DAMPING;

                const spd = Math.sqrt(e.vx * e.vx + e.vy * e.vy);
                if (spd > 3.2) { e.vx *= 3.2 / spd; e.vy *= 3.2 / spd; }

                e.x += e.vx; e.y += e.vy;

                // Wrap top-to-bottom (embers drift upward and recycle)
                if (e.y < -20) { e.y = H + 10; e.x = e.ox + (Math.random() - .5) * 40; }
                if (e.x < -20) e.x = W + 10;
                if (e.x > W + 20) e.x = -10;
                if (e.y > H + 20) e.y = -10;

                e.a = lerp(e.a, e.ta, .055);

                // Draw: cached glow sprite (eliminates per-ember gradient allocation)
                const drawR = e.r * 3.5;
                const drawD = drawR * 2;
                const sprite = glowSprites.get(e.h);
                if (sprite) {
                    ctx.save();
                    ctx.globalAlpha = e.a;
                    ctx.drawImage(sprite, e.x - drawR, e.y - drawR, drawD, drawD);
                    ctx.restore();
                }

                // Organic connections between bright nearby embers
                if (e.a > .38 && i % 2 === 0) {
                    for (let j = i + 2; j < es.length; j += 2) {
                        const f = es[j];
                        if (f.a < .22) continue;
                        const ex = f.x - e.x, ey = f.y - e.y;
                        const ed = Math.sqrt(ex * ex + ey * ey);
                        if (ed > 80) continue;
                        const la = (1 - ed / 80) * Math.min(e.a, f.a) * .14;
                        const mx = (e.x + f.x) * .5;
                        const my = (e.y + f.y) * .5;
                        const bow = Math.sin(t * .0007 + i * .22) * 5;
                        ctx.beginPath();
                        ctx.moveTo(e.x, e.y);
                        ctx.quadraticCurveTo(mx + bow, my - bow, f.x, f.y);
                        ctx.strokeStyle = hsla((e.h + f.h) * .5, 70, 72, la);
                        ctx.lineWidth = .4;
                        ctx.stroke();
                    }
                }
            }
        };

        // ── 3. CRESCENT MOON ─────────────────────────────────────────
        const drawMoon = (t: number) => {
            const mouse = mouseRef.current;
            const breathe = Math.sin(t * .0009) * .5 + .5;  // 0-1
            const dm = Math.sqrt((mouse.x - moonX) ** 2 + (mouse.y - moonY) ** 2);
            const prox = clamp(1 - dm / 350, 0, 1);

            // ── Outer field (warm glow expanding from moon) ────────────
            const fieldR = MOON_R * 3.5 + breathe * 30 + prox * 40;
            for (let ring = 3; ring >= 0; ring--) {
                const rr2 = fieldR * (.4 + ring * .22);
                const ra = (.055 - ring * .011) * (breathe * .5 + .5 + prox * .4);
                const gr = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, rr2);
                gr.addColorStop(0, hsla(42, 75, 70, ra));
                gr.addColorStop(.5, hsla(38, 65, 60, ra * .4));
                gr.addColorStop(1, hsla(35, 55, 50, 0));
                ctx.beginPath(); ctx.arc(moonX, moonY, rr2, 0, TAU);
                ctx.fillStyle = gr; ctx.fill();
            }

            // ── Crescent body (composite out technique) ────────────────
            ctx.save();
            const region = new Path2D();
            region.arc(moonX, moonY, MOON_R, 0, TAU);
            ctx.clip(region);

            // Body fill
            const bodyG = ctx.createRadialGradient(
                moonX - MOON_R * .28, moonY - MOON_R * .22, 0,
                moonX, moonY, MOON_R
            );
            bodyG.addColorStop(0, `hsla(50,88%,${88 + breathe * 6}%,0.96)`);
            bodyG.addColorStop(.42, `hsla(44,82%,${72 + breathe * 4}%,0.94)`);
            bodyG.addColorStop(1, "hsla(34,70%,52%,0.90)");
            ctx.fillStyle = bodyG;
            ctx.fillRect(moonX - MOON_R, moonY - MOON_R, MOON_R * 2, MOON_R * 2);

            // Cut out crescent
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.arc(moonX + MOON_R * .68, moonY - MOON_R * .12, MOON_R * .84, 0, TAU);
            ctx.fillStyle = "rgba(0,0,0,1)";
            ctx.fill();
            ctx.globalCompositeOperation = "source-over";
            ctx.restore();

            // ── Halo particle arc ─────────────────────────────────────
            const hps = haloRef.current;
            for (let i = 0; i < hps.length; i++) {
                const hp = hps[i];
                hp.phase += hp.ps;
                const wb = Math.sin(hp.phase) * hp.wobble;
                const curR = hp.arcR + wb + breathe * 4 + prox * 6;
                hp.x = moonX + curR * Math.cos(hp.arc);
                hp.y = moonY + curR * Math.sin(hp.arc);
                hp.ta = (.18 + breathe * .22 + prox * .15) * (.5 + Math.sin(hp.phase) * .5);
                hp.a = lerp(hp.a, hp.ta, .05);

                const gr = ctx.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, hp.r * 2.8);
                gr.addColorStop(0, hsla(44, 80, 82, hp.a));
                gr.addColorStop(.5, hsla(40, 70, 72, hp.a * .35));
                gr.addColorStop(1, "hsla(38,65%,62%,0)");
                ctx.beginPath(); ctx.arc(hp.x, hp.y, hp.r * 2.8, 0, TAU);
                ctx.fillStyle = gr; ctx.fill();
            }

            // ── Star inside crescent ──────────────────────────────────
            const sx = moonX - MOON_R * .30;
            const sy = moonY + MOON_R * .04;
            const sp = .82 + breathe * .18 + prox * .12;
            ctx.save();
            ctx.globalAlpha = sp;
            ctx.shadowBlur = 10 + breathe * 6;
            ctx.shadowColor = "hsla(48,90%,85%,0.9)";
            ctx.fillStyle = `hsla(50,95%,${88 + breathe * 6}%,1)`;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const a = (i / 5) * TAU - Math.PI / 2;
                const ai = ((i + .5) / 5) * TAU - Math.PI / 2;
                const or = 7.5 * sp, ir = 3.2 * sp;
                if (i === 0) ctx.moveTo(sx + or * Math.cos(a), sy + or * Math.sin(a));
                else ctx.lineTo(sx + or * Math.cos(a), sy + or * Math.sin(a));
                ctx.lineTo(sx + ir * Math.cos(ai), sy + ir * Math.sin(ai));
            }
            ctx.closePath(); ctx.fill();
            ctx.restore();
        };

        // ── 4. LANTERNS ──────────────────────────────────────────────
        const updateDrawLanterns = (t: number) => {
            const mouse = mouseRef.current;
            const sc = scrollRef.current - prevScRef.current;
            const ls = lanternsRef.current;

            ls.forEach((lan) => {
                lan.phase += .035;

                // Bob world position
                const bx = lan.pivotX + Math.sin(lan.angle) * lan.cordLen;
                const by = lan.pivotY + Math.cos(lan.angle) * lan.cordLen;

                // Pendulum physics
                const dmx = bx - mouse.x, dmy = by - mouse.y;
                const dm = Math.sqrt(dmx * dmx + dmy * dmy) || 1;
                const prox = clamp(1 - dm / 200, 0, 1);

                // Mouse proximity disturbs swing
                lan.angleVel += (dmx / dm) * prox * .0045;
                // Scroll disturbs swing
                lan.angleVel += sc * SCROLL_K * .5;

                // Pendulum restoring force
                lan.angleVel += -PEND_G * Math.sin(lan.angle);
                lan.angleVel *= PEND_DAMP;
                lan.angle += lan.angleVel;

                // Glow intensity
                lan.targetGlowI = .42 + prox * .48 + Math.sin(lan.phase) * .08;
                lan.glowI = lerp(lan.glowI, lan.targetGlowI, .06);

                // ── Draw cord (catenary-approximated bezier) ───────────
                const ctrlSag = lan.cordLen * .22;
                ctx.beginPath();
                ctx.moveTo(lan.pivotX, lan.pivotY);
                ctx.bezierCurveTo(
                    lan.pivotX + Math.sin(lan.angle) * lan.cordLen * .3,
                    lan.pivotY + ctrlSag,
                    bx + Math.sin(lan.angle) * 4,
                    by - lan.cordLen * .28,
                    bx, by - 14
                );
                ctx.strokeStyle = `hsla(36,48%,50%,0.42)`;
                ctx.lineWidth = .9;
                ctx.stroke();

                // ── Draw lantern body ──────────────────────────────────
                const lW = 13, lH = 24;
                const h = lan.h;
                const gi = lan.glowI;

                ctx.save();
                ctx.translate(bx, by);
                ctx.rotate(lan.angle * .28);

                // Outer glow field
                const og = ctx.createRadialGradient(0, 0, 0, 0, 0, lH * 2.2);
                og.addColorStop(0, hsla(h, 80, 68, gi * .3));
                og.addColorStop(.5, hsla(h, 72, 60, gi * .12));
                og.addColorStop(1, hsla(h, 64, 52, 0));
                ctx.beginPath(); ctx.ellipse(0, 0, lH * 2.2, lH * 2.2, 0, 0, TAU);
                ctx.fillStyle = og; ctx.fill();

                // Body gradient
                const bg2 = ctx.createLinearGradient(-lW, -lH, lW, lH);
                bg2.addColorStop(0, hsla(h, 82, 62, .88 + gi * .1));
                bg2.addColorStop(.38, hsla(h + 10, 60, 84, .5 + gi * .22));
                bg2.addColorStop(1, hsla(h, 78, 48, .86 + gi * .08));

                ctx.beginPath();
                ctx.moveTo(0, -lH);
                ctx.bezierCurveTo(lW * .58, -lH * .68, lW, -lH * .28, lW, 0);
                ctx.bezierCurveTo(lW, lH * .28, lW * .58, lH * .68, 0, lH);
                ctx.bezierCurveTo(-lW * .58, lH * .68, -lW, lH * .28, -lW, 0);
                ctx.bezierCurveTo(-lW, -lH * .28, -lW * .58, -lH * .68, 0, -lH);
                ctx.closePath();
                ctx.fillStyle = bg2; ctx.fill();

                // Inner flame
                const fg = ctx.createRadialGradient(0, lH * .1, 0, 0, 0, lH * .62);
                fg.addColorStop(0, hsla(50, 100, 88, gi * .82));
                fg.addColorStop(.4, hsla(h + 14, 90, 72, gi * .38));
                fg.addColorStop(1, hsla(h, 80, 55, 0));
                ctx.fillStyle = fg; ctx.fill();

                // Caps
                ctx.fillStyle = "hsla(36,52%,50%,0.92)";
                ctx.beginPath(); ctx.ellipse(0, -lH, lW * .52, 3.8, 0, 0, TAU); ctx.fill();
                ctx.beginPath(); ctx.ellipse(0, lH, lW * .52, 3.8, 0, 0, TAU); ctx.fill();

                // Tassel
                ctx.beginPath();
                ctx.moveTo(0, lH + 3.8);
                ctx.bezierCurveTo(1.8, lH + 8, .6, lH + 12, 0, lH + 16);
                ctx.strokeStyle = "hsla(36,52%,50%,0.72)";
                ctx.lineWidth = 1.3; ctx.stroke();

                ctx.restore();

                // Light pool
                const pg = ctx.createRadialGradient(bx, by + lH + 16, 0, bx, by + lH + 16, 32);
                pg.addColorStop(0, hsla(h, 78, 68, gi * .16));
                pg.addColorStop(1, hsla(h, 70, 60, 0));
                ctx.beginPath(); ctx.ellipse(bx, by + lH + 16, 32, 8, 0, 0, TAU);
                ctx.fillStyle = pg; ctx.fill();
            });
        };

        // ── 5. GEOMETRY ENGINE ───────────────────────────────────────
        // Nodes lerp to sacred geometry targets; connections are bezier trails
        const updateDrawGeo = (t: number) => {
            const nodes = geoRef.current;
            const mouse = mouseRef.current;
            const cycle = (Math.sin(t * .00045) + 1) * .5;  // 0-1 slow breath
            const target = cycle;  // how strongly nodes pull to geometry

            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                n.phase += .008;
                // Node drifts toward geometric target or wanders freely
                const lf = lerp(.005, .022, target);
                n.x = lerp(n.x, n.tx + Math.sin(n.phase) * 8, lf);
                n.y = lerp(n.y, n.ty + Math.cos(n.phase * .8) * 8, lf);
                n.ta = lerp(.0, cycle * .28, .04) * (Math.sin(n.phase * 1.4) * .5 + .5);
                n.a = lerp(n.a, n.ta, .035);

                if (n.a < .008) continue;

                // Draw bezier edge to next node
                const nxt = nodes[n.nextIdx];
                const mx = (n.x + nxt.x) * .5;
                const my = (n.y + nxt.y) * .5;
                // Organic bow outward
                const bow = Math.sin(t * .0004 + i * .44) * 12;
                // Distance to mouse — reacts by dimming near cursor
                const dm = Math.sqrt((mouse.x - mx) ** 2 + (mouse.y - my) ** 2);
                const dim = clamp(dm / 200, 0, 1);

                const la = n.a * dim;
                if (la < .005) continue;

                ctx.beginPath();
                ctx.moveTo(n.x, n.y);
                ctx.quadraticCurveTo(mx + bow, my - bow, nxt.x, nxt.y);
                ctx.strokeStyle = hsla(42, 72, 68, la);
                ctx.lineWidth = .55;
                ctx.stroke();

                // Dissolving particle along edge
                const progress = ((t * .0004 + i * .15) % 1);
                const px = n.x + (nxt.x - n.x) * progress;
                const py = n.y + (nxt.y - n.y) * progress;
                const pg = ctx.createRadialGradient(px, py, 0, px, py, 3);
                pg.addColorStop(0, hsla(44, 82, 80, la * 1.5));
                pg.addColorStop(1, hsla(40, 72, 68, 0));
                ctx.beginPath(); ctx.arc(px, py, 3, 0, TAU);
                ctx.fillStyle = pg; ctx.fill();
            }
        };

        // ── 6. CLICK BURST (Ramadan-exclusive) ───────────────────────
        const updateDrawBursts = () => {
            const bs = burstsRef.current;
            for (let i = bs.length - 1; i >= 0; i--) {
                const b = bs[i];
                b.life -= b.decay;
                if (b.life <= 0) { bs.splice(i, 1); continue; }

                b.vx *= .92; b.vy *= .92;
                b.vy -= b.floatF;   // float upward
                b.x += b.vx; b.y += b.vy;

                // Smooth cubic fade (fast peak, slow trail)
                const lf = b.life;
                const ea = lf * lf * (3 - 2 * lf);

                // Aura
                const ag = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 5.5);
                ag.addColorStop(0, hsla(b.h, b.s, b.l + 8, ea * .38));
                ag.addColorStop(.45, hsla(b.h, b.s, b.l, ea * .15));
                ag.addColorStop(1, hsla(b.h, b.s, b.l - 6, 0));
                ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 5.5, 0, TAU);
                ctx.fillStyle = ag; ctx.fill();

                // Core
                const cg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 1.6);
                cg.addColorStop(0, hsla(50, 95, 90, ea * .95));
                cg.addColorStop(.5, hsla(b.h, b.s, b.l + 5, ea * .65));
                cg.addColorStop(1, hsla(b.h, b.s, b.l, 0));
                ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 1.6, 0, TAU);
                ctx.fillStyle = cg; ctx.fill();
            }
        };

        // ── 7. ARCHES (organic bezier, no straight lines) ─────────────
        const drawArches = () => {
            const count = 7;
            const archW = W / count;
            const archH = 165;
            const breathe = Math.sin(frameRef.current * .008) * .015;

            // Fill
            const ag = ctx.createLinearGradient(0, H - archH, 0, H);
            ag.addColorStop(0, "hsla(240,38%,10%,0)");
            ag.addColorStop(.28, "hsla(240,40%,7%,0.65)");
            ag.addColorStop(1, "hsla(238,45%,4%,0.98)");

            ctx.save();
            ctx.beginPath();
            for (let i = 0; i < count; i++) {
                const x = i * archW;
                const mid = x + archW / 2;
                const pk = H - archH + 8;
                if (i === 0) ctx.moveTo(0, H);
                ctx.lineTo(x, H - archH * .58);
                ctx.bezierCurveTo(
                    x + archW * .06, H - archH * .84,
                    mid - archW * .18, pk,
                    mid, pk
                );
                ctx.bezierCurveTo(
                    mid + archW * .18, pk,
                    x + archW * .94, H - archH * .84,
                    x + archW, H - archH * .58
                );
            }
            ctx.lineTo(W, H); ctx.closePath();
            ctx.fillStyle = ag; ctx.fill();

            // Gold trim
            ctx.beginPath();
            for (let i = 0; i < count; i++) {
                const x = i * archW;
                const mid = x + archW / 2;
                const pk = H - archH + 8;
                if (i === 0) ctx.moveTo(0, H - archH * .58);
                else ctx.lineTo(x, H - archH * .58);
                ctx.bezierCurveTo(
                    x + archW * .06, H - archH * .84,
                    mid - archW * .18, pk,
                    mid, pk
                );
                ctx.bezierCurveTo(
                    mid + archW * .18, pk,
                    x + archW * .94, H - archH * .84,
                    x + archW, H - archH * .58
                );
            }
            ctx.strokeStyle = `hsla(42,78%,58%,${.38 + breathe * 8})`;
            ctx.lineWidth = 1.3; ctx.stroke();
            ctx.restore();
        };

        // ── 8. ROPE + CURSOR GLOW ────────────────────────────────────
        const drawRope = () => {
            const rg = ctx.createLinearGradient(W * .04, 0, W * .96, 0);
            rg.addColorStop(0, "hsla(36,45%,48%,0)");
            rg.addColorStop(.08, "hsla(36,48%,52%,0.38)");
            rg.addColorStop(.5, "hsla(36,52%,55%,0.52)");
            rg.addColorStop(.92, "hsla(36,48%,52%,0.38)");
            rg.addColorStop(1, "hsla(36,45%,48%,0)");
            ctx.beginPath();
            // Organic rope: slight catenary dip
            ctx.moveTo(W * .04, H * .04);
            ctx.bezierCurveTo(W * .25, H * .05, W * .75, H * .05, W * .96, H * .04);
            ctx.strokeStyle = rg; ctx.lineWidth = 1.1; ctx.stroke();
        };

        const drawCursorGlow = () => {
            const m = mouseRef.current;
            if (m.x < 0) return;
            const spd = Math.sqrt(mvelRef.current.x ** 2 + mvelRef.current.y ** 2);
            const gr = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 120);
            gr.addColorStop(0, `hsla(40,80%,72%,${.028 + spd * .003})`);
            gr.addColorStop(.5, "hsla(38,72%,62%,0.012)");
            gr.addColorStop(1, "hsla(36,64%,54%,0)");
            ctx.beginPath(); ctx.arc(m.x, m.y, 120, 0, TAU);
            ctx.fillStyle = gr; ctx.fill();

            const ig = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 6);
            ig.addColorStop(0, `hsla(46,95%,88%,${.35 + spd * .04})`);
            ig.addColorStop(1, "hsla(44,90%,80%,0)");
            ctx.beginPath(); ctx.arc(m.x, m.y, 6, 0, TAU);
            ctx.fillStyle = ig; ctx.fill();
        };

        // ── MAIN LOOP ─────────────────────────────────────────────────
        const tick = (t: number) => {
            rafRef.current = requestAnimationFrame(tick);
            frameRef.current++;
            const scrollDelta = scrollRef.current - prevScRef.current;
            prevScRef.current = scrollRef.current;

            ctx.clearRect(0, 0, W, H);

            // Dedicated Ramadan render pipeline
            drawBackground(t);          // 1. atmospheric background
            updateDrawEmbers(t);        // 2. warm ember particles
            updateDrawGeo(t);           // 3. dissolving geometry
            drawMoon(t);                // 4. crescent + halo
            updateDrawLanterns(t);      // 5. pendulum lanterns
            drawArches();               // 6. organic arches
            drawRope();                 // 7. lantern rope
            updateDrawBursts();         // 8. click bursts
            drawCursorGlow();           // 9. cursor field
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

export default RamadanCanvas;