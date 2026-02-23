/**
 * ProfilesPage.tsx
 * ─────────────────────────────────────────────────────────────────
 * Refined profile selection — the gateway to the entire app.
 *
 * Fixes from original:
 * • onDuplicate missing from ProfileCard props interface → fixed
 * • window.confirm → custom DeleteDialog, matches aesthetic
 * • No background canvas → NormalCanvas added behind page
 * • Subject row UX overhauled — color chips, cleaner layout
 * • Profile cards upgraded — accent color identity, richer stats
 * • Empty state for zero profiles
 * • "Continue" button integrated into header, not orphaned at bottom
 * • All motion is intentional, not decorative
 */

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfileContext";
import { getProfileStats } from "@/lib/ProfileManager";
import type { Profile, Subject } from "@/lib/ProfileManager";
import { DEFAULT_SUBJECTS } from "@/lib/ProfileManager";
import NormalCanvas from "@/components/NormalCanvas";
import { useMagneticHover } from "@/hooks/useMagneticHover";

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// ─── Profile accent colours (one per card, cycles) ────────────────
const ACCENTS = [
  { h: 210, label: "Ocean" },
  { h: 270, label: "Violet" },
  { h: 155, label: "Jade" },
  { h: 32, label: "Amber" },
  { h: 340, label: "Rose" },
  { h: 195, label: "Cyan" },
];

const accentFor = (idx: number) => ACCENTS[idx % ACCENTS.length];

// ─── Shared input style ───────────────────────────────────────────
const inputCls =
  "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground " +
  "placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 " +
  "focus:ring-1 focus:ring-primary/30 transition-all duration-200 text-sm";

