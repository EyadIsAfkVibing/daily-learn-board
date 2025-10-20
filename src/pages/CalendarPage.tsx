// CalendarPage.tsx
import { useState, useEffect } from "react";
import CalendarView from "@/components/CalendarView";
import { STORAGE_KEY } from "@/lib/schedule";
import { motion } from "framer-motion";

const CalendarPage = () => {
    const [progress, setProgress] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setProgress(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse progress", e);
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl font-bold text-primary mb-8">📅 Calendar View</h1>
                    <CalendarView progress={progress} />
                </motion.div>
            </div>
        </div>
    );
};

export default CalendarPage;
