"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { useStats } from "@/hooks/use-api";

export function StatCard() {
  const { data, isLoading } = useStats();
  if (isLoading || !data) {
    return (
      <div className="bg-white dark:bg-[#252b3a] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E0E0E0] dark:border-[#34495E] flex items-center justify-center h-[280px]">
        <Loader2 className="size-5 animate-spin text-[#7F8C8D] dark:text-[#95a5a6]" />
      </div>
    );
  }
  const avg = data.overallAverage;
  const trend = avg >= 12 ? "up" : "down";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-gradient-to-br from-[#1ABC9C] to-[#16A085] rounded-xl p-6 shadow-[0_4px_16px_rgba(26,188,156,0.25)] border border-[#16A085] h-full flex flex-col justify-between text-white relative overflow-hidden"
    >
      <div className="absolute -right-6 -top-6 size-32 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-10 size-24 rounded-full bg-white/5" />
      <div className="relative">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/80">
          Moyenne Générale
        </p>
        <p className="text-xs text-white/70 mt-1">Tous étudiants confondus</p>
      </div>
      <div className="relative">
        <p className="text-5xl font-bold tabular-nums leading-none">
          {avg.toFixed(2)}
          <span className="text-2xl font-medium opacity-80"> /20</span>
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              trend === "up"
                ? "bg-white/20 text-white"
                : "bg-[#E67E22]/20 text-white"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {trend === "up" ? "Au-dessus de 12" : "Sous la moyenne"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
