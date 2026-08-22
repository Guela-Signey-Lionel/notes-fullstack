"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Loader2,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
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
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader, EmptyState, Badge } from "@/components/common/ui-bits";
import { useTeacherStats } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";

const TEAL = "#1ABC9C";
const GREEN = "#2ECC71";
const BLUE = "#3498DB";
const ORANGE = "#E67E22";
const RED = "#E74C3C";

const MENTION_DATA = [
  { key: "excellent", label: "Très Bien", color: TEAL },
  { key: "good", label: "Bien", color: GREEN },
  { key: "fairlyGood", label: "Assez Bien", color: BLUE },
  { key: "passable", label: "Passable", color: ORANGE },
  { key: "insufficient", label: "Insuffisant", color: RED },
] as const;

export function TeacherReportsView() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useTeacherStats();
  const [semesterFilter, setSemesterFilter] = useState<string>("all");

  const filteredCourses = useMemo(() => {
    if (!data) return [];
    if (semesterFilter === "all") return data.courseAverages;
    return data.courseAverages.filter((c) => c.semester === semesterFilter);
  }, [data, semesterFilter]);

  // Mention distribution filtered by semester
  const mentionData = useMemo(() => {
    if (!data) return [];
    // Filter courseAverages by semester to recompute mention counts
    const courseIds = new Set(filteredCourses.map((c) => c.id));
    // The mentionDistribution is global; we can show the global distribution
    // when "All" is selected, otherwise recompute from filtered courses' grades.
    if (semesterFilter === "all" || !data.courseAverages.length) {
      return MENTION_DATA.map((m) => ({
        name: m.label,
        value: data.mentionDistribution[m.key],
        color: m.color,
      }));
    }
    // Approximation: scale the mentionDistribution proportionally
    // We don't have per-mention-per-semester in the API, so use global for now.
    void courseIds;
    return MENTION_DATA.map((m) => ({
      name: m.label,
      value: data.mentionDistribution[m.key],
      color: m.color,
    }));
  }, [data, filteredCourses, semesterFilter]);

  if (isLoading || !data) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="size-6 animate-spin text-[#7F8C8D] dark:text-[#95a5a6]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rapports & Statistiques"
        subtitle={`Statistiques filtrées sur vos matières · ${user?.name ?? ""}`}
        actions={
          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous semestres</SelectItem>
              <SelectItem value="S1">S1</SelectItem>
              <SelectItem value="S2">S2</SelectItem>
              <SelectItem value="S3">S3</SelectItem>
              <SelectItem value="S4">S4</SelectItem>
              <SelectItem value="S5">S5</SelectItem>
              <SelectItem value="S6">S6</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Mes Matières"
          value={data.courseCount}
          subtitle="cours assignés"
          icon={BookOpen}
          accent="teal"
          delay={0}
        />
        <KpiCard
          title="Mes Étudiants"
          value={data.studentCount}
          subtitle="dans mes promotions"
          icon={Users}
          accent="blue"
          delay={0.05}
        />
        <KpiCard
          title="Moyenne de mes matières"
          value={`${data.overallAverage.toFixed(2)} /20`}
          subtitle={`${data.gradeCount} notes saisies`}
          icon={TrendingUp}
          accent="teal"
          delay={0.1}
        />
        <KpiCard
          title="Taux de réussite"
          value={`${data.passingRate}%`}
          subtitle="notes ≥ 10 /20"
          icon={Award}
          accent="orange"
          delay={0.15}
        />
      </div>

      {data.courseCount === 0 ? (
        <div className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <EmptyState
            title="Aucune matière assignée"
            description="Vous n'avez pas encore de matière assignée. Vos statistiques apparaîtront ici dès qu'une matière vous sera attribuée."
            icon={BarChart3}
          />
        </div>
      ) : (
        <>
          {/* Charts row: bar + donut */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bar chart: Moyenne par matière */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-4 text-[#1ABC9C]" />
                  <h3 className="text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
                    Moyenne par Matière
                  </h3>
                </div>
                <span className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6] uppercase font-medium tracking-wide">
                  /20
                </span>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredCourses.map((c) => ({
                      name: c.code,
                      fullName: c.name,
                      moyenne: Number(c.average.toFixed(2)),
                    }))}
                    layout="vertical"
                    margin={{ top: 5, right: 20, bottom: 5, left: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#ECF0F1"
                      className="dark:stroke-[#34495E]"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      domain={[0, 20]}
                      tick={{ fill: "#7F8C8D", fontSize: 11 }}
                      stroke="#ECF0F1"
                      className="dark:stroke-[#34495E]"
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "#7F8C8D", fontSize: 11 }}
                      stroke="#ECF0F1"
                      className="dark:stroke-[#34495E]"
                      width={80}
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
                    <Bar dataKey="moyenne" radius={[0, 6, 6, 0]} barSize={20}>
                      {filteredCourses.map((c, i) => (
                        <Cell
                          key={i}
                          fill={c.average >= 10 ? TEAL : ORANGE}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Donut chart: Répartition par mention */}
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
                  {data.gradeCount} notes
                </span>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mentionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {mentionData.map((m) => (
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
              </div>
            </motion.div>
          </div>

          {/* Table: Détail par matière et semestre */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[#ECF0F1] dark:border-[#34495E]">
              <h3 className="text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
                Détail par matière et semestre
                {semesterFilter !== "all" && (
                  <Badge variant="neutral" className="ml-2">
                    {semesterFilter}
                  </Badge>
                )}
              </h3>
              <p className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6] mt-0.5">
                Vue agrégée par matière — coefficient, nombre d'étudiants,
                moyenne et taux de réussite.
              </p>
            </div>
            {filteredCourses.length === 0 ? (
              <EmptyState
                title="Aucune matière pour ce semestre"
                description="Essayez un autre filtre de semestre."
                icon={BookOpen}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F7FA] dark:bg-[#1f2330] hover:bg-[#F5F7FA] dark:hover:bg-[#1f2330]">
                    <TableHead className="w-24">Code</TableHead>
                    <TableHead>Matière</TableHead>
                    <TableHead className="w-20">Semestre</TableHead>
                    <TableHead className="text-center w-20">Coef.</TableHead>
                    <TableHead className="text-center w-24">Étudiants</TableHead>
                    <TableHead className="text-center w-24">Moyenne</TableHead>
                    <TableHead className="text-center w-24">Réussite</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((c) => (
                    <TableRow
                      key={c.id}
                      className="hover:bg-[#F5F7FA]/60 dark:hover:bg-white/5"
                    >
                      <TableCell className="font-mono text-xs text-[#1ABC9C] font-semibold">
                        {c.code}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm text-[#2C3E50] dark:text-[#ECF0F1]">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6]">
                          {c.promotionName}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="neutral">{c.semester}</Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-[#7F8C8D] dark:text-[#95a5a6]">
                        {c.coefficient}
                      </TableCell>
                      <TableCell className="text-center text-sm text-[#2C3E50] dark:text-[#ECF0F1]">
                        {c.studentCount}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`text-sm font-bold ${
                            c.average >= 10
                              ? "text-[#1ABC9C] dark:text-[#1ABC9C]"
                              : "text-[#E67E22]"
                          }`}
                        >
                          {c.average.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
                        {c.passingRate}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
