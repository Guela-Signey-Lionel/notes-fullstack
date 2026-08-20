"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "teal" | "orange" | "blue";
  delay?: number;
}

const ACCENTS = {
  teal: {
    border: "#1ABC9C",
    iconBg: "rgba(26,188,156,0.12)",
    iconColor: "#1ABC9C",
  },
  orange: {
    border: "#E67E22",
    iconBg: "rgba(230,126,34,0.12)",
    iconColor: "#E67E22",
  },
  blue: {
    border: "#3498DB",
    iconBg: "rgba(52,152,219,0.12)",
    iconColor: "#3498DB",
  },
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
  delay = 0,
}: KpiCardProps) {
  const a = ACCENTS[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white dark:bg-[#252b3a] rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E0E0E0] dark:border-[#34495E] relative overflow-hidden"
      style={{ borderLeft: `4px solid ${a.border}` }}
    >
      <div className="flex items-center gap-4">
        <div
          className="size-11 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: a.iconBg }}
        >
          <Icon className="size-5" style={{ color: a.iconColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#7F8C8D] dark:text-[#95a5a6] truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-[#2C3E50] dark:text-[#ECF0F1] mt-0.5 leading-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[#7F8C8D] dark:text-[#95a5a6] mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
