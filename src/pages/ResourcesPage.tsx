import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ENHANCED_SCHEDULE, getLessonDisplayName } from "@/lib/schedule";
import { toast } from "sonner";

const RESOURCES_STORAGE_KEY = "study-resources";

interface Resource {
    id: string;
    lessonKey: string; // dayIndex-subjectIndex
    type: "link" | "pdf" | "video" | "note";
    title: string;
    url: string;
    addedDate: string;
}

const StudyResources = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<string>("");
    const [newResource, setNewResource] = useState({
        type: "link" as "link" | "pdf" | "video" | "note",
        title: "",
        url: "",
    });

    useEffect(() => {
        const saved = localStorage.getItem(RESOURCES_STORAGE_KEY);
        if (saved) {
            try {
                setResources(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse resources", e);
            }
        }
    }, []);

    const saveResources = (updatedResources: Resource[]) => {
        setResources(updatedResources);
        localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(updatedResources));
    };

    const handleAddResource = () => {
        if (!selectedLesson || !newResource.title || !newResource.url) {
            toast.error("Please fill all fields");
            return;
        }

        const resource: Resource = {
            id: Date.now().toString(),
            lessonKey: selectedLesson,
            type: newResource.type,
            title: newResource.title,
            url: newResource.url,
            addedDate: new Date().toISOString(),
        };

        saveResources([...resources, resource]);
        setNewResource({ type: "link", title: "", url: "" });
        setIsAdding(false);
        toast.success("Resource added! 📚");
    };

    const handleDeleteResource = (id: string) => {
        saveResources(resources.filter(r => r.id !== id));
        toast.success("Resource deleted!");
    };

    const getResourceIcon = (type: string) => {
        switch (type) {
            case "link":
                return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
            case "pdf":
                return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
            case "video":
                return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
            case "note":
                return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
        }
    };

    // Group resources by lesson
    const resourcesByLesson: { [key: string]: Resource[] } = {};
    resources.forEach(resource => {
        if (!resourcesByLesson[resource.lessonKey]) {
            resourcesByLesson[resource.lessonKey] = [];
        }
        resourcesByLesson[resource.lessonKey].push(resource);
    });

    // Get all lessons for dropdown
    const allLessons: Array<{ key: string; label: string }> = [];
    ENHANCED_SCHEDULE.forEach((day, dayIdx) => {
        day.subjects.forEach((subject, subIdx) => {
            const key = `${dayIdx}-${subIdx}`;
            allLessons.push({
                key,
                label: `Day ${day.day}: ${getLessonDisplayName(subject)}`,
            });
        });
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                        </svg>
                        Study Resources
                    </h2>
                    <p className="text-muted-foreground">
                        Organize your study materials, links, and resources
                    </p>
                </div>
                <Button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-accent"
                >
                    {isAdding ? "Cancel" : "+ Add Resource"}
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass p-4 text-center">
                    <div className="text-3xl font-bold text-accent mb-1">{resources.length}</div>
                    <div className="text-xs text-muted-foreground font-semibold">Total Resources</div>
                </Card>
                <Card className="glass p-4 text-center">
                    <div className="text-3xl font-bold text-blue-500 mb-1">
                        {resources.filter(r => r.type === "link").length}
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold">Links</div>
                </Card>
                <Card className="glass p-4 text-center">
                    <div className="text-3xl font-bold text-red-500 mb-1">
                        {resources.filter(r => r.type === "pdf").length}
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold">PDFs</div>
                </Card>
                <Card className="glass p-4 text-center">
                    <div className="text-3xl font-bold text-purple-500 mb-1">
                        {resources.filter(r => r.type === "video").length}
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold">Videos</div>
                </Card>
            </div>

            {/* Add Resource Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card className="glass-strong p-6">
                            <h3 className="text-lg font-bold text-primary mb-4">Add New Resource</h3>
                            <div className="grid gap-4">
                                <div>
                                    <label className="text-sm font-semibold mb-2 block">Select Lesson</label>
                                    <Select value={selectedLesson} onValueChange={setSelectedLesson}>
                                        <SelectTrigger className="glass">
                                            <SelectValue placeholder="Choose a lesson..." />
                                        </SelectTrigger>
                                        <SelectContent className="glass-strong max-h-60">
                                            {allLessons.map(lesson => (
                                                <SelectItem key={lesson.key} value={lesson.key}>
                                                    {lesson.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold mb-2 block">Resource Type</label>
                                    <Select
                                        value={newResource.type}
                                        onValueChange={(value: any) => setNewResource({ ...newResource, type: value })}
                                    >
                                        <SelectTrigger className="glass">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="glass-strong">
                                            <SelectItem value="link">🔗 Link</SelectItem>
                                            <SelectItem value="pdf">📄 PDF</SelectItem>
                                            <SelectItem value="video">🎥 Video</SelectItem>
                                            <SelectItem value="note">📝 Note</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold mb-2 block">Title</label>
                                    <Input
                                        value={newResource.title}
                                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                                        placeholder="e.g., Khan Academy Video"
                                        className="glass"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold mb-2 block">URL</label>
                                    <Input
                                        value={newResource.url}
                                        onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                                        placeholder="https://..."
                                        className="glass"
                                    />
                                </div>

                                <Button onClick={handleAddResource} className="bg-accent w-full">
                                    Add Resource
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Resources List */}
            {Object.keys(resourcesByLesson).length === 0 ? (
                <Card className="glass p-12 text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-bold text-primary mb-2">No Resources Yet</h3>
                    <p className="text-muted-foreground">
                        Start adding study materials to organize your learning
                    </p>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(resourcesByLesson).map(([lessonKey, lessonResources]) => {
                        const [dayIdx, subIdx] = lessonKey.split("-").map(Number);
                        const day = ENHANCED_SCHEDULE[dayIdx];
                        const subject = day.subjects[subIdx];

                        return (
                            <motion.div
                                key={lessonKey}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="glass p-6">
                                    <h3 className="text-lg font-bold text-primary mb-4">
                                        Day {day.day}: {getLessonDisplayName(subject)}
                                    </h3>

                                    <div className="grid gap-3">
                                        {lessonResources.map((resource) => (
                                            <motion.div
                                                key={resource.id}
                                                whileHover={{ scale: 1.01 }}
                                                className="flex items-center gap-3 p-3 glass-strong rounded-lg"
                                            >
                                                <div className="text-accent">
                                                    {getResourceIcon(resource.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-sm">{resource.title}</div>
                                                    <a
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-accent hover:underline"
                                                    >
                                                        {resource.url.length > 50 ? resource.url.substring(0, 50) + "..." : resource.url}
                                                    </a>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => window.open(resource.url, "_blank")}
                                                        className="glass"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDeleteResource(resource.id)}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudyResources;