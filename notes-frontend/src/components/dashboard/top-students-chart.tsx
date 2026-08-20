"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useStats } from "@/hooks/use-api";

export function TopStudentsChart() {
  const { data, isLoading } = useStats();
  if (isLoading || !data) {
    return (
      <div className="bg-white dark:bg-[#252b3a] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E0E0E0] dark:border-[#34495E] flex items-center justify-center h-[280px]">
        <Loader2 className="size-5 animate-spin text-[#7F8C8D] dark:text-[#95a5a6]" />
      </div>
    );
  }
  const top = data.topStudents.slice(0, 10);
  const max = 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white dark:bg-[#252b3a] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E0E0E0] dark:border-[#34495E] h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
          Top 10 Étudiants
        </h3>
        <span className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6] uppercase font-medium tracking-wide">
          Moyenne /20
        </span>
      </div>
      <div className="flex-1 space-y-2.5 max-h-[220px] overflow-y-auto scrollbar-thin pr-2">
        {top.length === 0 ? (
          <p className="text-sm text-[#7F8C8D] dark:text-[#95a5a6] text-center py-8">
            Aucune donnée disponible
          </p>
        ) : (
          top.map((s, i) => {
            const pct = Math.min(100, s.percentage);
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.04 }}
                className="flex items-center gap-3"
              >
                <span
                  className={`size-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    i === 0
                      ? "bg-[#F39C12] text-white"
                      : i === 1
                      ? "bg-[#7F8C8D] text-white"
                      : i === 2
                      ? "bg-[#E67E22] text-white"
                      : "bg-[#ECF0F1] text-[#2C3E50] dark:bg-[#2a3142] dark:text-[#ECF0F1]"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#2C3E50] dark:text-[#ECF0F1] truncate mb-1">
                    {s.name}
                  </p>
                  <div className="h-2 rounded-full bg-[#ECF0F1] dark:bg-[#2a3142] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.04 }}
                      className="h-full rounded-full bg-[#1ABC9C]"
                    />
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#2C3E50] dark:text-[#ECF0F1] tabular-nums w-12 text-right">
                  {s.average.toFixed(2)}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
