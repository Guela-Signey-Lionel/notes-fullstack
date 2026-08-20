"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AppWindow } from "@/components/layout/app-window";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { DashboardView } from "@/components/views/dashboard-view";
import { StudentsView } from "@/components/views/students-view";
import { TeachersView } from "@/components/views/teachers-view";
import { CoursesView } from "@/components/views/courses-view";
import { GradeEntryView } from "@/components/views/grade-entry-view";
import { StudentGradesView } from "@/components/views/student-grades-view";
import { PromotionsView } from "@/components/views/promotions-view";
import { ReportsView } from "@/components/views/reports-view";
import { TeacherReportsView } from "@/components/views/teacher-reports-view";
import { SettingsView } from "@/components/views/settings-view";

const VIEWS = {
  dashboard: DashboardView,
  students: StudentsView,
  teachers: TeachersView,
  courses: CoursesView,
  "grades-entry": GradeEntryView,
  "my-grades": StudentGradesView,
  promotions: PromotionsView,
  reports: ReportsView,
  settings: SettingsView,
} as const;

export function DashboardShell() {
  const activeView = useUIStore((s) => s.activeView);
  const user = useAuthStore((s) => s.user);

  // For students, route to my-grades unless the view is dashboard or settings.
  let view = activeView;
  if (user?.role === "STUDENT") {
    if (
      view === "students" ||
      view === "teachers" ||
      view === "courses" ||
      view === "grades-entry" ||
      view === "promotions" ||
      view === "reports"
    ) {
      view = "my-grades";
    }
  }

  const ViewComponent = VIEWS[view] ?? DashboardView;

  // Teachers get a dedicated reports view (filtered to their own courses)
  const useTeacherReports = view === "reports" && user?.role === "TEACHER";

  return (
    <AppWindow>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {useTeacherReports ? <TeacherReportsView /> : <ViewComponent />}
        </motion.div>
      </AnimatePresence>
    </AppWindow>
  );
}
