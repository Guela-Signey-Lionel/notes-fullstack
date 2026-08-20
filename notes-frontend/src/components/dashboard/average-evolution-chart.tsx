"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useStats } from "@/hooks/use-api";

export function AverageEvolutionChart() {
  const { data, isLoading } = useStats();
  if (isLoading || !data) {
    return (
      <div className="bg-white dark:bg-[#252b3a] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E0E0E0] dark:border-[#34495E] flex items-center justify-center h-[300px]">
        <Loader2 className="size-5 animate-spin text-[#7F8C8D] dark:text-[#95a5a6]" />
      </div>
    );
  }
  const rows = data.monthlyEvolution;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="bg-white dark:bg-[#252b3a] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E0E0E0] dark:border-[#34495E]"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
            Évolution des Moyennes
          </h3>
          <p className="text-xs text-[#7F8C8D] dark:text-[#95a5a6] mt-0.5">
            Moyenne mensuelle de la promotion · Année 2024-2025
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-[#2C3E50] dark:text-[#ECF0F1]">
            <span className="size-3 rounded-sm bg-[#1ABC9C]" />
            Promotion
          </span>
          <span className="flex items-center gap-1.5 text-[#2C3E50] dark:text-[#ECF0F1]">
            <span className="size-3 rounded-sm bg-[#E67E22]" />
            Objectif
          </span>
        </div>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 10, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="g-promo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1ABC9C" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#1ABC9C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ECF0F1" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#7F8C8D" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 20]}
              tick={{ fontSize: 11, fill: "#7F8C8D" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E0E0E0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                fontSize: 12,
              }}
              formatter={(value: any, name: any) => [
                `${Number(value).toFixed(2)} / 20`,
                name === "promotion" ? "Promotion" : "Objectif",
              ]}
            />
            <Area
              type="monotone"
              dataKey="promotion"
              stroke="#1ABC9C"
              strokeWidth={2.5}
              fill="url(#g-promo)"
              dot={{ r: 3, fill: "#1ABC9C", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#E67E22"
              strokeWidth={2}
              strokeDasharray="6 4"
              fill="transparent"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
