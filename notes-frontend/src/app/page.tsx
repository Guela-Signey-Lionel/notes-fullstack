"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  FileText,
  TrendingUp,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useAuthStore } from "@/store/auth-store";

function LeftHeroPanel() {
  const features = [
    {
      icon: TrendingUp,
      label: "Suivi des résultats en temps réel",
    },
    {
      icon: Users,
      label: "Gestion multi-rôles (Étudiant, Enseignant, Admin)",
    },
    {
      icon: FileText,
      label: "Relevés de notes PDF personnalisés",
    },
    {
      icon: GraduationCap,
      label: "Statistiques et moyennes automatiques",
    },
  ];
  return (
    <div
      className="relative hidden lg:block overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url('/campus.jpg')" }}
      role="img"
      aria-label="Campus universitaire"
    >
      {/* Overlay gradient for readability */}
      <div className="absolute inset-0 bg-linear-to-br from-[#2C3E50]/95 via-[#2C3E50]/85 to-[#16A085]/75" />
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center p-12 xl:p-16 text-white">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md"
        >
          <div className="mx-auto mb-6 size-14 rounded-full bg-[#1ABC9C] flex items-center justify-center shadow-lg">
            <GraduationCap className="size-7 text-white" />
          </div>
          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight">
            Gestion des Notes Étudiantes
          </h1>
          <p className="text-[#ECF0F1] text-base xl:text-lg mt-3 opacity-90">
            Plateforme académique · Gestion de Notes pour Université
          </p>
          <div className="w-16 h-1 bg-[#1ABC9C] rounded-full mt-6" />

          <ul className="mt-8 space-y-3.5">
            {features.map((f, i) => (
              <motion.li
                key={f.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="size-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <f.icon className="size-4 text-white" />
                </div>
                <span className="text-sm xl:text-base text-white/95">
                  {f.label}
                </span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-10 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              <ShieldCheck className="size-3.5 text-[#1ABC9C]" />
              Année académique 2025-2026
            </span>
            <span className="text-xs text-white/70">v1.0 · Spécialisation</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        setUser(data.user ?? null);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setUser, setLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#E8EEF2] to-[#D4DFE6] dark:from-[#0f1419] dark:to-[#1a1f2e] flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-[#2C3E50] dark:text-[#ECF0F1]" />
          <p className="text-[#7F8C8D] dark:text-[#95a5a6] text-sm">Chargement…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid lg:grid-cols-2 min-h-screen bg-linear-to-br from-[#E8EEF2] to-[#D4DFE6] dark:from-[#0f1419] dark:to-[#1a1f2e] transition-colors">
        <LeftHeroPanel />
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16 bg-white dark:bg-[#1a1f2e]">
          <LoginForm />
        </div>
      </div>
    );
  }

  return <DashboardShell />;
}
