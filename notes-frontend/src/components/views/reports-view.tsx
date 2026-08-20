"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Loader2,
  FileSpreadsheet,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader, EmptyState } from "@/components/common/ui-bits";
import { useStats, useStudents } from "@/hooks/use-api";
import { toast } from "sonner";

export function ReportsView() {
  const { data: stats, isLoading } = useStats();
  const { data: students } = useStudents();
  const [downloading, setDownloading] = useState<"excel" | null>(null);
  const [bulkPdf, setBulkPdf] = useState(false);

  async function exportExcel() {
    setDownloading("excel");
    try {
      const res = await fetch("/api/export/grades", { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export-notes-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Export Excel téléchargé");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'export");
    } finally {
      setDownloading(null);
    }
  }

  async function bulkTranscripts() {
    if (!students || students.length === 0) {
      toast.error("Aucun étudiant à exporter");
      return;
    }
    setBulkPdf(true);
    let ok = 0;
    let fail = 0;
    for (const s of students.slice(0, 30)) {
      try {
        const res = await fetch(
          `/api/students/${s.id}/transcript?semester=all`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          fail++;
          continue;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `releve-${s.matricule}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        ok++;
        // small delay to avoid browser blocking multiple downloads
        await new Promise((r) => setTimeout(r, 350));
      } catch {
        fail++;
      }
    }
    toast.success(`${ok} relevé(s) PDF téléchargé(s)${fail ? ` · ${fail} échec(s)` : ""}`);
    setBulkPdf(false);
  }

  if (isLoading || !stats) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="size-6 animate-spin text-[#7F8C8D] dark:text-[#95a5a6]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rapports & Exports"
        subtitle="Générez des relevés en masse ou exportez les notes au format Excel."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Étudiants"
          value={stats.studentCount}
          icon={Users}
          accent="teal"
        />
        <KpiCard
          title="Matières"
          value={stats.courseCount}
          icon={FileText}
          accent="blue"
        />
        <KpiCard
          title="Moyenne Générale"
          value={`${stats.overallAverage.toFixed(2)} /20`}
          icon={TrendingUp}
          accent="teal"
        />
        <KpiCard
          title="Taux de Réussite"
          value={`${stats.passingRate}%`}
          icon={Award}
          accent="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bulk PDF */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6"
        >
          <div className="size-12 rounded-full bg-[#1ABC9C]/12 flex items-center justify-center mb-4">
            <FileText className="size-6 text-[#1ABC9C]" />
          </div>
          <h3 className="text-lg font-semibold text-[#2C3E50] dark:text-[#ECF0F1] mb-1">
            Relevés PDF en masse
          </h3>
          <p className="text-sm text-[#7F8C8D] dark:text-[#95a5a6] mb-4">
            Téléchargez le relevé de notes PDF de chaque étudiant (un fichier
            par étudiant). Le navigateur peut demander l'autorisation de
            lancer plusieurs téléchargements.
          </p>
          <Button
            onClick={bulkTranscripts}
            disabled={bulkPdf || !students || students.length === 0}
            className="bg-[#1ABC9C] hover:bg-[#16A085] text-white"
          >
            {bulkPdf ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Générer {students?.length ?? 0} relevés
          </Button>
        </motion.div>

        {/* Excel export */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6"
        >
          <div className="size-12 rounded-full bg-[#3498DB]/12 flex items-center justify-center mb-4">
            <FileSpreadsheet className="size-6 text-[#3498DB]" />
          </div>
          <h3 className="text-lg font-semibold text-[#2C3E50] dark:text-[#ECF0F1] mb-1">
            Export Excel
          </h3>
          <p className="text-sm text-[#7F8C8D] dark:text-[#95a5a6] mb-4">
            Exportez toutes les notes au format <span className="font-mono">.xlsx</span>{" "}
            avec colonnes Matricule, Étudiant, Matière, Coefficient, Note,
            Mention, Enseignant.
          </p>
          <Button
            onClick={exportExcel}
            disabled={downloading === "excel"}
            className="bg-[#3498DB] hover:bg-[#2980B9] text-white"
          >
            {downloading === "excel" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Export Excel
          </Button>
        </motion.div>
      </div>

      {/* Top 10 ranking preview */}
      <div className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5">
        <h3 className="text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1] mb-3">
          Classement Top 10
        </h3>
        {stats.topStudents.length === 0 ? (
          <EmptyState title="Aucun classement disponible" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {stats.topStudents.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-2 rounded-lg border border-[#ECF0F1] dark:border-[#34495E]/60 px-3 py-2"
              >
                <span className="size-6 rounded-full bg-[#1ABC9C]/12 text-[#1ABC9C] flex items-center justify-center text-[11px] font-bold">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#2C3E50] dark:text-[#ECF0F1] truncate">
                    {s.name}
                  </p>
                  <p className="text-[10px] text-[#7F8C8D] dark:text-[#95a5a6]">{s.matricule}</p>
                </div>
                <span className="text-xs font-bold text-[#1ABC9C]">
                  {s.average.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
