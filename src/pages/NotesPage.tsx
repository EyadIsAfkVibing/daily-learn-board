// NotesPage.tsx
import { useState, useEffect } from "react";
import LessonManager from "@/components/LessonManager";
import { motion } from "framer-motion";

const NotesPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <LessonManager />
                </motion.div>
            </div>
        </div>
    );
};

export default NotesPage;
