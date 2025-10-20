// RemindersPage.tsx
import StudyReminders from "@/components/StudyReminders";
import { motion } from "framer-motion";

const RemindersPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl font-bold text-primary mb-8">🔔 Study Reminders</h1>
                    <StudyReminders />
                </motion.div>
            </div>
        </div>
    );
};

export default RemindersPage;