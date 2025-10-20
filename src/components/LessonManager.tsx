import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ENHANCED_SCHEDULE, NOTES_STORAGE_KEY, STORAGE_KEY } from "@/lib/schedule";
import { toast } from "sonner";

const LESSON_NAMES_KEY = "custom-lesson-names";

interface LessonNote {
    dayIndex: number;
    subjectIndex: number;
    lessonName: string;
    customName?: string;
    topic: string;
    note: string;
    date: string;
    completed: boolean;
}

const LessonManager = () => {
    const [notes, setNotes] = useState<{ [key: string]: string }>({});
    const [customNames, setCustomNames] = useState<{ [key: string]: string }>({});
    const [progress, setProgress] = useState<{ [key: string]: boolean }>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLesson, setSelectedLesson] = useState<LessonNote | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");

    useEffect(() => {
        // Load notes
        const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
        if (savedNotes) {
            try {
                setNotes(JSON.parse(savedNotes));
            } catch (e) {
                console.error("Failed to parse notes", e);
            }
        }

        // Load custom names
        const savedNames = localStorage.getItem(LESSON_NAMES_KEY);
        if (savedNames) {
            try {
                setCustomNames(JSON.parse(savedNames));
            } catch (e) {
                console.error("Failed to parse custom names", e);
            }
        }

        // Load progress
        const savedProgress = localStorage.getItem(STORAGE_KEY);
        if (savedProgress) {
            try {
                setProgress(JSON.parse(savedProgress));
            } catch (e) {
                console.error("Failed to parse progress", e);
            }
        }
    }, []);

    const allLessons = useMemo(() => {
        const lessons: LessonNote[] = [];

        ENHANCED_SCHEDULE.forEach((day, dayIdx) => {
            day.subjects.forEach((subject, subIdx) => {
                const key = `${dayIdx}-${subIdx}`;
                const customName = customNames[key];
                const note = notes[key] || "";
                const completed = progress[key] || false;

                lessons.push({
                    dayIndex: dayIdx,
                    subjectIndex: subIdx,
                    lessonName: subject.name,
                    customName,
                    topic: subject.topic,
                    note,
                    date: day.date,
                    completed,
                });
            });
        });

        return lessons;
    }, [notes, customNames, progress]);

    const filteredLessons = useMemo(() => {
        if (!searchQuery) return allLessons;

        const query = searchQuery.toLowerCase();
        return allLessons.filter(lesson => {
            const displayName = (lesson.customName || lesson.lessonName).toLowerCase();
            const topic = lesson.topic.toLowerCase();
            const noteContent = lesson.note.toLowerCase();

            return displayName.includes(query) ||
                topic.includes(query) ||
                noteContent.includes(query);
        });
    }, [allLessons, searchQuery]);

    const handleSaveNote = (lesson: LessonNote, newNote: string) => {
        const key = `${lesson.dayIndex}-${lesson.subjectIndex}`;
        const updatedNotes = { ...notes, [key]: newNote };
        setNotes(updatedNotes);
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
        toast.success("Note saved! 💾");
    };

    const handleRenameLesson = (lesson: LessonNote, newName: string) => {
        const key = `${lesson.dayIndex}-${lesson.subjectIndex}`;
        const updatedNames = { ...customNames, [key]: newName };
        setCustomNames(updatedNames);
        localStorage.setItem(LESSON_NAMES_KEY, JSON.stringify(updatedNames));
        setIsEditingName(false);
        toast.success("Lesson renamed! ✏️");
    };

    const handleDeleteNote = (lesson: LessonNote) => {
        const key = `${lesson.dayIndex}-${lesson.subjectIndex}`;
        const updatedNotes = { ...notes };
        delete updatedNotes[key];
        setNotes(updatedNotes);
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
        setSelectedLesson(null);
        toast.success("Note deleted! 🗑️");
    };

    const exportAllNotes = () => {
        let markdown = "# My Study Lessons & Notes\n\n";

        allLessons.forEach(lesson => {
            const displayName = lesson.customName || lesson.lessonName;
            const date = new Date(lesson.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric"
            });

            markdown += `## ${displayName}\n`;
            markdown += `**Topic:** ${lesson.topic}\n`;
            markdown += `**Date:** ${date}\n`;
            markdown += `**Status:** ${lesson.completed ? "✅ Completed" : "⏳ Pending"}\n\n`;

            if (lesson.note) {
                markdown += `### Notes:\n${lesson.note}\n\n`;
            }

            markdown += `---\n\n`;
        });

        const blob = new Blob([markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `my-lessons-${new Date().toISOString().split("T")[0]}.md`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Lessons exported! 📥");
    };

    const lessonsWithNotes = filteredLessons.filter(l => l.note);
    const completedLessons = filteredLessons.filter(l => l.completed);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-primary mb-2">📚 My Lessons</h2>
                    <p className="text-muted-foreground">
                        Manage and organize all your lessons
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={exportAllNotes}
                        variant="outline"
                        size="sm"
                        className="glass"
                    >
                        📥 Export All
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass p-4 text-center">
                    <div className="text-3xl font-bold text-accent mb-1">{allLessons.length}</div>
                    <div className="text-xs text-muted-foreground font-semibold">Total Lessons</div>
                </Card>
                <Card className="glass p-4 text-center">
                    <div className="text-3xl font-bold text-success mb-1">{completedLessons.length}</div>
                    <div className="text-xs text-muted-foreground font-semibold">Completed</div>
                </Card>
                <Card className="glass p-4 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{lessonsWithNotes.length}</div>
                    <div className="text-xs text-muted-foreground font-semibold">With Notes</div>
                </Card>
                <Card className="glass p-4 text-center">
                    <div className="text-3xl font-bold text-purple-500 mb-1">
                        {Object.keys(customNames).length}
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold">Custom Names</div>
                </Card>
            </div>

            {/* Search */}
            <Input
                type="text"
                placeholder="Search lessons by name, topic, or note content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass"
            />

            {/* Lessons Grid */}
            {filteredLessons.length === 0 ? (
                <Card className="glass p-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-primary mb-2">No lessons found</h3>
                    <p className="text-muted-foreground">Try a different search term</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLessons.map((lesson, idx) => {
                        const displayName = lesson.customName || lesson.lessonName;

                        return (
                            <motion.div
                                key={`${lesson.dayIndex}-${lesson.subjectIndex}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                            >
                                <Card
                                    className={`p-5 cursor-pointer transition-all ${lesson.completed
                                            ? "glass border border-success/30"
                                            : "glass"
                                        }`}
                                    onClick={() => setSelectedLesson(lesson)}
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-primary text-sm mb-1">
                                                {displayName}
                                            </h3>
                                            <p className="text-xs text-muted-foreground">
                                                {lesson.topic}
                                            </p>
                                        </div>
                                        {lesson.completed && (
                                            <div className="text-xl">✓</div>
                                        )}
                                    </div>

                                    {/* Date */}
                                    <div className="text-xs text-muted-foreground mb-3">
                                        {new Date(lesson.date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric"
                                        })}
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {lesson.customName && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 font-semibold">
                                                ✏️ Renamed
                                            </span>
                                        )}
                                        {lesson.note && (
                                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 font-semibold">
                                                📝 Has Notes
                                            </span>
                                        )}
                                    </div>

                                    {/* Note Preview */}
                                    {lesson.note && (
                                        <div className="mt-3 pt-3 border-t border-border/30">
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {lesson.note}
                                            </p>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Lesson Detail Modal */}
            <AnimatePresence>
                {selectedLesson && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => {
                            setSelectedLesson(null);
                            setIsEditingName(false);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        >
                            <Card className="glass-strong p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        {isEditingName ? (
                                            <div className="flex gap-2">
                                                <Input
                                                    value={tempName}
                                                    onChange={(e) => setTempName(e.target.value)}
                                                    placeholder="Enter custom name..."
                                                    className="glass"
                                                    autoFocus
                                                />
                                                <Button
                                                    onClick={() => handleRenameLesson(selectedLesson, tempName)}
                                                    size="sm"
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    onClick={() => setIsEditingName(false)}
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-2xl font-bold text-primary">
                                                        {selectedLesson.customName || selectedLesson.lessonName}
                                                    </h3>
                                                    <Button
                                                        onClick={() => {
                                                            setIsEditingName(true);
                                                            setTempName(selectedLesson.customName || selectedLesson.lessonName);
                                                        }}
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        ✏️
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {selectedLesson.topic}
                                                </p>
                                                {selectedLesson.customName && (
                                                    <p className="text-xs text-purple-400 mt-1">
                                                        Original: {selectedLesson.lessonName}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setSelectedLesson(null);
                                            setIsEditingName(false);
                                        }}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        ✕
                                    </Button>
                                </div>

                                {/* Info */}
                                <div className="flex gap-4 mb-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Date:</span>{" "}
                                        <span className="font-semibold">
                                            {new Date(selectedLesson.date).toLocaleDateString("en-US", {
                                                month: "long",
                                                day: "numeric"
                                            })}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Status:</span>{" "}
                                        <span className={`font-semibold ${selectedLesson.completed ? "text-success" : "text-muted-foreground"}`}>
                                            {selectedLesson.completed ? "✅ Completed" : "⏳ Pending"}
                                        </span>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="mb-4">
                                    <label className="text-sm font-semibold mb-2 block">
                                        📝 Lesson Notes
                                    </label>
                                    <Textarea
                                        value={selectedLesson.note}
                                        onChange={(e) => {
                                            setSelectedLesson({ ...selectedLesson, note: e.target.value });
                                        }}
                                        className="min-h-[200px] glass"
                                        placeholder="Add your notes here..."
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => {
                                            handleSaveNote(selectedLesson, selectedLesson.note);
                                        }}
                                        className="flex-1 bg-accent"
                                    >
                                        💾 Save Notes
                                    </Button>
                                    {selectedLesson.note && (
                                        <Button
                                            onClick={() => {
                                                if (confirm("Delete this note?")) {
                                                    handleDeleteNote(selectedLesson);
                                                }
                                            }}
                                            variant="destructive"
                                        >
                                            🗑️
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LessonManager;