import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

import { ENHANCED_SCHEDULE, STORAGE_KEY, NOTES_STORAGE_KEY, getLessonDisplayName } from "@/lib/schedule";


const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const Statistics = () => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setProgress(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse saved progress", e);
            }
        }
    }, []);

    const stats = useMemo(() => {
        const subjectStats: { [key: string]: { completed: number; total: number } } = {};
        const dailyProgress: { date: string; completed: number; total: number }[] = [];

        let totalCompleted = 0;
        let totalLessons = 0;

        ENHANCED_SCHEDULE.forEach((day, dayIdx) => {
            let dayCompleted = 0;

            day.subjects.forEach((subject, subIdx) => {
                totalLessons++;

                if (!subjectStats[subject.name]) {
                    subjectStats[subject.name] = { completed: 0, total: 0 };
                }
                subjectStats[subject.name].total++;

                if (progress[`${dayIdx}-${subIdx}`]) {
                    totalCompleted++;
                    dayCompleted++;
                    subjectStats[subject.name].completed++;
                }
            });

            dailyProgress.push({
                date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                completed: dayCompleted,
                total: day.subjects.length,
            });
        });

        return { subjectStats, dailyProgress, totalCompleted, totalLessons };
    }, [progress]);

    const subjectChartData = Object.entries(stats.subjectStats).map(([name, data]) => ({
        name,
        completed: data.completed,
        remaining: data.total - data.completed,
        percentage: Math.round((data.completed / data.total) * 100),
    }));

    const pieChartData = Object.entries(stats.subjectStats).map(([name, data]) => ({
        name,
        value: data.completed,
    }));

    const completionRate = stats.totalLessons > 0
        ? Math.round((stats.totalCompleted / stats.totalLessons) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-primary mb-2">📊 Statistics</h1>
                            <p className="text-muted-foreground">Track your learning progress</p>
                        </div>
                        <Button onClick={() => navigate("/dashboard")} variant="outline" className="glass">
                            ← Back to Dashboard
                        </Button>
                    </div>

                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="glass p-6 text-center">
                                <div className="text-5xl font-bold text-accent mb-2">{completionRate}%</div>
                                <div className="text-sm text-muted-foreground font-semibold">Overall Completion</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {stats.totalCompleted} / {stats.totalLessons} lessons
                                </div>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="glass p-6 text-center">
                                <div className="text-5xl font-bold text-primary mb-2">
                                    {Object.keys(stats.subjectStats).length}
                                </div>
                                <div className="text-sm text-muted-foreground font-semibold">Total Subjects</div>
                                <div className="text-xs text-muted-foreground mt-1">Across all lessons</div>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="glass p-6 text-center">
                                <div className="text-5xl font-bold text-success mb-2">{stats.totalCompleted}</div>
                                <div className="text-sm text-muted-foreground font-semibold">Lessons Completed</div>
                                <div className="text-xs text-muted-foreground mt-1">Keep it up!</div>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Subject Progress Bar Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="glass p-6">
                            <h3 className="text-xl font-bold text-primary mb-4">📚 Progress by Subject</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={subjectChartData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            border: 'none',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="completed" fill="#8b5cf6" name="Completed" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="remaining" fill="#374151" name="Remaining" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </motion.div>

                    {/* Pie Chart */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card className="glass p-6">
                            <h3 className="text-xl font-bold text-primary mb-4">🎯 Subject Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card>
                    </motion.div>
                </div>

                {/* Daily Progress Line Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="glass p-6">
                        <h3 className="text-xl font-bold text-primary mb-4">📈 Daily Progress Timeline</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stats.dailyProgress}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        border: 'none',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="completed"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    name="Completed Lessons"
                                    dot={{ fill: '#8b5cf6', r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </motion.div>

                {/* Subject Details Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6"
                >
                    <Card className="glass p-6">
                        <h3 className="text-xl font-bold text-primary mb-4">📋 Detailed Subject Breakdown</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Subject</th>
                                        <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Completed</th>
                                        <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Total</th>
                                        <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Progress</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subjectChartData.map((subject, idx) => (
                                        <motion.tr
                                            key={subject.name}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * idx }}
                                            className="border-b border-border/30 hover:bg-accent/5"
                                        >
                                            <td className="py-3 px-4 font-medium">{subject.name}</td>
                                            <td className="text-center py-3 px-4">{subject.completed}</td>
                                            <td className="text-center py-3 px-4">{subject.completed + subject.remaining}</td>
                                            <td className="text-center py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-24 bg-secondary/30 rounded-full h-2">
                                                        <div
                                                            className="bg-accent h-2 rounded-full transition-all duration-500"
                                                            style={{ width: `${subject.percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold text-accent">{subject.percentage}%</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Statistics;