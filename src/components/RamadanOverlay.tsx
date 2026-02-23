import { motion, AnimatePresence } from "framer-motion";
import { useMemo, memo, CSSProperties } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RamadanOverlayProps {
  active: boolean;
}

interface StarData {
  id: number;
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
}

interface LanternData {
  id: number;
  x: number;
  y: number;
  size: number;
  swayDuration: number;
  glowDuration: number;
  delay: number;
}

interface ShootingStarData {
  id: number;
  x: number;
  y: number;
  delay: number;
}

interface OrbData {
  id: number;
  x: number;
  y: number;
  dur: number;
  delay: number;
}

interface LanternColor {
  body: string;
  glow: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rand = (min: number, max: number): number =>
  min + Math.random() * (max - min);

// ─── Global CSS (all animations in one injection) ─────────────────────────────
const GLOBAL_CSS = `
  @keyframes ram-twinkle {
    0%,100%{opacity:.12;transform:scale(.75)}
    50%{opacity:1;transform:scale(1.25)}
  }
  @keyframes ram-shoot {
    0%{transform:translateX(0) scaleX(0);opacity:0}
    8%{opacity:1;transform:translateX(0) scaleX(1)}
    88%{opacity:.75;transform:translateX(140px) scaleX(1)}
    100%{transform:translateX(170px) scaleX(0);opacity:0}
  }
  @keyframes ram-sway {
    0%,100%{transform:rotate(-7deg)}
    50%{transform:rotate(7deg)}
  }
  @keyframes ram-glow {
    0%,100%{opacity:.4}
    50%{opacity:1}
  }
  @keyframes ram-rise {
    0%{transform:translateY(0) scale(1);opacity:0}
    10%{opacity:.9}
    80%{opacity:.4}
    100%{transform:translateY(-130px) scale(0.3);opacity:0}
  }
  @keyframes ram-moon {
    0%,100%{transform:translateY(0px) rotate(0deg)}
    50%{transform:translateY(-10px) rotate(2.5deg)}
  }
  @keyframes ram-cw {
    from{transform:rotate(0deg)}
    to{transform:rotate(360deg)}
  }
  @keyframes ram-ccw {
    from{transform:rotate(360deg)}
    to{transform:rotate(0deg)}
  }
  @keyframes ram-nebula {
    0%,100%{opacity:.35;transform:translate(0,0) scale(1)}
    50%{opacity:.7;transform:translate(14px,-10px) scale(1.05)}
  }
  @keyframes ram-text-glow {
    0%,100%{text-shadow:0 0 14px #f6c86e99,0 0 30px #f6c86e44}
    50%{text-shadow:0 0 28px #f6c86ecc,0 0 60px #f6c86e77,0 0 90px #f6c86e33}
  }
  @keyframes ram-particle-drift {
    0%{transform:translateY(0) translateX(0) scale(1);opacity:0}
    15%{opacity:.85}
    60%{opacity:.5}
    100%{transform:translateY(-160px) translateX(var(--dx)) scale(0.2);opacity:0}
  }
  .ram-gcw  { animation: ram-cw  58s linear infinite; }
  .ram-gccw { animation: ram-ccw 40s linear infinite; }
  .ram-gcw2 { animation: ram-cw  75s linear infinite; }
  .ram-lcw  { animation: ram-cw  50s linear infinite; }
  .ram-lccw { animation: ram-ccw 32s linear infinite; }
  .ram-rcw  { animation: ram-cw  50s linear infinite; }
  .ram-rccw { animation: ram-ccw 32s linear infinite; }
`;

// ─── Star Field ───────────────────────────────────────────────────────────────
interface StarFieldProps { stars: StarData[] }
const StarField = memo<StarFieldProps>(({ stars }) => (
  <>
    {stars.map((s) => (
      <div
        key={s.id}
        style={{
          position: "absolute",
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: s.size,
          height: s.size,
          borderRadius: "50%",
          background: "#fff",
          willChange: "transform, opacity",
          animation: `ram-twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
        } as CSSProperties}
      />
    ))}
  </>
));
StarField.displayName = "StarField";

// ─── Shooting Stars ───────────────────────────────────────────────────────────
interface ShootingStarsProps { items: ShootingStarData[] }
const ShootingStars = memo<ShootingStarsProps>(({ items }) => (
  <>
    {items.map((s) => (
      <div
        key={s.id}
        style={{
          position: "absolute",
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: 96,
          height: 1.5,
          background:
            "linear-gradient(90deg,#fff 0%,#f6c86e 40%,transparent 100%)",
          borderRadius: 2,
          transform: "rotate(18deg)",
          transformOrigin: "left center",
          willChange: "transform, opacity",
          animation: `ram-shoot 1.1s ${s.delay}s ease-in infinite`,
          zIndex: 5,
        } as CSSProperties}
      />
    ))}
  </>
));
ShootingStars.displayName = "ShootingStars";

// ─── Rising Particles (antigravity orbs) ─────────────────────────────────────
interface OrbsProps { items: OrbData[] }
const Orbs = memo<OrbsProps>(({ items }) => (
  <>
    {items.map((o) => {
      const dx = rand(-30, 30);
      return (
        <div
          key={o.id}
          style={
            {
              position: "absolute",
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: rand(3, 6),
              height: rand(3, 6),
              borderRadius: "50%",
              background: `radial-gradient(circle, #fff8c0, #f6c86e)`,
              boxShadow: "0 0 6px #f6c86ecc, 0 0 12px #f6c86e55",
              willChange: "transform, opacity",
              "--dx": `${dx}px`,
              animation: `ram-particle-drift ${o.dur}s ${o.delay}s ease-out infinite`,
              zIndex: 5,
            } as CSSProperties
          }
        />
      );
    })}
  </>
));
Orbs.displayName = "Orbs";

// ─── Crescent Moon ────────────────────────────────────────────────────────────
const CrescentMoon = memo(() => (
  <div
    style={{
      position: "absolute",
      top: "3%",
      right: "7%",
      width: 112,
      height: 112,
      filter:
        "drop-shadow(0 0 18px #f6c86e) drop-shadow(0 0 40px #d4900077)",
      animation: "ram-moon 9s ease-in-out infinite",
      willChange: "transform",
      zIndex: 10,
    } as CSSProperties}
  >
    <svg viewBox="0 0 112 112" width="112" height="112">
      <defs>
        <radialGradient id="ram-mFill" cx="36%" cy="33%" r="64%">
          <stop offset="0%" stopColor="#fffde8" />
          <stop offset="50%" stopColor="#f6c86e" />
          <stop offset="100%" stopColor="#b06010" />
        </radialGradient>
        <radialGradient id="ram-mHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f6c86e" stopOpacity=".25" />
          <stop offset="100%" stopColor="#f6c86e" stopOpacity="0" />
        </radialGradient>
        <mask id="ram-cMask">
          <circle cx="56" cy="56" r="48" fill="white" />
          <circle cx="76" cy="46" r="39" fill="black" />
        </mask>
      </defs>
      {/* Halo */}
      <circle cx="56" cy="56" r="55" fill="url(#ram-mHalo)" />
      {/* Crescent body */}
      <circle cx="56" cy="56" r="48" fill="url(#ram-mFill)" mask="url(#ram-cMask)" />
      {/* Decorative star inside crescent */}
      <polygon
        points="31,50 32.9,56 39,56 34.2,59.5 36.1,65.5 31,62 25.9,65.5 27.8,59.5 23,56 29.1,56"
        fill="#fffbe8"
        opacity="0.9"
      />
    </svg>
  </div>
));
CrescentMoon.displayName = "CrescentMoon";

// ─── Lanterns ─────────────────────────────────────────────────────────────────
const LANTERN_COLORS: LanternColor[] = [
  { body: "#e8452a", glow: "#ff6644" },
  { body: "#f09030", glow: "#ffb040" },
  { body: "#cc44aa", glow: "#ff66cc" },
  { body: "#2299dd", glow: "#44bbff" },
  { body: "#8844cc", glow: "#bb66ff" },
  { body: "#33aa66", glow: "#55cc88" },
];

interface LanternProps extends LanternData { index: number }
const Lantern = memo<LanternProps>(
  ({ x, y, size, swayDuration, glowDuration, delay, index }) => {
    const w = Math.round(size * 0.6);
    const h = size;
    const { body, glow } = LANTERN_COLORS[index % LANTERN_COLORS.length];
    const ribTs: number[] = [0.38, 0.62, 0.8];

    return (
      <div
        style={{
          position: "absolute",
          left: `${x}%`,
          top: `${y}%`,
          width: w,
          zIndex: 8,
        } as CSSProperties}
      >
        {/* Hanging cord */}
        <div
          style={{
            width: 1.5,
            height: 22,
            background: "#c8a060aa",
            margin: "0 auto",
          }}
        />
        {/* Sway wrapper */}
        <div
          style={{
            transformOrigin: "50% 0%",
            animation: `ram-sway ${swayDuration}s ${delay}s ease-in-out infinite`,
            willChange: "transform",
          } as CSSProperties}
        >
          <svg
            viewBox={`0 0 ${w} ${h}`}
            width={w}
            height={h}
            style={{
              display: "block",
              filter: `drop-shadow(0 0 5px ${glow}99)`,
              animation: `ram-glow ${glowDuration}s ${delay}s ease-in-out infinite`,
              willChange: "opacity",
            } as CSSProperties}
          >
            <defs>
              <linearGradient
                id={`ram-lb${index}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor={body} stopOpacity=".92" />
                <stop offset="44%" stopColor="#fff8e0" stopOpacity=".55" />
                <stop offset="100%" stopColor={body} stopOpacity=".88" />
              </linearGradient>
              <radialGradient id={`ram-li${index}`} cx="50%" cy="60%" r="44%">
                <stop offset="0%" stopColor="#fff8a0" stopOpacity=".85" />
                <stop offset="100%" stopColor={body} stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* Top cap */}
            <rect
              x={w * 0.1}
              y={h * 0.02}
              width={w * 0.8}
              height={h * 0.08}
              rx={2}
              fill="#c8a060"
            />
            {/* Body */}
            <path
              d={`M${w * 0.13},${h * 0.1} Q${w * 0.04},${h * 0.38} ${w * 0.04},${h * 0.56} Q${w * 0.04},${h * 0.78} ${w * 0.13},${h * 0.88} L${w * 0.87},${h * 0.88} Q${w * 0.96},${h * 0.78} ${w * 0.96},${h * 0.56} Q${w * 0.96},${h * 0.38} ${w * 0.87},${h * 0.1} Z`}
              fill={`url(#ram-lb${index})`}
            />
            {/* Inner glow */}
            <ellipse
              cx={w * 0.5}
              cy={h * 0.55}
              rx={w * 0.29}
              ry={h * 0.21}
              fill={`url(#ram-li${index})`}
            />
            {/* Vertical rib */}
            <line
              x1={w * 0.5}
              y1={h * 0.1}
              x2={w * 0.5}
              y2={h * 0.88}
              stroke={body}
              strokeWidth=".65"
              opacity=".35"
            />
            {/* Horizontal ribs */}
            {ribTs.map((t, ri) => (
              <path
                key={ri}
                d={`M${w * 0.04},${h * t} Q${w * 0.5},${h * (t + 0.033)} ${w * 0.96},${h * t}`}
                stroke={body}
                strokeWidth=".65"
                fill="none"
                opacity=".35"
              />
            ))}
            {/* Bottom cap */}
            <rect
              x={w * 0.1}
              y={h * 0.88}
              width={w * 0.8}
              height={h * 0.06}
              rx={2}
              fill="#c8a060"
            />
            {/* Tassel */}
            <line
              x1={w * 0.5}
              y1={h * 0.94}
              x2={w * 0.5}
              y2={h * 0.99}
              stroke="#c8a060"
              strokeWidth="1.2"
            />
            <circle cx={w * 0.5} cy={h} r={2.5} fill="#c8a060" />
          </svg>

          {/* Light pool */}
          <div
            style={{
              width: w * 1.7,
              height: 9,
              marginLeft: -w * 0.35,
              borderRadius: "50%",
              background: `radial-gradient(ellipse, ${glow}44 0%, transparent 70%)`,
              animation: `ram-glow ${glowDuration}s ${delay}s ease-in-out infinite`,
              willChange: "opacity",
            } as CSSProperties}
          />
        </div>
      </div>
    );
  }
);
Lantern.displayName = "Lantern";

// ─── Islamic Geometric Layer ──────────────────────────────────────────────────
const GeometricLayer = memo(() => {
  const star16 = (cx: number, cy: number, ro: number, ri: number): string =>
    Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? ro : ri;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");

  const spoke = (
    cx: number,
    cy: number,
    r: number,
    count: number
  ): { x1: number; y1: number; x2: number; y2: number }[] =>
    Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2;
      return {
        x1: cx + r * 0.45 * Math.cos(a),
        y1: cy + r * 0.45 * Math.sin(a),
        x2: cx + r * Math.cos(a),
        y2: cy + r * Math.sin(a),
      };
    });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
        opacity: 0.14,
        pointerEvents: "none",
        overflow: "hidden",
      } as CSSProperties}
    >
      <svg
        viewBox="0 0 1200 750"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* ── Center mandala ── */}
        <g
          className="ram-gcw2"
          style={{ transformOrigin: "600px 270px" } as CSSProperties}
        >
          <circle cx={600} cy={270} r={172} fill="none" stroke="#f6c86e" strokeWidth=".7" opacity=".55" />
          {spoke(600, 270, 172, 12).map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#f6c86e" strokeWidth=".55" opacity=".45" />
          ))}
        </g>
        <g
          className="ram-gccw"
          style={{ transformOrigin: "600px 270px" } as CSSProperties}
        >
          <circle cx={600} cy={270} r={124} fill="none" stroke="#f0a030" strokeWidth=".6" opacity=".48" />
          {spoke(600, 270, 124, 8).map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#f0a030" strokeWidth=".55" opacity=".42" />
          ))}
        </g>
        <g
          className="ram-gcw"
          style={{ transformOrigin: "600px 270px" } as CSSProperties}
        >
          <circle cx={600} cy={270} r={76} fill="none" stroke="#f6c86e" strokeWidth=".5" opacity=".52" />
          <polygon points={star16(600, 270, 76, 32)} fill="none" stroke="#fffbe8" strokeWidth=".65" opacity=".5" />
        </g>

        {/* ── Left accent ── */}
        <g
          className="ram-lcw"
          style={{ transformOrigin: "150px 185px" } as CSSProperties}
        >
          <circle cx={150} cy={185} r={86} fill="none" stroke="#ab87ff" strokeWidth=".6" opacity=".48" />
          {spoke(150, 185, 86, 8).map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#ab87ff" strokeWidth=".5" opacity=".38" />
          ))}
        </g>
        <g
          className="ram-lccw"
          style={{ transformOrigin: "150px 185px" } as CSSProperties}
        >
          <polygon points={star16(150, 185, 52, 22)} fill="none" stroke="#c8a0ff" strokeWidth=".6" opacity=".48" />
        </g>

        {/* ── Right accent ── */}
        <g
          className="ram-rcw"
          style={{ transformOrigin: "1050px 185px" } as CSSProperties}
        >
          <circle cx={1050} cy={185} r={86} fill="none" stroke="#80d8ff" strokeWidth=".6" opacity=".48" />
          {spoke(1050, 185, 86, 8).map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#80d8ff" strokeWidth=".5" opacity=".38" />
          ))}
        </g>
        <g
          className="ram-rccw"
          style={{ transformOrigin: "1050px 185px" } as CSSProperties}
        >
          <polygon points={star16(1050, 185, 52, 22)} fill="none" stroke="#b0eaff" strokeWidth=".6" opacity=".48" />
        </g>

        {/* ── Static corner stars ── */}
        {(
          [
            [80, 650],
            [1120, 650],
            [310, 705],
            [890, 705],
          ] as [number, number][]
        ).map(([cx, cy], i) => (
          <polygon
            key={i}
            points={star16(cx, cy, 26, 11)}
            fill="none"
            stroke="#f6c86e"
            strokeWidth=".65"
            opacity=".28"
          />
        ))}
      </svg>
    </div>
  );
});
GeometricLayer.displayName = "GeometricLayer";

