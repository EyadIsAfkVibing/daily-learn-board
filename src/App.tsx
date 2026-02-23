import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProfileProvider } from "./hooks/useProfileContext";
import ProfilesPage from "./pages/ProfilesPage";
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
import CursorSystem from "./components/CursorSystem";
import { useRamadanMode } from "./hooks/useRamadanMode";

const queryClient = new QueryClient();

const AppInner = () => {
  // Keep reading Ramadan mode so theme class is applied
  useRamadanMode();

  return (
    <>
      <Toaster />
      <Sonner />
      <PremiumBackground />
      <CursorSystem />
      <BrowserRouter>
        <FloatingNav />
        <AIChatBuddy />
        <Routes>
          {/* Profile selection is the entry point */}
          <Route path="/" element={<ProfilesPage />} />
          {/* Today's Lesson (after selecting a profile) */}
          <Route path="/today" element={<TodaysLesson />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/weekly-summary" element={<WeeklySummary />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/reminders" element={<RemindersPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/focus" element={<FocusModePage />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="/ai-tips" element={<AITipsPage />} />
          <Route path="/theme-editor" element={<ThemeEditorPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProfileProvider>
          <AppInner />
        </ProfileProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
