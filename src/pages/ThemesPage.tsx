import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const THEME_STORAGE_KEY = "selected-theme";

interface Theme {
    id: string;
    name: string;
    colors: {
        primary: string;
        accent: string;
        background: string;
        foreground: string;
    };
    preview: string[];
}

const THEMES: Theme[] = [
    {
        id: "purple",
        name: "Purple Dream",
        colors: {
            primary: "#8b5cf6",
            accent: "#a78bfa",
            background: "#0f172a",
            foreground: "#f1f5f9",
        },
        preview: ["bg-purple-500", "bg-purple-400", "bg-purple-600"],
    },
    {
        id: "blue",
        name: "Ocean Blue",
        colors: {
            primary: "#3b82f6",
            accent: "#60a5fa",
            background: "#0c4a6e",
            foreground: "#f0f9ff",
        },
        preview: ["bg-blue-500", "bg-blue-400", "bg-blue-600"],
    },
    {
        id: "green",
        name: "Forest Green",
        colors: {
            primary: "#10b981",
            accent: "#34d399",
            background: "#064e3b",
            foreground: "#ecfdf5",
        },
        preview: ["bg-green-500", "bg-green-400", "bg-green-600"],
    },
    {
        id: "pink",
        name: "Sakura Pink",
        colors: {
            primary: "#ec4899",
            accent: "#f472b6",
            background: "#831843",
            foreground: "#fdf2f8",
        },
        preview: ["bg-pink-500", "bg-pink-400", "bg-pink-600"],
    },
    {
        id: "orange",
        name: "Sunset Orange",
        colors: {
            primary: "#f97316",
            accent: "#fb923c",
            background: "#7c2d12",
            foreground: "#fff7ed",
        },
        preview: ["bg-orange-500", "bg-orange-400", "bg-orange-600"],
    },
    {
        id: "teal",
        name: "Teal Wave",
        colors: {
            primary: "#14b8a6",
            accent: "#2dd4bf",
            background: "#134e4a",
            foreground: "#f0fdfa",
        },
        preview: ["bg-teal-500", "bg-teal-400", "bg-teal-600"],
    },
    {
        id: "red",
        name: "Ruby Red",
        colors: {
            primary: "#ef4444",
            accent: "#f87171",
            background: "#7f1d1d",
            foreground: "#fef2f2",
        },
        preview: ["bg-red-500", "bg-red-400", "bg-red-600"],
    },
    {
        id: "indigo",
        name: "Deep Indigo",
        colors: {
            primary: "#6366f1",
            accent: "#818cf8",
            background: "#312e81",
            foreground: "#eef2ff",
        },
        preview: ["bg-indigo-500", "bg-indigo-400", "bg-indigo-600"],
    },
];

const ThemeSelector = () => {
    const [selectedTheme, setSelectedTheme] = useState("purple");

    useEffect(() => {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (saved) {
            setSelectedTheme(saved);
            applyTheme(saved);
        }
    }, []);

    const applyTheme = (themeId: string) => {
        const theme = THEMES.find(t => t.id === themeId);
        if (!theme) return;

        const root = document.documentElement;
        root.style.setProperty("--color-primary", theme.colors.primary);
        root.style.setProperty("--color-accent", theme.colors.accent);

        // You can expand this to change more CSS variables
    };

    const handleSelectTheme = (themeId: string) => {
        setSelectedTheme(themeId);
        applyTheme(themeId);
        localStorage.setItem(THEME_STORAGE_KEY, themeId);
        toast.success(`Theme changed to ${THEMES.find(t => t.id === themeId)?.name}! 🎨`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Custom Themes
                </h2>
                <p className="text-muted-foreground">
                    Choose your perfect color scheme
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {THEMES.map((theme, idx) => {
                    const isSelected = selectedTheme === theme.id;

                    return (
                        <motion.div
                            key={theme.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.03, y: -4 }}
                        >
                            <Card
                                className={`cursor-pointer transition-all ${isSelected
                                        ? "ring-4 ring-accent shadow-2xl"
                                        : "glass hover:shadow-xl"
                                    }`}
                                onClick={() => handleSelectTheme(theme.id)}
                            >
                                <div className="p-6">
                                    {/* Color Preview */}
                                    <div className="flex gap-2 mb-4">
                                        {theme.preview.map((color, i) => (
                                            <div
                                                key={i}
                                                className={`${color} h-16 flex-1 rounded-lg shadow-lg`}
                                            />
                                        ))}
                                    </div>

                                    {/* Theme Name */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-primary mb-1">{theme.name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {isSelected ? "Active" : "Click to apply"}
                                            </p>
                                        </div>

                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="text-accent"
                                            >
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Preview Card */}
            <Card className="glass-strong p-8">
                <h3 className="text-2xl font-bold text-primary mb-4">Theme Preview</h3>
                <div className="space-y-4">
                    <div className="p-4 bg-accent/20 rounded-lg">
                        <div className="text-accent font-bold mb-2">Accent Color</div>
                        <p className="text-foreground/80 text-sm">
                            This is how accent colors will look in your interface
                        </p>
                    </div>
                    <div className="p-4 bg-primary/20 rounded-lg">
                        <div className="text-primary font-bold mb-2">Primary Color</div>
                        <p className="text-foreground/80 text-sm">
                            Primary colors are used for headings and important elements
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="bg-accent">Accent Button</Button>
                        <Button className="bg-primary">Primary Button</Button>
                        <Button variant="outline">Outline Button</Button>
                    </div>
                </div>
            </Card>

            {/* Info */}
            <Card className="glass p-6">
                <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    About Themes
                </h3>
                <p className="text-sm text-muted-foreground">
                    Your theme preference is saved locally and will persist across sessions.
                    Choose a theme that's easy on your eyes and helps you focus better during study sessions.
                </p>
            </Card>
        </div>
    );
};

export default ThemeSelector;