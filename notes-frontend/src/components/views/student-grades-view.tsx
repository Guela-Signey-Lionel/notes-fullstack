"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Loader2,
  Award,
  GraduationCap,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge, EmptyState } from "@/components/common/ui-bits";
import type { StudentTranscript } from "@/lib/types";
import { mentionFor } from "@/lib/types";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { useStudentTranscript } from "@/hooks/use-api";

const TEAL = "#1ABC9C";
const ORANGE = "#E67E22";
const GREEN = "#2ECC71";
const BLUE = "#3498DB";
const RED = "#E74C3C";

const MENTION_META = [
  { key: "Très Bien", color: TEAL },
  { key: "Bien", color: GREEN },
  { key: "Assez Bien", color: BLUE },
  { key: "Passable", color: ORANGE },
  { key: "Insuffisant", color: RED },
];

export function StudentGradesView({
  transcript: initial,
}: {
  transcript?: StudentTranscript;
}) {
  const user = useAuthStore((s) => s.user);
  const { data: fetched, isLoading } = useStudentTranscript(
    !initial ? user?.studentId ?? null : null
  );
  const transcript = initial ?? fetched;
  const [semester, setSemester] = useState<string>("all");
  const [downloading, setDownloading] = useState(false);

  const filtered = useMemo(() => {
    if (!transcript) return [];
    if (semester === "all") return transcript.semesters;
    return transcript.semesters.filter((s) => s.semester === semester);
  }, [transcript, semester]);

  // All courses across the (filtered) semesters — for the charts
  const chartCourses = useMemo(() => {
    return filtered.flatMap((sem) =>
      sem.courses.map((c) => ({
        code: c.code,
        name: c.name,
        value: c.value,
        coefficient: c.coefficient,
        mention: c.mention,
      }))
    );
  }, [filtered]);

  // Bar chart data: one bar per course
  const barData = useMemo(
    () =>
      chartCourses.map((c) => ({
        name: c.code,
        fullName: c.name,
        note: Number(c.value.toFixed(2)),
        mention: c.mention,
      })),
    [chartCourses]
  );

  // Radar chart data: relative performance per course
  const radarData = useMemo(
    () =>
      chartCourses.map((c) => ({
        course: c.code,
        note: Number(c.value.toFixed(2)),
      })),
    [chartCourses]
  );

  // Donut data: mention counts
  const mentionCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "Très Bien": 0,
      Bien: 0,
      "Assez Bien": 0,
      Passable: 0,
      Insuffisant: 0,
    };
    for (const c of chartCourses) {
      const m = mentionFor(c.value);
      counts[m] = (counts[m] || 0) + 1;
    }
    return MENTION_META.map((m) => ({
      name: m.key,
      value: counts[m.key] || 0,
      color: m.color,
    })).filter((m) => m.value > 0);
  }, [chartCourses]);

  if (!transcript) {
    if (isLoading) {
      return (
        <div className="py-16 flex justify-center">
          <Loader2 className="size-6 animate-spin text-[#7F8C8D] dark:text-[#95a5a6]" />
        </div>
      );
    }
    return (
      <EmptyState
        title="Aucune note disponible"
        description="Vos notes apparaîtront ici une fois saisies par vos enseignants."
        icon={GraduationCap}
      />
    );
  }

  const semesters = transcript.semesters.map((s) => s.semester);
  const overall = transcript.overallAverage;
  const pct =
    overall !== null ? Math.min(100, Math.round((overall / 20) * 1000) / 10) : 0;

  async function downloadPdf() {
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      if (semester !== "all") params.set("semester", semester);
      const res = await fetch(
        `/api/students/${transcript!.student.id}/transcript?${params.toString()}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `releve-${transcript!.student.matricule}-${semester}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Relevé PDF téléchargé");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors du téléchargement");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] dark:text-[#ECF0F1] tracking-tight">
            Mes Notes
          </h1>
          <p className="text-sm text-[#7F8C8D] dark:text-[#95a5a6] mt-1">
            {transcript.promotion.name} · Année{" "}
            {transcript.promotion.academicYear}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {semesters.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={downloadPdf}
            disabled={downloading}
            className="bg-[#1ABC9C] hover:bg-[#16A085] text-white"
          >
            {downloading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Relevé PDF
          </Button>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#1ABC9C] to-[#16A085] text-white rounded-xl p-5 shadow-[0_4px_16px_rgba(26,188,156,0.25)] border border-[#16A085] flex items-center gap-4">
          <div className="size-14 rounded-full bg-white/20 flex items-center justify-center">
            <Award className="size-7" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/80">
              Moyenne générale
            </p>
            <p className="text-3xl font-bold tabular-nums leading-tight">
              {overall !== null ? overall.toFixed(2) : "—"}
              <span className="text-lg font-medium opacity-80"> /20</span>
            </p>
            <p className="text-xs text-white/90 mt-0.5">
              Mention {transcript.mention}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#252b3a] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E0E0E0] dark:border-[#34495E] flex items-center gap-4">
          <div className="size-14 rounded-full bg-[#1ABC9C]/12 flex items-center justify-center">
            <GraduationCap className="size-7 text-[#1ABC9C]" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#7F8C8D] dark:text-[#95a5a6]">
              Crédits validés
            </p>
            <p className="text-2xl font-bold text-[#2C3E50] dark:text-[#ECF0F1] tabular-nums">
              {transcript.validatedCredits} / {transcript.totalCredits}
            </p>
            <p className="text-xs text-[#7F8C8D] dark:text-[#95a5a6] mt-0.5">
              ECTS
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#252b3a] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E0E0E0] dark:border-[#34495E] flex flex-col justify-center">
          <p className="text-[11px] uppercase tracking-wider text-[#7F8C8D] dark:text-[#95a5a6] mb-2">
            Progression
          </p>
          <div className="relative h-16 w-16 mx-auto">
            <svg className="size-16 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#ECF0F1"
                strokeWidth="3.5"
              />
              <motion.circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#1ABC9C"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={`${pct} 100`}
                pathLength={100}
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: `${pct} 100` }}
                transition={{ duration: 0.8 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-[#2C3E50] dark:text-[#ECF0F1]">
                {pct.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts row: bar + donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-[#1ABC9C]" />
              <h3 className="text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
                Mes Notes par Matière
              </h3>
            </div>
            <span className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6] uppercase font-medium tracking-wide">
              /20
            </span>
          </div>
          <div className="h-[250px]">
            {barData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-[#7F8C8D] dark:text-[#95a5a6]">
                Aucune note pour ce semestre.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 5, right: 10, bottom: 5, left: -20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ECF0F1"
                    className="dark:stroke-[#34495E]"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#7F8C8D", fontSize: 10 }}
                    stroke="#ECF0F1"
                    className="dark:stroke-[#34495E]"
                    angle={-30}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    domain={[0, 20]}
                    tick={{ fill: "#7F8C8D", fontSize: 11 }}
                    stroke="#ECF0F1"
                    className="dark:stroke-[#34495E]"
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(26,188,156,0.08)" }}
                    formatter={(value: any, _name: any, props: any) => [
                      `${value} /20`,
                      props.payload.fullName,
                    ]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E0E0E0",
                      background: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      fontSize: 12,
                    }}
                  />
                  <ReferenceLine
                    y={10}
                    stroke="#E67E22"
                    strokeDasharray="4 4"
                    label={{
                      value: "Seuil 10",
                      position: "insideTopRight",
                      fill: "#E67E22",
                      fontSize: 10,
                    }}
                  />
                  <Bar dataKey="note" radius={[6, 6, 0, 0]} barSize={28}>
                    {barData.map((b, i) => (
                      <Cell
                        key={i}
                        fill={b.note >= 10 ? TEAL : ORANGE}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Donut chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PieChartIcon className="size-4 text-[#1ABC9C]" />
              <h3 className="text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
                Répartition par Mention
              </h3>
            </div>
            <span className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6] uppercase font-medium tracking-wide">
              {chartCourses.length} notes
            </span>
          </div>
          <div className="relative h-[250px]">
            {mentionCounts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-[#7F8C8D] dark:text-[#95a5a6]">
                Aucune note pour ce semestre.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mentionCounts}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {mentionCounts.map((m) => (
                        <Cell key={m.name} fill={m.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `${value} note(s)`,
                        name as string,
                      ]}
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #E0E0E0",
                        background: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(v: string) => (
                        <span className="text-xs text-[#2C3E50] dark:text-[#ECF0F1]">
                          {v}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-6">
                  <span className="text-2xl font-bold text-[#2C3E50] dark:text-[#ECF0F1]">
                    {overall !== null ? overall.toFixed(2) : "—"}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-[#7F8C8D] dark:text-[#95a5a6]">
                    Moyenne
                  </span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Radar chart: Profil Académique (full width) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-[#1ABC9C]" />
            <h3 className="text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
              Profil Académique
            </h3>
          </div>
          <span className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6] uppercase font-medium tracking-wide">
            Performance relative
          </span>
        </div>
        <div className="h-[300px]">
          {radarData.length < 3 ? (
            <div className="h-full flex items-center justify-center text-sm text-[#7F8C8D] dark:text-[#95a5a6] text-center px-6">
              Le profil académique nécessite au moins 3 matières.{" "}
              {radarData.length === 0
                ? "Aucune note pour ce semestre."
                : `Vous avez ${radarData.length} matière(s) pour ce semestre.`}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                data={radarData}
                outerRadius="75%"
                cx="50%"
                cy="50%"
              >
                <PolarGrid stroke="#ECF0F1" className="dark:stroke-[#34495E]" />
                <PolarAngleAxis
                  dataKey="course"
                  tick={{ fill: "#7F8C8D", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  domain={[0, 20]}
                  tick={{ fill: "#7F8C8D", fontSize: 10 }}
                  stroke="#ECF0F1"
                  className="dark:stroke-[#34495E]"
                  angle={90}
                />
                <Radar
                  dataKey="note"
                  stroke={TEAL}
                  fill={TEAL}
                  fillOpacity={0.4}
                  strokeWidth={2}
                  dot={{ r: 3, fill: TEAL }}
                />
                <Tooltip
                  formatter={(value: any) => [`${value} /20`, "Note"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #E0E0E0",
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    fontSize: 12,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Tables per semester */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Aucune note disponible"
          description="Vos notes apparaîtront ici une fois saisies par vos enseignants."
          icon={GraduationCap}
        />
      ) : (
        filtered.map((sem, i) => (
          <motion.div
            key={sem.semester}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-[#F5F7FA] dark:bg-[#1f2330] border-b border-[#ECF0F1] dark:border-[#34495E]">
              <h3 className="text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
                Semestre {sem.semester}
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[#7F8C8D] dark:text-[#95a5a6]">
                  Moyenne:{" "}
                  <span className="font-bold text-[#1ABC9C]">
                    {sem.average !== null ? sem.average.toFixed(2) : "—"} /20
                  </span>
                </span>
                <span className="text-[#7F8C8D] dark:text-[#95a5a6]">
                  Crédits:{" "}
                  <span className="font-bold text-[#2C3E50] dark:text-[#ECF0F1]">
                    {sem.validatedCredits}/{sem.totalCredits}
                  </span>
                </span>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Code</TableHead>
                  <TableHead>Matière</TableHead>
                  <TableHead className="text-center">Coef.</TableHead>
                  <TableHead className="text-center">Crédits</TableHead>
                  <TableHead className="text-center">Note /20</TableHead>
                  <TableHead className="text-center">Mention</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Commentaire
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sem.courses.map((c) => (
                  <TableRow
                    key={c.id}
                    className="hover:bg-[#F5F7FA]/60 dark:hover:bg-white/5"
                  >
                    <TableCell className="font-mono text-xs text-[#1ABC9C] font-semibold">
                      {c.code}
                    </TableCell>
                    <TableCell className="font-medium text-[#2C3E50] dark:text-[#ECF0F1]">
                      {c.name}
                      {c.teacherName && (
                        <span className="block text-xs text-[#7F8C8D] dark:text-[#95a5a6] font-normal">
                          {c.teacherName}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm text-[#7F8C8D] dark:text-[#95a5a6]">
                      {c.coefficient}
                    </TableCell>
                    <TableCell className="text-center text-sm text-[#7F8C8D] dark:text-[#95a5a6]">
                      {c.credits}
                    </TableCell>
                    <TableCell className="text-center text-sm font-bold text-[#2C3E50] dark:text-[#ECF0F1]">
                      {c.value.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          c.value < 10
                            ? "red"
                            : c.value >= 14
                            ? "teal"
                            : "neutral"
                        }
                      >
                        {c.mention}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-[#7F8C8D] dark:text-[#95a5a6]">
                      {c.comment || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        ))
      )}
    </div>
  );
}
