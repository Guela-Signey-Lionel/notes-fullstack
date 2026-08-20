"use client";

import { motion } from "framer-motion";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-end justify-between gap-3 mb-5"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] dark:text-[#ECF0F1] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[#7F8C8D] dark:text-[#95a5a6] mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </motion.div>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="text-center py-12 px-4">
      {Icon && (
        <div className="mx-auto mb-3 size-12 rounded-full bg-[#ECF0F1] dark:bg-[#2a3142] flex items-center justify-center">
          <Icon className="size-6 text-[#7F8C8D] dark:text-[#95a5a6]" />
        </div>
      )}
      <p className="text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">{title}</p>
      {description && (
        <p className="text-sm text-[#7F8C8D] dark:text-[#95a5a6] mt-1 max-w-md mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}

export function Badge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: "neutral" | "teal" | "orange" | "blue" | "red" | "green";
}) {
  const styles: Record<string, string> = {
    neutral:
      "bg-[#ECF0F1] text-[#2C3E50] dark:bg-[#2a3142] dark:text-[#ECF0F1]",
    teal: "bg-[#1ABC9C]/12 text-[#16A085] dark:bg-[#1ABC9C]/20 dark:text-[#1ABC9C]",
    orange:
      "bg-[#E67E22]/12 text-[#E67E22] dark:bg-[#E67E22]/20 dark:text-[#E67E22]",
    blue: "bg-[#3498DB]/12 text-[#3498DB] dark:bg-[#3498DB]/20 dark:text-[#3498DB]",
    red: "bg-[#E74C3C]/12 text-[#E74C3C] dark:bg-[#E74C3C]/20 dark:text-[#E74C3C]",
    green:
      "bg-[#1ABC9C]/15 text-[#16A085] dark:bg-[#1ABC9C]/25 dark:text-[#1ABC9C]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
