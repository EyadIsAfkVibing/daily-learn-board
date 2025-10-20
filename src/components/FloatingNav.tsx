import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface NavItem {
    id: string;
    label: string;
    icon: JSX.Element;
    path: string;
    color: string;
}

const NAV_ITEMS: NavItem[] = [
    {
        id: "dashboard",
        label: "Dashboard",
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        path: "/dashboard",
        color: "bg-blue-500"
    },
    {
        id: "today",
        label: "Today's Lesson",
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
        path: "/",
        color: "bg-purple-500"
    },
    {
        id: "calendar",
        label: "Calendar",
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        path: "/calendar",
        color: "bg-green-500"
    },
    {
        id: "stats",
        label: "Statistics",
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
        path: "/statistics",
        color: "bg-yellow-500"
    },
    {
        id: "achievements",
        label: "Achievements",
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
        path: "/achievements",
        color: "bg-orange-500"
    },
    {
        id: "notes",
        label: "My Notes",
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
        path: "/notes",
        color: "bg-pink-500"
    },
    {
        id: "weekly",
        label: "Weekly Summary",
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
        path: "/weekly-summary",
        color: "bg-red-500"
    },
    {
        id: "reminders",
        label: "Reminders",
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
        path: "/reminders",
        color: "bg-indigo-500"
    },
    {
        id: "resources",
        label: "Resources",
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9a2 2 0 114 0 2 2 0 110 4h2a2 2 0 012 2v3H8a2 2 0 01-2-2v-3h2a2 2 0 110-4H6V6h3a2 2 0 012 2" /></svg>,
        path: "/resources",
        color: "bg-cyan-500",
    },
    {
        id: "focus",
        label: "Focus Mode",
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" strokeWidth={2} /><circle cx="12" cy="12" r="4" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v2M12 18v2M4 12h2M18 12h2" /></svg>,
        path: "/focus",
        color: "bg-emerald-500"
    },
    {
        id: "themes",
        label: "Themes",
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 13l7-7a4 4 0 015.7 5.7l-7 7A3 3 0 018 19H6a2 2 0 01-2-2v-2a3 3 0 01.9-2.1z" /><circle cx="15" cy="9" r="1.5" /></svg>,
        path: "/themes",
        color: "bg-fuchsia-500"
    },
    {
        id: "ai-tips",
        label: "AI Tips",
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4l1.5 3L14 8l-3 1.5L9 13 7.5 9.5 4 8l3.5-1zM16 16h4v-4h-4v4z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12v-2m0 10v-2M12 18h-2m10 0h-2M12 12h-2m10 0h-2" /></svg>,
        path: "/ai-tips",
        color: "bg-amber-500"
    }

];

const FloatingNav = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Navigation Items - Grid Layout */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                            onClick={toggleMenu}
                        />

                        {/* Menu Grid */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute bottom-24 right-0 grid grid-cols-2 gap-3 p-4 bg-background/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/50"
                            style={{ width: '320px' }}
                        >
                            {NAV_ITEMS.map((item, index) => (
                                <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleNavigate(item.path)}
                                    className={`
                    ${item.color} 
                    p-4 rounded-xl
                    flex flex-col items-center justify-center gap-2
                    text-white
                    shadow-lg hover:shadow-xl
                    transition-all
                    group
                  `}
                                >
                                    <div className="transform group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <span className="text-xs font-semibold text-center leading-tight">
                                        {item.label}
                                    </span>
                                </motion.button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleMenu}
                className={`
          w-16 h-16 rounded-full 
          bg-gradient-to-br from-purple-600 to-blue-600
          flex items-center justify-center
          shadow-2xl hover:shadow-purple-500/50
          text-white
          relative overflow-hidden
          border-2 border-white/20
        `}
            >
                <motion.div
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    {isOpen ? (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </motion.div>

                {/* Pulse Effect */}
                {!isOpen && (
                    <motion.div
                        className="absolute inset-0 rounded-full bg-purple-400"
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </motion.button>
        </div>
    );
};

export default FloatingNav;