"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useStats } from "@/hooks/use-api";

const TEAL = "#1ABC9C";
const ORANGE = "#E67E22";

export function GradesDonutChart() {
  const { data, isLoading } = useStats();
  if (isLoading || !data) {
    return (
      <div className="bg-white dark:bg-[#252b3a] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E0E0E0] dark:border-[#34495E] flex items-center justify-center h-[280px]">
        <Loader2 className="size-5 animate-spin text-[#7F8C8D] dark:text-[#95a5a6]" />
      </div>
    );
  }
  const passing = data.gradeDistribution.passing;
  const failing = data.gradeDistribution.failing;
  const total = data.gradeDistribution.total || 1;
  const passPct = Math.round((passing / total) * 1000) / 10;
  const rows = [
    { name: "Notes ≥ 10", value: passing, color: TEAL },
    { name: "Notes < 10", value: failing, color: ORANGE },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white dark:bg-[#252b3a] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E0E0E0] dark:border-[#34495E] h-full"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
          Répartition des Notes
        </h3>
        <span className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6] uppercase font-medium tracking-wide">
          {total} au total
        </span>
      </div>
      <div className="relative h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
            >
              {rows.map((r) => (
                <Cell key={r.name} fill={r.color} />
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
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-[#2C3E50] dark:text-[#ECF0F1]">{passPct}%</span>
          <span className="text-[10px] uppercase tracking-wide text-[#7F8C8D] dark:text-[#95a5a6]">
            Réussite
          </span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 mt-3">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-2">
            <span
              className="size-3 rounded-sm"
              style={{ backgroundColor: r.color }}
            />
            <span className="text-xs text-[#2C3E50] dark:text-[#ECF0F1] font-medium">
              {r.name}
            </span>
            <span className="text-xs text-[#7F8C8D] dark:text-[#95a5a6]">({r.value})</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
