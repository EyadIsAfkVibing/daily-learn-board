import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// Hard-coded schedule data
const SCHEDULE = [
  { day: 1, date: "2025-10-18", subjects: [{ name: "Arabic Reading", lesson: 1 }, { name: "Science", lesson: 1 }] },
  { day: 2, date: "2025-10-19", subjects: [{ name: "Arabic Nosoos", lesson: 1 }, { name: "Algebra", lesson: 1 }] },
  { day: 3, date: "2025-10-20", subjects: [{ name: "Arabic Grammar", lesson: 1 }, { name: "Science", lesson: 2 }] },
  { day: 4, date: "2025-10-21", subjects: [{ name: "Arabic AlA'dab", lesson: 1 }, { name: "History", lesson: 1 }] },
  { day: 5, date: "2025-10-22", subjects: [{ name: "Arabic Balagha", lesson: 1 }, { name: "Geometry", lesson: 1 }] },
  { day: 6, date: "2025-10-23", subjects: [{ name: "Arabic Reading", lesson: 2 }, { name: "Science", lesson: 3 }] },
  { day: 7, date: "2025-10-24", subjects: [{ name: "Arabic Nosoos", lesson: 2 }, { name: "Trigonometry", lesson: 1 }] },
  { day: 8, date: "2025-10-25", subjects: [{ name: "Arabic Grammar", lesson: 2 }, { name: "Science", lesson: 4 }] },
  { day: 9, date: "2025-10-26", subjects: [{ name: "Arabic AlA'dab", lesson: 2 }, { name: "History", lesson: 2 }] },
  { day: 10, date: "2025-10-27", subjects: [{ name: "Arabic Balagha", lesson: 2 }, { name: "Science", lesson: 5 }] },
  { day: 11, date: "2025-10-28", subjects: [{ name: "Arabic Reading", lesson: 3 }, { name: "Algebra", lesson: 2 }] },
  { day: 12, date: "2025-10-29", subjects: [{ name: "Arabic Nosoos", lesson: 3 }, { name: "Science", lesson: 6 }] },
  { day: 13, date: "2025-10-30", subjects: [{ name: "Arabic Grammar", lesson: 3 }, { name: "History", lesson: 3 }] },
  { day: 14, date: "2025-10-31", subjects: [{ name: "Arabic AlA'dab", lesson: 3 }, { name: "Science", lesson: 7 }] },
  { day: 15, date: "2025-11-01", subjects: [{ name: "Arabic Balagha", lesson: 3 }, { name: "Trigonometry", lesson: 2 }] },
  { day: 16, date: "2025-11-02", subjects: [{ name: "Arabic Nosoos", lesson: 4 }, { name: "Science", lesson: 8 }] },
  { day: 17, date: "2025-11-03", subjects: [{ name: "Arabic Grammar", lesson: 4 }, { name: "Algebra", lesson: 3 }] },
  { day: 18, date: "2025-11-04", subjects: [{ name: "Arabic Balagha", lesson: 4 }, { name: "Science", lesson: 9 }] },
  { day: 19, date: "2025-11-05", subjects: [{ name: "Arabic Nosoos", lesson: 5 }, { name: "Geometry", lesson: 2 }] },
  { day: 20, date: "2025-11-06", subjects: [{ name: "Arabic Grammar", lesson: 5 }, { name: "Science", lesson: 10 }] },
  { day: 21, date: "2025-11-07", subjects: [{ name: "History", lesson: 4 }, { name: "Trigonometry", lesson: 3 }] },
  { day: 22, date: "2025-11-08", subjects: [{ name: "Science", lesson: 11 }, { name: "Algebra", lesson: 4 }] },
  { day: 23, date: "2025-11-09", subjects: [{ name: "History", lesson: 5 }, { name: "Science", lesson: 12 }] },
  { day: 24, date: "2025-11-10", subjects: [{ name: "Geometry", lesson: 3 }, { name: "Science", lesson: 13 }] },
  { day: 25, date: "2025-11-11", subjects: [{ name: "Trigonometry", lesson: 4 }, { name: "Science", lesson: 14 }] },
  { day: 26, date: "2025-11-12", subjects: [{ name: "History", lesson: 6 }, { name: "Algebra", lesson: 5 }] },
  { day: 27, date: "2025-11-13", subjects: [{ name: "Geometry", lesson: 4 }, { name: "Trigonometry", lesson: 5 }] },
  { day: 28, date: "2025-11-14", subjects: [{ name: "History", lesson: 7 }, { name: "Geometry", lesson: 5 }] },
];

