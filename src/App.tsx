import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TodaysLesson from "./pages/TodaysLesson";
import Statistics from "./pages/Statistics";
import WeeklySummary from "./pages/WeeklySummary";
import NotesPage from "./pages/NotesPage";
import AchievementsPage from "./pages/AchievementsPage";
import CalendarPage from "./pages/CalendarPage";
import RemindersPage from "./pages/RemindersPage";
import NotFound from "./pages/NotFound";
import FloatingNav from "./components/FloatingNav";
import ResourcesPage from "./pages/ResourcesPage";
import FocusModePage from "./pages/FocusModePage";
import ThemesPage from "./pages/ThemesPage";
import AITipsPage from "./pages/AITipsPage";
import PremiumBackground from "./components/PremiumBackground";
import AIChatBuddy from "./components/AIChatBuddy";
import ThemeEditorPage from "./pages/ThemeEditorPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PremiumBackground />
        <BrowserRouter>
          {/* Floating Navigation - Shows on all pages */}
          <FloatingNav />
          <AIChatBuddy />

          <Routes>
            {/* Today's Lesson is the default route */}
            <Route path="/" element={<TodaysLesson />} />

            {/* Dashboard route */}
            <Route path="/dashboard" element={<Index />} />

            {/* Statistics route */}
            <Route path="/statistics" element={<Statistics />} />

            {/* Weekly Summary */}
            <Route path="/weekly-summary" element={<WeeklySummary />} />

            {/* Notes Manager */}
            <Route path="/notes" element={<NotesPage />} />

            {/* Achievements */}
            <Route path="/achievements" element={<AchievementsPage />} />

            {/* Calendar */}
            <Route path="/calendar" element={<CalendarPage />} />

            {/* Reminders */}
            <Route path="/reminders" element={<RemindersPage />} />

            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />

            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/focus" element={<FocusModePage />} />
            <Route path="/themes" element={<ThemesPage />} />
            <Route path="/ai-tips" element={<AITipsPage />} />
            <Route path="/theme-editor" element={<ThemeEditorPage />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;