// ─── Arch Silhouette ──────────────────────────────────────────────────────────
const ArchSilhouette = memo(() => {
  const COUNT = 7;
  const VW = 1200;
  const VH = 180;
  const archW = VW / COUNT;

  const archPath = (i: number): string => {
    const x = i * archW;
    const mid = x + archW / 2;
    return `M${x},${VH} L${x},122 Q${x + archW * 0.08},56 ${mid},46 Q${x + archW * 0.92},56 ${x + archW},122 L${x + archW},${VH} Z`;
  };

  const trimD = Array.from(
    { length: COUNT },
    (_, i) => {
      const x = i * archW;
      const mid = x + archW / 2;
      return `${i === 0 ? "M" : "L"}${x},122 Q${x + archW * 0.08},56 ${mid},46 Q${x + archW * 0.92},56 ${x + archW},122`;
    }
  ).join(" ");

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 6,
        pointerEvents: "none",
      } as CSSProperties}
    >
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="none"
        width="100%"
        height={VH}
      >
        <defs>
          <linearGradient id="ram-aGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0b0b33" stopOpacity=".92" />
            <stop offset="100%" stopColor="#07071e" stopOpacity="1" />
          </linearGradient>
        </defs>
        {Array.from({ length: COUNT }, (_, i) => (
          <path key={i} d={archPath(i)} fill="url(#ram-aGrad)" />
        ))}
        <path d={trimD} fill="none" stroke="#f6c86e" strokeWidth="1.2" opacity=".5" />
      </svg>
    </div>
  );
});
ArchSilhouette.displayName = "ArchSilhouette";