const STORAGE_KEY = "study-dashboard-progress";

interface ProgressData {
  [key: string]: boolean;
}

const Index = () => {
  const [progress, setProgress] = useState<ProgressData>({});
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [compactView, setCompactView] = useState(false);
  const todayRef = useRef<HTMLDivElement>(null);

  // Initialize dark mode from system preference
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
  }, []);

  // Apply dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Load progress from localStorage
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

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const toggleLesson = (dayIndex: number, subjectIndex: number) => {
    const key = `${dayIndex}-${subjectIndex}`;
    setProgress((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Calculate total lessons and completed
  const { totalLessons, completedLessons } = useMemo(() => {
    let total = 0;
    let completed = 0;
    SCHEDULE.forEach((day, dayIdx) => {
      day.subjects.forEach((_, subIdx) => {
        total++;
        if (progress[`${dayIdx}-${subIdx}`]) completed++;
      });
    });
    return { totalLessons: total, completedLessons: completed };
  }, [progress]);

  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Calculate per-subject progress
  const subjectProgress = useMemo(() => {
    const subjects: { [key: string]: { total: number; completed: number } } = {};
    SCHEDULE.forEach((day, dayIdx) => {
      day.subjects.forEach((subject, subIdx) => {
        if (!subjects[subject.name]) {
          subjects[subject.name] = { total: 0, completed: 0 };
        }
        subjects[subject.name].total++;
        if (progress[`${dayIdx}-${subIdx}`]) {
          subjects[subject.name].completed++;
        }
      });
    });
    return subjects;
  }, [progress]);

  const uniqueSubjects = Object.keys(subjectProgress).sort();

  // Helper functions
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    return dateStr === today;
  };

  // Filter and search logic
  const filteredDays = useMemo(() => {
    return SCHEDULE.map((day, dayIdx) => {
      const filteredSubjects = day.subjects
        .map((subject, subIdx) => ({ ...subject, subIdx }))
        .filter((subject) => {
          const isCompleted = progress[`${dayIdx}-${subject.subIdx}`];

          // Status filter
          if (filter === "done" && !isCompleted) return false;
          if (filter === "notDone" && isCompleted) return false;

          // Subject filter
          if (subjectFilter !== "all" && subject.name !== subjectFilter) return false;

          // Search filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSubject = subject.name.toLowerCase().includes(query);
            const matchesDate = day.date.includes(query) || formatDate(day.date).toLowerCase().includes(query);
            if (!matchesSubject && !matchesDate) return false;
          }

          return true;
        });

      return filteredSubjects.length > 0 ? { ...day, dayIdx, subjects: filteredSubjects } : null;
    }).filter(Boolean);
  }, [filter, subjectFilter, searchQuery, progress]);

  const resetProgress = () => {
    if (window.confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
      setProgress({});
      toast.success("Progress reset successfully");
    }
  };

  const exportProgress = () => {
    const data = JSON.stringify(progress, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study-progress-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Progress exported successfully");
  };

  const importProgress = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            setProgress(data);
            toast.success("Progress imported successfully");
          } catch (err) {
            toast.error("Failed to import progress. Invalid file format.");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const jumpToToday = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayIndex = SCHEDULE.findIndex((day) => day.date === today);
    if (todayIndex >= 0) {
      const element = document.getElementById(`day-${todayIndex}`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.success("Jumped to today");
    } else {
      toast.error("Today is not in the study schedule range");
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Study Dashboard</h1>
              <p className="text-muted-foreground">
                Start date: Oct 18 — Mark each lesson done as you complete it
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={jumpToToday}
                aria-label="Jump to today's lesson"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
              >
                {darkMode ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Overall Progress</span>
              <span className="text-sm font-semibold text-primary">
                {completedLessons} / {totalLessons} ({progressPercent}%)
              </span>
            </div>
            <div
              className="w-full bg-secondary rounded-full h-3 overflow-hidden"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Study progress: ${progressPercent}% complete`}
            >
              <div
                className="bg-primary h-full transition-all duration-500 ease-smooth rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Subject Progress */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            {uniqueSubjects.map((subject) => {
              const { completed, total } = subjectProgress[subject];
              const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div key={subject} className="bg-card p-3 rounded-lg border border-border">
                  <div className="text-xs font-medium text-muted-foreground mb-1 truncate" title={subject}>
                    {subject}
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {completed}/{total}
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                    <div
                      className="bg-accent h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <Input
              type="text"
              placeholder="Search subjects or dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              aria-label="Search lessons"
            />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-40" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All Lessons</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="notDone">Not Done</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full md:w-48" aria-label="Filter by subject">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50 max-h-80">
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompactView(!compactView)}
              className="whitespace-nowrap"
            >
              {compactView ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Compact
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Cards
                </>
              )}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="destructive" size="sm" onClick={resetProgress}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Reset Progress
            </Button>
            <Button variant="outline" size="sm" onClick={exportProgress}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Progress
            </Button>
            <Button variant="outline" size="sm" onClick={importProgress}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Progress
            </Button>
          </div>
        </header>

        {/* Schedule Grid */}
        <div className={compactView ? "space-y-2" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {filteredDays.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No lessons match your filters
            </div>
          ) : (
            filteredDays.map((day) => {
              if (!day) return null;
              const dayIsToday = isToday(day.date);

              return (
                <Card
                  key={day.dayIdx}
                  id={`day-${day.dayIdx}`}
                  ref={dayIsToday ? todayRef : null}
                  className={`
                    ${compactView ? "p-3" : "p-4"}
                    transition-all duration-300 hover:shadow-md
                    ${dayIsToday ? "ring-2 ring-primary" : ""}
                  `}
                >
                  <div className={`flex ${compactView ? "flex-row items-center" : "flex-col"} justify-between mb-3`}>
                    <div className={compactView ? "flex-1" : ""}>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {day.day}
                        </span>
                        <h3 className="font-semibold text-foreground">
                          {formatDate(day.date)}
                        </h3>
                        {dayIsToday && (
                          <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">
                            Today
                          </span>
                        )}
                      </div>
                    </div>
                    {!compactView && <div className="text-xs text-muted-foreground">{day.date}</div>}
                  </div>

                  <div className="space-y-2">
                    {day.subjects.map((subject) => {
                      const isCompleted = progress[`${day.dayIdx}-${subject.subIdx}`];
                      return (
                        <label
                          key={subject.subIdx}
                          className={`
                            flex items-center gap-3 p-2 rounded-lg border border-border cursor-pointer
                            transition-all duration-200 hover:bg-secondary/50
                            ${isCompleted ? "bg-success/10 border-success/30" : ""}
                          `}
                        >
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => toggleLesson(day.dayIdx, subject.subIdx)}
                            className="w-5 h-5 rounded border-2 border-border text-success focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
                            aria-label={`Mark ${subject.name} lesson ${subject.lesson} as ${isCompleted ? "not done" : "done"}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                              {subject.name}
                            </div>
                            <div className="text-xs text-muted-foreground">Lesson {subject.lesson}</div>
                          </div>
                          {isCompleted && (
                            <svg className="w-5 h-5 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
