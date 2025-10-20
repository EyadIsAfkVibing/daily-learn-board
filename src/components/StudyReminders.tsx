import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const REMINDER_STORAGE_KEY = "study-reminders";

interface ReminderSettings {
    enabled: boolean;
    time: string;
    notificationsAllowed: boolean;
}

const StudyReminders = () => {
    const [settings, setSettings] = useState<ReminderSettings>({
        enabled: false,
        time: "09:00",
        notificationsAllowed: false,
    });

    useEffect(() => {
        // Load saved settings
        const saved = localStorage.getItem(REMINDER_STORAGE_KEY);
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse reminder settings", e);
            }
        }

        // Check notification permission
        if ("Notification" in window) {
            setSettings(prev => ({
                ...prev,
                notificationsAllowed: Notification.permission === "granted",
            }));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));

        if (settings.enabled && settings.notificationsAllowed) {
            scheduleReminder();
        }
    }, [settings]);

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            toast.error("Your browser doesn't support notifications");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                setSettings(prev => ({ ...prev, notificationsAllowed: true }));
                toast.success("Notifications enabled! 🔔");
            } else {
                toast.error("Notification permission denied");
            }
        } catch (error) {
            console.error("Error requesting notification permission:", error);
            toast.error("Failed to enable notifications");
        }
    };

    const scheduleReminder = () => {
        const [hours, minutes] = settings.time.split(':').map(Number);
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        // If time has passed today, schedule for tomorrow
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const timeUntilReminder = scheduledTime.getTime() - now.getTime();

        setTimeout(() => {
            sendNotification();
            // Schedule next day's reminder
            scheduleReminder();
        }, timeUntilReminder);
    };

    const sendNotification = () => {
        if (settings.notificationsAllowed && "Notification" in window) {
            new Notification("Time to Study! 📚", {
                body: "Don't forget to complete today's lessons!",
                icon: "/favicon.ico",
                badge: "/favicon.ico",
            });
        }
    };

    const testNotification = () => {
        if (!settings.notificationsAllowed) {
            toast.error("Please enable notifications first");
            return;
        }
        sendNotification();
        toast.success("Test notification sent!");
    };

    const toggleReminder = (enabled: boolean) => {
        if (enabled && !settings.notificationsAllowed) {
            requestNotificationPermission();
        }
        setSettings(prev => ({ ...prev, enabled }));
    };

    return (
        <Card className="glass p-6">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h3 className="text-2xl font-bold text-primary mb-2">Study Reminders 🔔</h3>
                    <p className="text-sm text-muted-foreground">
                        Get notified to stay on track with your learning goals
                    </p>
                </div>

                {/* Enable Toggle */}
                <motion.div
                    className="flex items-center justify-between p-4 glass-strong rounded-lg"
                    whileHover={{ scale: 1.01 }}
                >
                    <div>
                        <div className="font-semibold text-primary">Daily Reminder</div>
                        <div className="text-sm text-muted-foreground">
                            {settings.enabled ? "Enabled" : "Disabled"}
                        </div>
                    </div>
                    <Switch
                        checked={settings.enabled}
                        onCheckedChange={toggleReminder}
                    />
                </motion.div>

                {/* Time Picker */}
                {settings.enabled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="text-sm font-semibold mb-2 block">
                                Reminder Time
                            </label>
                            <Input
                                type="time"
                                value={settings.time}
                                onChange={(e) => setSettings(prev => ({ ...prev, time: e.target.value }))}
                                className="glass"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                You'll receive a notification at {settings.time} daily
                            </p>
                        </div>

                        {/* Notification Status */}
                        <div className="p-4 rounded-lg border border-border/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold">Browser Notifications</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${settings.notificationsAllowed
                                        ? "bg-success/20 text-success"
                                        : "bg-destructive/20 text-destructive"
                                    }`}>
                                    {settings.notificationsAllowed ? "Allowed" : "Blocked"}
                                </span>
                            </div>
                            {!settings.notificationsAllowed && (
                                <Button
                                    onClick={requestNotificationPermission}
                                    size="sm"
                                    className="w-full mt-2"
                                    variant="outline"
                                >
                                    Enable Notifications
                                </Button>
                            )}
                        </div>

                        {/* Test Button */}
                        {settings.notificationsAllowed && (
                            <Button
                                onClick={testNotification}
                                variant="outline"
                                className="w-full glass"
                            >
                                🔔 Send Test Notification
                            </Button>
                        )}
                    </motion.div>
                )}

                {/* Info Box */}
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/30">
                    <div className="flex gap-3">
                        <div className="text-2xl">💡</div>
                        <div className="flex-1 text-sm">
                            <div className="font-semibold text-primary mb-1">Pro Tip</div>
                            <p className="text-muted-foreground">
                                Set your reminder for a time when you're most productive.
                                Consistent study times help build lasting habits!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-strong p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-accent mb-1">
                            {settings.enabled ? "🔔" : "🔕"}
                        </div>
                        <div className="text-xs text-muted-foreground font-semibold">
                            Reminder Status
                        </div>
                    </div>
                    <div className="glass-strong p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-primary mb-1">
                            {settings.time}
                        </div>
                        <div className="text-xs text-muted-foreground font-semibold">
                            Scheduled Time
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default StudyReminders;