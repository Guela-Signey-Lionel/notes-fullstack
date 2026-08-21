"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";

export function LoginForm() {
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Connexion impossible");
        return;
      }
      setUser(data.user);
      toast.success(`Bienvenue, ${data.user.name} !`);
      router.refresh();
    } catch (err) {
      toast.error("Erreur réseau, réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <div className="bg-white dark:bg-[#252b3a] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[#E0E0E0] dark:border-[#34495E] overflow-hidden w-full">
        {/* Mobile-only compact header (small logo + title) */}
        <div className="sm:hidden bg-[#2C3E50] px-6 py-5 text-white text-center">
          <div className="mx-auto mb-2 size-10 rounded-full bg-[#1ABC9C] flex items-center justify-center">
            <ShieldCheck className="size-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Gestion des Notes</h1>
          <p className="text-[#ECF0F1] text-xs mt-0.5">
            Université Numérique du Mali
          </p>
        </div>

        {/* Desktop header */}
        <div className="hidden sm:block bg-[#2C3E50] px-8 py-6 text-center">
          <div className="mx-auto mb-3 size-12 rounded-full bg-[#1ABC9C] flex items-center justify-center shadow-lg">
            <ShieldCheck className="size-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Gestion des Notes</h1>
          <p className="text-[#ECF0F1]/80 text-xs mt-1">Système de gestion académique</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8 sm:py-10 space-y-6">
          <div className="sm:hidden mb-2">
            <h2 className="text-2xl font-bold text-[#2C3E50] dark:text-[#ECF0F1] tracking-tight">
              Connexion
            </h2>
            <p className="text-sm text-[#7F8C8D] dark:text-[#95a5a6] mt-1">
              Connectez-vous à votre espace.
            </p>
          </div>
          <div className="hidden sm:block">
            <h2 className="text-2xl font-bold text-[#2C3E50] dark:text-[#ECF0F1] tracking-tight">
              Connexion
            </h2>
            <p className="text-sm text-[#7F8C8D] dark:text-[#95a5a6] mt-1.5">
              Entrez vos identifiants pour accéder à votre espace.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#2C3E50] dark:text-[#ECF0F1] text-sm font-medium">
              Adresse email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D] dark:text-[#95a5a6]" />
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="exemple@univ.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-white dark:bg-[#1f2330] border-[#E0E0E0] dark:border-[#34495E] text-[#2C3E50] dark:text-[#ECF0F1] placeholder:text-[#7F8C8D] dark:placeholder:text-[#95a5a6] focus-visible:border-[#1ABC9C] focus-visible:ring-[#1ABC9C]/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#2C3E50] dark:text-[#ECF0F1] text-sm font-medium">
              Mot de passe
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D] dark:text-[#95a5a6]" />
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 bg-white dark:bg-[#1f2330] border-[#E0E0E0] dark:border-[#34495E] text-[#2C3E50] dark:text-[#ECF0F1] placeholder:text-[#7F8C8D] dark:placeholder:text-[#95a5a6] focus-visible:border-[#1ABC9C] focus-visible:ring-[#1ABC9C]/20"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-[#1ABC9C] hover:bg-[#16A085] text-white h-12 text-base font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Connexion…
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>

        {/* Bottom info */}
        <div className="px-8 py-5 bg-[#F5F7FA] dark:bg-[#1f2330] border-t border-[#E0E0E0] dark:border-[#34495E]">
          <div className="flex items-center gap-2 justify-center text-xs text-[#7F8C8D] dark:text-[#95a5a6]">
            <ShieldCheck className="size-3.5 text-[#1ABC9C]" />
            <span>Connexion sécurisée · Année académique 2025-2026</span>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-[#7F8C8D] dark:text-[#95a5a6] mt-5">
        Pas encore de compte ? Contactez l&apos;administrateur.
      </p>
    </motion.div>
  );
}

