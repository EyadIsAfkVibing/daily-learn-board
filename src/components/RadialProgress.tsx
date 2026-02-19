import { motion } from "framer-motion";

interface RadialProgressProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  delay?: number;
}

const RadialProgress = ({ percent, size = 56, strokeWidth = 5, label, delay = 0 }: RadialProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Track */}
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#radialGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ filter: "drop-shadow(0 0 4px hsl(var(--glow-primary) / 0.4))" }}
          />
          <defs>
            <linearGradient id="radialGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-foreground">{percent}%</span>
        </div>
      </div>
      {label && (
        <span className="text-[10px] font-medium text-muted-foreground truncate max-w-[70px] text-center" title={label}>
          {label}
        </span>
      )}
    </div>
  );
};

export default RadialProgress;
