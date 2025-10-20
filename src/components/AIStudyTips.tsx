// AITipsPage.tsx
import AIStudyTips from "@/components/AIStudyTips";
import { motion } from "framer-motion";

const AITipsPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <AIStudyTips />
                </motion.div>
            </div>
        </div>
    );
};

export default AITipsPage;