// ═══════════════════════════════════════════════════════════════════
// DELETE CONFIRM DIALOG
// ═══════════════════════════════════════════════════════════════════
const DeleteDialog = ({
  open,
  profileName,
  onClose,
  onConfirm,
}: {
  open: boolean;
  profileName: string;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
        <motion.div
          className="relative z-10 w-full max-w-sm"
          initial={{ scale: 0.88, y: 16, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.88, y: 16, opacity: 0 }}
          transition={{ duration: 0.22, ease }}
        >
          <Card className="glass-strong p-8 rounded-3xl text-center">
            <div className="text-4xl mb-4">🗑</div>
            <h3 className="text-xl font-bold text-foreground mb-2">Delete Profile?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              <span className="text-foreground font-semibold">"{profileName}"</span> and all
              its progress will be permanently lost.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button
                className="flex-1 bg-destructive/80 hover:bg-destructive text-white border-0"
                onClick={() => { onConfirm(); onClose(); }}
              >
                Delete
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ═══════════════════════════════════════════════════════════════════
// RENAME DIALOG
// ═══════════════════════════════════════════════════════════════════
const RenameDialog = ({
  open,
  currentName,
  onClose,
  onRename,
}: {
  open: boolean;
  currentName: string;
  onClose: () => void;
  onRename: (name: string) => void;
}) => {
  const [name, setName] = useState(currentName);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = name.trim();
    if (!t) return;
    onRename(t);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
          <motion.div
            className="relative z-10 w-full max-w-md"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ duration: 0.22, ease }}
          >
            <Card className="glass-strong p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-foreground mb-5">Rename Profile</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                  autoFocus
                  maxLength={50}
                />
                <div className="flex gap-3 mt-6">
                  <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 premium-button" disabled={!name.trim()}>
                    Save
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════════
// CREATE PROFILE DIALOG — 2-step
// ═══════════════════════════════════════════════════════════════════
const SubjectRow = ({
  subject,
  index,
  onChange,
  onRemove,
}: {
  subject: Subject;
  index: number;
  onChange: (field: keyof Subject, value: any) => void;
  onRemove: () => void;
}) => {
  const accent = accentFor(index);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/8 group"
    >
      {/* Colour chip */}
      <div
        className="w-3 h-10 rounded-full flex-shrink-0"
        style={{ background: `hsla(${accent.h},75%,60%,0.85)` }}
      />

      {/* Name */}
      <input
        type="text"
        value={subject.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="Subject name"
        className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-black/30 border border-white/8
          text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/25 transition-all"
        required
      />

      {/* Lesson count */}
      <input
        type="number"
        min={1}
        max={999}
        value={subject.totalLessons}
        onChange={(e) => onChange("totalLessons", Math.max(1, parseInt(e.target.value) || 1))}
        className="w-20 px-3 py-2 rounded-lg bg-black/30 border border-white/8
          text-sm text-white text-center focus:outline-none focus:border-white/25 transition-all"
        required
      />

      {/* Priority badge */}
      <select
        value={subject.priority || "Medium"}
        onChange={(e) => onChange("priority", e.target.value)}
        className="px-3 py-2 rounded-lg bg-black/30 border border-white/8 text-sm text-white
          focus:outline-none focus:border-white/25 transition-all appearance-none cursor-pointer"
        style={{ minWidth: 90 }}
      >
        <option value="High">🔴 High</option>
        <option value="Medium">🟡 Medium</option>
        <option value="Low">🟢 Low</option>
      </select>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30
          hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
      >
        ✕
      </button>
    </motion.div>
  );
};

const CreateProfileDialog = ({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, subjects: Subject[], startDate: string, endDate?: string) => void;
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);

  const reset = () => {
    setName(""); setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate(""); setSubjects(DEFAULT_SUBJECTS); setStep(1);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubjectChange = (i: number, field: keyof Subject, value: any) => {
    setSubjects(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    const t = name.trim();
    if (!t || subjects.length === 0) return;
    onCreate(t, subjects, startDate, endDate || undefined);
    reset(); onClose();
  };

  // Progress bar for step indicator
  const stepPct = step === 1 ? 50 : 100;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/65 backdrop-blur-md" onClick={handleClose} />

          <motion.div
            className="relative z-10 w-full max-w-2xl"
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 24, opacity: 0 }}
            transition={{ duration: 0.26, ease }}
          >
            <Card className="glass-strong rounded-3xl overflow-hidden">
              {/* Step progress strip */}
              <div className="h-0.5 bg-white/8">
                <motion.div
                  className="h-full"
                  style={{ background: "linear-gradient(90deg,hsl(var(--primary)),hsl(var(--accent)))" }}
                  animate={{ width: `${stepPct}%` }}
                  transition={{ duration: 0.4, ease }}
                />
              </div>

              <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-7">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {step === 1 ? "New Profile" : "Your Subjects"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step === 1
                        ? "Give your study plan a name and timeline"
                        : "Add the subjects you'll be studying"}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground/60 mt-1">
                    {step} / 2
                  </span>
                </div>

                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    {step === 1 ? (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Profile Name
                          </label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Spring Semester 2025"
                            className={inputCls}
                            autoFocus
                            maxLength={50}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Start Date
                            </label>
                            <input
                              type="date"
                              required
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className={inputCls}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                              Target End Date
                              <span className="normal-case font-normal text-muted-foreground/50 ml-1">(optional)</span>
                            </label>
                            <input
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className={inputCls}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Column headers */}
                        <div className="flex items-center gap-3 px-3 mb-2">
                          <div className="w-3 flex-shrink-0" />
                          <span className="flex-1 text-xs text-muted-foreground/60 font-medium">Subject</span>
                          <span className="w-20 text-xs text-muted-foreground/60 font-medium text-center">Lessons</span>
                          <span className="w-[90px] text-xs text-muted-foreground/60 font-medium">Priority</span>
                          <div className="w-7" />
                        </div>

                        {/* Subject list */}
                        <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1 hidden-scrollbar">
                          <AnimatePresence>
                            {subjects.map((sub, i) => (
                              <SubjectRow
                                key={i}
                                subject={sub}
                                index={i}
                                onChange={(field, value) => handleSubjectChange(i, field, value)}
                                onRemove={() => setSubjects(prev => prev.filter((_, j) => j !== i))}
                              />
                            ))}
                          </AnimatePresence>
                        </div>

                        {/* Add subject */}
                        <button
                          type="button"
                          onClick={() => setSubjects(prev => [
                            ...prev,
                            { name: "", totalLessons: 10, priority: "Medium" }
                          ])}
                          className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-white/15
                            text-sm text-muted-foreground hover:text-foreground hover:border-white/30
                            hover:bg-white/4 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <span className="text-lg leading-none">＋</span> Add Subject
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer actions */}
                  <div className="flex gap-3 mt-8">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1"
                      onClick={step === 1 ? handleClose : () => setStep(1)}
                    >
                      {step === 1 ? "Cancel" : "← Back"}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 premium-button"
                      disabled={step === 1 ? !name.trim() : subjects.length === 0}
                    >
                      {step === 1 ? "Next →" : "Create Profile ✦"}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════════
// PROFILE CARD
// ═══════════════════════════════════════════════════════════════════
interface ProfileCardProps {
  profile: Profile;
  isActive: boolean;
  accentH: number;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
  onDuplicate: () => void;   // ← was missing from original interface
  index: number;
}