// ─── Main Component ───────────────────────────────────────────────────────────
const RamadanOverlay = ({ active }: RamadanOverlayProps) => {
  const stars = useMemo<StarData[]>(
    () =>
      Array.from({ length: 65 }, (_, i) => ({
        id: i,
        x: rand(0, 100),
        y: rand(0, 64),
        size: rand(1, 2.8),
        dur: rand(2.5, 6.5),
        delay: rand(0, 7),
      })),
    []
  );

  const lanterns = useMemo<LanternData[]>(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: 5 + i * 17 + rand(-3, 3),
        y: rand(1.5, 9),
        size: rand(36, 52),
        swayDuration: rand(4.5, 8.5),
        glowDuration: rand(2.5, 4.5),
        delay: rand(0, 2),
      })),
    []
  );

  const shooting = useMemo<ShootingStarData[]>(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        id: i,
        x: rand(5, 55),
        y: rand(4, 38),
        delay: rand(0, 16),
      })),
    []
  );

  const orbs = useMemo<OrbData[]>(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: rand(8, 92),
        y: rand(50, 90),
        dur: rand(4, 8),
        delay: rand(0, 10),
      })),
    []
  );

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="ramadan-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            overflow: "hidden",
            pointerEvents: "none",
            willChange: "opacity",
          } as CSSProperties}
        >
          {/* Inject all keyframes once */}
          <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

          {/* ── Night sky ── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 68% 8%, #1e1268 0%, #0d0d3a 35%, #07071e 68%, #020210 100%)",
            } as CSSProperties}
          />

          {/* ── Nebula wisps (CSS only, no JS per frame) ── */}
          <div
            style={{
              position: "absolute",
              top: "7%",
              left: "16%",
              width: "38%",
              height: "28%",
              background:
                "radial-gradient(ellipse, #2d1b6940 0%, transparent 70%)",
              filter: "blur(40px)",
              animation: "ram-nebula 15s ease-in-out infinite",
              willChange: "transform, opacity",
            } as CSSProperties}
          />
          <div
            style={{
              position: "absolute",
              top: "3%",
              right: "20%",
              width: "22%",
              height: "18%",
              background:
                "radial-gradient(ellipse, #4a1a6035 0%, transparent 70%)",
              filter: "blur(30px)",
              animation: "ram-nebula 11s 4s ease-in-out infinite",
              willChange: "transform, opacity",
            } as CSSProperties}
          />

          {/* ── Stars ── */}
          <StarField stars={stars} />

          {/* ── Shooting stars ── */}
          <ShootingStars items={shooting} />

          {/* ── Geometric Islamic patterns ── */}
          <GeometricLayer />

          {/* ── Moon ── */}
          <CrescentMoon />

          {/* ── Lantern rope ── */}
          <div
            style={{
              position: "absolute",
              top: "1.8%",
              left: "4%",
              right: "4%",
              height: 1.5,
              zIndex: 7,
              background:
                "linear-gradient(90deg, transparent, #c8a060aa 8%, #c8a060 50%, #c8a060aa 92%, transparent)",
            } as CSSProperties}
          />

          {/* ── Lanterns ── */}
          {lanterns.map((l, i) => (
            <Lantern key={l.id} {...l} index={i} />
          ))}

          {/* ── Antigravity particle orbs ── */}
          <Orbs items={orbs} />

          {/* ── Ramadan Kareem text ── */}
          <div
            style={{
              position: "absolute",
              top: "4%",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 11,
              textAlign: "center",
              pointerEvents: "none",
              fontFamily: "'Georgia', 'Times New Roman', serif",
              color: "#f6c86e",
              letterSpacing: ".35em",
              fontSize: "clamp(14px, 2vw, 22px)",
              fontWeight: 300,
              whiteSpace: "nowrap",
              animation: "ram-text-glow 5s ease-in-out infinite",
              willChange: "text-shadow",
            } as CSSProperties}
          >
            رَمَضَان كَرِيم
          </div>

          {/* ── Arch silhouette ── */}
          <ArchSilhouette />

          {/* ── Edge vignette ── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 50%, transparent 35%, #00000055 100%)",
              zIndex: 9,
            } as CSSProperties}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RamadanOverlay;