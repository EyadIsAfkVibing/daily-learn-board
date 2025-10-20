import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ENHANCED_SCHEDULE, NOTES_STORAGE_KEY, getLessonDisplayName } from "@/lib/schedule";

interface NotesViewerProps {
    onClose?: () => void;
}

const NotesViewer = ({ onClose }: NotesViewerProps) => {
    const [notes, setNotes] = useState<{ [key: string]: string }>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedNote, setSelectedNote] = useState<{ key: string; note: string; lesson: any } | null>(null);

    useEffect(() => {
        const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
        if (savedNotes) {
            try {
                setNotes(JSON.parse(savedNotes));
            } catch (e) {
                console.error("Failed to parse notes", e);
            }
        }
    }, []);

    const notesWithLessons = useMemo(() => {
        const result: Array<{
            key: string;
            dayIndex: number;
            subjectIndex: number;
            lesson: any;
            note: string;
            date: string;
        }> = [];

        Object.entries(notes).forEach(([key, note]) => {
            if (!note || note.trim() === "") return;

            const [dayIdx, subIdx] = key.split("-").map(Number);
            const day = ENHANCED_SCHEDULE[dayIdx];
            if (!day) return;

            const lesson = day.subjects[subIdx];
            if (!lesson) return;

            result.push({
                key,
                dayIndex: dayIdx,
                subjectIndex: subIdx,
                lesson,
                note,
                date: day.date,
            });
        });

        return result;
    }, [notes]);

    const filteredNotes = useMemo(() => {
        if (!searchQuery) return notesWithLessons;

        const query = searchQuery.toLowerCase();
        return notesWithLessons.filter(item => {
            const lessonName = getLessonDisplayName(item.lesson).toLowerCase();
            const noteContent = item.note.toLowerCase();
            return lessonName.includes(query) || noteContent.includes(query);
        });
    }, [notesWithLessons, searchQuery]);

    const handleSaveNote = (key: string, newNote: string) => {
        const updatedNotes = { ...notes, [key]: newNote };
        setNotes(updatedNotes);
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
    };

    const handleDeleteNote = (key: string) => {
        const updatedNotes = { ...notes };
        delete updatedNotes[key];
        setNotes(updatedNotes);
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
        setSelectedNote(null);
    };

    const exportNotes = () => {
        let markdown = "# Study Notes\n\n";

        notesWithLessons.forEach(item => {
            const date = new Date(item.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric"
            });
            markdown += `## ${getLessonDisplayName(item.lesson)}\n`;
            markdown += `**Date:** ${date} | **Day:** ${item.dayIndex + 1}\n\n`;
            markdown += `${item.note}\n\n`;
            markdown += `---\n\n`;
        });

        const blob = new Blob([markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `study-notes-${new Date().toISOString().split("T")[0]}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-primary mb-2">📝 My Study Notes</h2>
                    <p className="text-muted-foreground">
                        {notesWithLessons.length} notes saved
                    </p>
                </div>
                <div className="flex gap-2">
                    {notesWithLessons.length > 0 && (
                        <Button
                            onClick={exportNotes}
                            variant="outline"
                            size="sm"
                            className="glass"
                        >
                            📥 Export Notes
                        </Button>
                    )}
                    {onClose && (
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="sm"
                        >
                            ✕ Close
                        </Button>
                    )}
                </div>
            </div>

            {/* Search */}
            <Input
                type="text"
                placeholder="Search notes by lesson or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass"
            />

            {/* Notes List */}
            {filteredNotes.length === 0 ? (
                <Card className="glass p-12 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-bold text-primary mb-2">
                        {searchQuery ? "No notes found" : "No notes yet"}
                    </h3>
                    <p className="text-muted-foreground">
                        {searchQuery
                            ? "Try a different search term"
                            : "Start adding notes to your lessons to see them here"
                        }
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredNotes.map((item, idx) => (
                        <motion.div
                            key={item.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                        >
                            <Card
                                className="glass p-5 cursor-pointer transition-all hover:shadow-lg"
                                onClick={() => setSelectedNote({ key: item.key, note: item.note, lesson: item.lesson })}
                            >
                                {/* Lesson Info */}
                                <div className="mb-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-bold text-primary text-sm">
                                            {getLessonDisplayName(item.lesson)}
                                        </h3>
                                        <span className="text-xs text-muted-foreground">
                                            Day {item.dayIndex + 1}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(item.date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric"
                                        })}
                                    </div>
                                </div>

                                {/* Note Preview */}
                                <div className="text-sm text-foreground/80 line-clamp-3">
                                    {item.note}
                                </div>

                                {/* Tags/Icons */}
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
                                    <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent font-semibold">
                                        {item.lesson.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {item.note.length} characters
                                    </span>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Note Detail Modal */}
            <AnimatePresence>
                {selectedNote && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedNote(null)}
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
                                    <div>
                                        <h3 className="text-2xl font-bold text-primary mb-1">
                                            {getLessonDisplayName(selectedNote.lesson)}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Lesson {selectedNote.lesson.lesson}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setSelectedNote(null)}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        ✕
                                    </Button>
                                </div>

                                {/* Note Content - Editable */}
                                <Textarea
                                    value={selectedNote.note}
                                    onChange={(e) => {
                                        setSelectedNote({ ...selectedNote, note: e.target.value });
                                    }}
                                    className="min-h-[300px] glass mb-4"
                                    placeholder="Add your notes here..."
                                />

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => {
                                            handleSaveNote(selectedNote.key, selectedNote.note);
                                            setSelectedNote(null);
                                        }}
                                        className="flex-1 bg-accent"
                                    >
                                        💾 Save Changes
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (confirm("Delete this note?")) {
                                                handleDeleteNote(selectedNote.key);
                                            }
                                        }}
                                        variant="destructive"
                                    >
                                        🗑️ Delete
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotesViewer;