"use client";

import {
  GraduationCap,
  FileText,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { useStats } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StatCard } from "@/components/dashboard/stat-card";
import { GradesDonutChart } from "@/components/dashboard/grades-donut-chart";
import { TopStudentsChart } from "@/components/dashboard/top-students-chart";
import { AverageEvolutionChart } from "@/components/dashboard/average-evolution-chart";
import { motion } from "framer-motion";
import { useStudentTranscript } from "@/hooks/use-api";
import { StudentGradesView } from "./student-grades-view";
import { Loader2 } from "lucide-react";

function AdminDashboard() {
  const { data, isLoading } = useStats();
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] dark:text-[#ECF0F1] tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-sm text-[#7F8C8D] dark:text-[#95a5a6] mt-1">
            Vue d'ensemble académique · Année 2024-2025
          </p>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#252b3a] rounded-xl p-5 h-[112px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E0E0E0] dark:border-[#34495E] animate-pulse"
            />
          ))
        ) : (
          <>
            <KpiCard
              title="Total Étudiants"
              value={data.studentCount}
              icon={GraduationCap}
              accent="teal"
              delay={0}
            />
            <KpiCard
              title="Notes Saisies"
              value={data.gradeCount}
              icon={FileText}
              accent="teal"
              delay={0.05}
            />
            <KpiCard
              title="Moyenne Générale"
              value={`${data.overallAverage.toFixed(2)} /20`}
              icon={TrendingUp}
              accent="teal"
              delay={0.1}
            />
            <KpiCard
              title="Étudiants en Échec"
              value={data.failingStudentCount}
              subtitle={`${data.passingRate}% de réussite`}
              icon={AlertTriangle}
              accent="orange"
              delay={0.15}
            />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-1">
          <StatCard />
        </div>
        <div className="lg:col-span-2">
          <GradesDonutChart />
        </div>
        <div className="lg:col-span-2">
          <TopStudentsChart />
        </div>
      </div>

      {/* Bottom row */}
      <AverageEvolutionChart />
    </div>
  );
}

function StudentDashboard() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useStudentTranscript(user?.studentId ?? null);
  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-[#7F8C8D] dark:text-[#95a5a6]" />
      </div>
    );
  }
  return <StudentGradesView transcript={data} />;
}

export function DashboardView() {
  const user = useAuthStore((s) => s.user);
  if (user?.role === "STUDENT") {
    return <StudentDashboard />;
  }
  return <AdminDashboard />;
}
