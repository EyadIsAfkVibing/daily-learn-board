import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CalendarView from "@/components/CalendarView";
const CalendarPage = () => {

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl font-bold text-primary mb-8">📅 Calendar</h1>
                    <CalendarView />
                </motion.div>
            </div>
        </div>
    );
};

export default CalendarPage;
