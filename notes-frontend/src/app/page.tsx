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
      className="relative hidden lg:flex overflow-hidden bg-cover bg-center bg-[#2C3E50]"
      style={{ backgroundImage: "url('/campus.jpg')" }}
      role="img"
      aria-label="Campus universitaire"
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-[#1a252f]/97 via-[#2C3E50]/90 to-[#16A085]/80" />
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#1ABC9C]/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#1ABC9C]/8 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center p-12 xl:p-16 text-white">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md"
        >
          {/* Logo & university name */}
          <div className="flex items-center gap-3 mb-8">
            <div className="size-12 rounded-xl bg-[#1ABC9C] flex items-center justify-center shadow-lg shadow-[#1ABC9C]/30">
              <GraduationCap className="size-6 text-white" />
            </div>
            <div>
              <p className="text-[#1ABC9C] text-xs font-semibold tracking-widest uppercase">
                Université Numérique
              </p>
              <p className="text-white/50 text-[11px] tracking-wide">du Mali</p>
            </div>
          </div>

          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight leading-tight">
            Gestion des Notes
            <br />
            <span className="text-[#1ABC9C]">Étudiantes</span>
          </h1>
          <p className="text-[#ECF0F1]/70 text-sm xl:text-base mt-4 leading-relaxed">
            Plateforme académique de gestion des notes pour l&apos;enseignement supérieur.
          </p>
          <div className="w-12 h-0.5 bg-[#1ABC9C] rounded-full mt-6" />

          <ul className="mt-8 space-y-4">
            {features.map((f, i) => (
              <motion.li
                key={f.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="size-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm">
                  <f.icon className="size-4 text-[#1ABC9C]" />
                </div>
                <span className="text-sm xl:text-[15px] text-white/80">
                  {f.label}
                </span>
              </motion.li>
            ))}
          </ul>

          <div className="mt-12 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="size-4 text-[#1ABC9C]" />
              <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                Année académique 2025–2026
              </span>
            </div>
            <p className="text-[11px] text-white/40 pl-6">
              Génie Logiciel · Sécurité Réseaux · Admin Réseaux · Réseaux & Télécom · Info de Gestion
            </p>
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