const ProfileCard = ({
  profile,
  isActive,
  accentH,
  onSelect,
  onRename,
  onDelete,
  onDuplicate,
  index,
}: ProfileCardProps) => {
  const mag = useMagneticHover({ tiltStrength: 8, liftPx: 14, spring: 0.1 });
  const stats = getProfileStats(profile);

  // Days since creation
  const daysSince = profile.createdAt
    ? Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / 86_400_000)
    : null;

  return (
    <motion.div
      ref={mag.ref}
      onMouseMove={mag.onMouseMove}
      onMouseLeave={mag.onMouseLeave}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index, duration: 0.42, ease }}
      layout
      style={{ position: "relative", transformStyle: "preserve-3d", willChange: "transform" }}
    >
      {/* Spotlight */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "1rem", pointerEvents: "none", zIndex: 2,
        background: `radial-gradient(ellipse at var(--spot-x,50%) var(--spot-y,50%),
          hsla(${accentH},80%,70%,calc(var(--spot-a,0)*.12)) 0%, transparent 65%)`,
      }} />

      <Card
        className={`relative p-5 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300
          ${isActive
            ? "ring-2 shadow-lg glass-strong"
            : "glass hover:ring-1 hover:ring-white/15"
          }`}
        style={isActive ? {
          "--tw-ring-color": `hsla(${accentH},75%,60%,0.45)`,
          boxShadow: `0 8px 32px hsla(${accentH},70%,50%,0.12)`,
        } as React.CSSProperties : {}}
        onClick={onSelect}
      >
        {/* Accent bar top */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, hsla(${accentH},80%,65%,0.9), hsla(${accentH + 30},75%,65%,0.5), transparent)` }}
        />

        {/* Active dot */}
        {isActive && (
          <motion.div
            className="absolute top-4 right-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: `hsl(${accentH},80%,65%)`,
                boxShadow: `0 0 8px hsla(${accentH},80%,65%,0.7)`,
              }}
            />
          </motion.div>
        )}

        {/* Name + meta */}
        <div className="mb-4 pr-6">
          <h3 className="text-base font-bold text-foreground truncate leading-tight mb-1">
            {profile.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{profile.subjects.length} subjects</span>
            <span className="opacity-40">·</span>
            <span>{stats.total} lessons</span>
            {daysSince !== null && (
              <>
                <span className="opacity-40">·</span>
                <span>{daysSince === 0 ? "today" : `${daysSince}d ago`}</span>
              </>
            )}
          </div>
        </div>

        {/* Subject colour chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {profile.subjects.slice(0, 5).map((sub, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: `hsla(${accentFor(i).h},70%,50%,0.18)`,
                color: `hsla(${accentFor(i).h},80%,72%,0.9)`,
                border: `1px solid hsla(${accentFor(i).h},70%,60%,0.2)`,
              }}
            >
              {sub.name}
            </span>
          ))}
          {profile.subjects.length > 5 && (
            <span className="text-xs px-2 py-0.5 rounded-full text-muted-foreground/60 bg-white/5">
              +{profile.subjects.length - 5}
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span
              className="text-xs font-bold tabular-nums"
              style={{ color: `hsl(${accentH},75%,68%)` }}
            >
              {stats.percent}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, hsl(${accentH},75%,58%), hsl(${accentH + 25},80%,68%))`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${stats.percent}%` }}
              transition={{ duration: 1.1, ease, delay: 0.1 * index }}
            />
          </div>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {stats.completed} of {stats.total} completed
          </p>
        </div>

        {/* Actions — stop click propagation to onSelect */}
        <div
          className="flex gap-1.5 pt-3.5 border-t border-white/8"
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { label: "Rename", icon: "✏️", action: onRename, cls: "hover:text-foreground" },
            { label: "Duplicate", icon: "📋", action: onDuplicate, cls: "hover:text-primary" },
            { label: "Delete", icon: "🗑", action: onDelete, cls: "hover:text-destructive" },
          ].map(({ label, icon, action, cls }) => (
            <button
              key={label}
              onClick={action}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg
                text-xs text-muted-foreground/60 hover:bg-white/6 transition-all duration-200 ${cls}`}
            >
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// NEW PROFILE CARD (CTA tile)
// ═══════════════════════════════════════════════════════════════════
const NewProfileCard = ({ onClick, index }: { onClick: () => void; index: number }) => {
  const mag = useMagneticHover({ tiltStrength: 10, liftPx: 18, spring: 0.11 });
  return (
    <motion.div
      ref={mag.ref}
      onMouseMove={mag.onMouseMove}
      onMouseLeave={mag.onMouseLeave}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index, duration: 0.42, ease }}
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      <Card
        onClick={onClick}
        className="glass p-5 rounded-2xl cursor-pointer h-full min-h-[220px] flex flex-col
          items-center justify-center gap-3 border border-dashed border-white/12
          hover:border-primary/35 hover:bg-white/3 transition-all duration-300 group"
      >
        <motion.div
          className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center
            text-2xl text-primary/60 group-hover:text-primary group-hover:bg-primary/18 transition-all duration-300"
          whileHover={{ scale: 1.1, rotate: 90 }}
          transition={{ duration: 0.28, ease }}
        >
          ＋
        </motion.div>
        <div className="text-center">
          <p className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
            New Profile
          </p>
          <p className="text-xs text-muted-foreground/50 mt-0.5">Start a fresh study plan</p>
        </div>
      </Card>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════
const ProfilesPage = () => {
  const navigate = useNavigate();
  const {
    profile: activeProfile,
    profiles,
    switchProfile,
    createProfile,
    deleteProfile,
    duplicateProfile,
    renameProfile: renameProfileFn,
  } = useProfile();

  const [showCreate, setShowCreate] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const renamingProfile = profiles.find(p => p.id === renamingId);
  const deletingProfile = profiles.find(p => p.id === deletingId);

  const handleSelect = useCallback((id: string) => {
    switchProfile(id);
    navigate("/dashboard");
  }, [switchProfile, navigate]);

  const handleCreate = useCallback(
    (name: string, subjects: Subject[], startDate: string, endDate?: string) => {
      const p = createProfile(name, subjects, startDate, undefined, endDate);
      switchProfile(p.id);
      navigate("/dashboard");
    },
    [createProfile, switchProfile, navigate]
  );

  const handleDuplicate = useCallback((id: string) => {
    const p = duplicateProfile(id);
    if (p) { switchProfile(p.id); navigate("/dashboard"); }
  }, [duplicateProfile, switchProfile, navigate]);

  const handleConfirmDelete = useCallback(() => {
    if (!deletingId) return;
    deleteProfile(deletingId);
    setDeletingId(null);
  }, [deletingId, deleteProfile]);

  const handleRename = useCallback((id: string, name: string) => {
    renameProfileFn(id, name);
  }, [renameProfileFn]);

  return (
    <>
      {/* Canvas background — same engine as dashboard */}
      <NormalCanvas scrollY={0} />

      <div className="min-h-screen relative z-20">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
          >
            <div>
              <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest mb-2">
                Study Profiles
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                Who's studying?
                <span className="holographic ml-2">✦</span>
              </h1>
              <p className="text-muted-foreground mt-2">
                Select a profile to continue, or create a new study plan.
              </p>
            </div>

            {/* Continue CTA — only when there's an active profile */}
            {activeProfile && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, ease }}
              >
                <Button
                  className="premium-button px-6 py-5 text-base whitespace-nowrap"
                  onClick={() => navigate("/dashboard")}
                >
                  Continue as {activeProfile.name} →
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* ── Profile grid ── */}
          {profiles.length === 0 ? (
            // Empty state
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ease }}
              className="text-center py-24"
            >
              <div className="text-6xl mb-4 opacity-30">📚</div>
              <h3 className="text-xl font-bold text-foreground mb-2">No profiles yet</h3>
              <p className="text-muted-foreground mb-8 text-sm">
                Create your first study profile to get started.
              </p>
              <Button className="premium-button px-8" onClick={() => setShowCreate(true)}>
                Create First Profile ✦
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {profiles.map((p, idx) => (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    isActive={p.id === activeProfile?.id}
                    accentH={accentFor(idx).h}
                    onSelect={() => handleSelect(p.id)}
                    onRename={() => setRenamingId(p.id)}
                    onDuplicate={() => handleDuplicate(p.id)}
                    onDelete={() => {
                      if (profiles.length <= 1) return; // can't delete last
                      setDeletingId(p.id);
                    }}
                    index={idx}
                  />
                ))}
              </AnimatePresence>

              {/* New profile tile */}
              <NewProfileCard
                onClick={() => setShowCreate(true)}
                index={profiles.length}
              />
            </div>
          )}

          {/* Can't delete last profile hint */}
          {profiles.length === 1 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-muted-foreground/40 text-center mt-6"
            >
              Create another profile to enable deletion.
            </motion.p>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <CreateProfileDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />

      {renamingProfile && (
        <RenameDialog
          open={!!renamingId}
          currentName={renamingProfile.name}
          onClose={() => setRenamingId(null)}
          onRename={(name) => { handleRename(renamingId!, name); setRenamingId(null); }}
        />
      )}

      <DeleteDialog
        open={!!deletingId}
        profileName={deletingProfile?.name ?? ""}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default ProfilesPage;