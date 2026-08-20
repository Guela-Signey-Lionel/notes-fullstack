"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  Upload,
  Trash2,
  Loader2,
  Lock,
  Save,
  Mail,
  Phone,
  CalendarDays,
  Shield,
  Palette,
  Languages,
  Bell,
  Check,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/common/ui-bits";
import { useAuthStore } from "@/store/auth-store";

const profileSchema = z.object({
  name: z.string().min(2, "Nom trop court"),
  phone: z.string().max(30).optional().or(z.literal("")),
  bio: z.string().max(500, "Bio trop longue (500 max)").optional().or(z.literal("")),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Requis"),
    newPassword: z.string().min(6, "6 caractères min"),
    confirmPassword: z.string().min(6, "6 caractères min"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

function roleLabel(role: string) {
  return role === "ADMIN"
    ? "Administrateur"
    : role === "TEACHER"
    ? "Enseignant"
    : "Étudiant";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function SettingsView() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);

  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    bio: user?.bio ?? "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name ?? "",
        phone: user.phone ?? "",
        bio: user.bio ?? "",
      });
    }
  }, [user]);

  if (!user) return null;

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez choisir une image (JPG, PNG)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image trop lourde (2 Mo max)");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const res = await fetch("/api/auth/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileImage: base64 }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Erreur");
          // Use the response user directly (photo included) and refresh from server
          setUser(data.user ?? null);
          // Then re-fetch from server to keep store in sync
          const meRes = await fetch("/api/auth/me", { cache: "no-store" });
          const meData = await meRes.json();
          if (meData.user) setUser(meData.user);
          toast.success("Photo de profil mise à jour");
        } catch (e: any) {
          toast.error(e.message || "Erreur lors du téléversement");
        } finally {
          setUploading(false);
        }
      };
      reader.onerror = () => {
        setUploading(false);
        toast.error("Lecture du fichier impossible");
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      setUploading(false);
      toast.error(e.message || "Erreur");
    }
  }

  async function removePhoto() {
    setUploading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileImage: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setUser(data.user ?? null);
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      const meData = await meRes.json();
      if (meData.user) setUser(meData.user);
      toast.success("Photo supprimée");
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setUploading(false);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = profileSchema.safeParse(profile);
    if (!parsed.success) {
      const m: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as string;
        m[k] = i.message;
      });
      setErrors(m);
      return;
    }
    setProfileSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parsed.data.name,
          phone: parsed.data.phone || null,
          bio: parsed.data.bio || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      const meData = await meRes.json();
      setUser(meData.user ?? data.user ?? null);
      toast.success("Profil mis à jour");
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setProfileSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = passwordSchema.safeParse(passwords);
    if (!parsed.success) {
      const m: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const k = i.path[0] as string;
        m[k] = i.message;
      });
      setErrors(m);
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: parsed.data.currentPassword,
          newPassword: parsed.data.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Mot de passe modifié avec succès");
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] dark:text-[#ECF0F1] tracking-tight">
            Paramètres
          </h1>
          <p className="text-sm text-[#7F8C8D] dark:text-[#95a5a6] mt-1">
            Gérez votre profil, votre photo et vos préférences.
          </p>
        </div>
      </motion.div>

      {/* Profile photo */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-6 flex flex-col sm:flex-row items-center gap-6"
      >
        <div className="size-32 sm:size-36 rounded-full overflow-hidden bg-gradient-to-br from-[#1ABC9C] to-[#16A085] flex items-center justify-center text-white text-4xl font-bold shrink-0 ring-4 ring-white/40 dark:ring-[#252b3a]/40">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt="Photo de profil"
              className="size-full object-cover"
            />
          ) : (
            initials(user.name)
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
            {user.name}
          </h3>
          <p className="text-sm text-[#7F8C8D] dark:text-[#95a5a6]">{user.email}</p>
          <div className="mt-1">
            <Badge variant="teal">{roleLabel(user.role)}</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="bg-[#1ABC9C] hover:bg-[#16A085] text-white"
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Changer la photo
            </Button>
            {user.profileImage && (
              <Button
                type="button"
                variant="outline"
                onClick={removePhoto}
                disabled={uploading}
                className="text-[#E74C3C] border-[#E74C3C]/40 hover:bg-[#E74C3C]/10"
              >
                <Trash2 className="size-4" />
                Supprimer
              </Button>
            )}
          </div>
          <p className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6] mt-2">
            JPG ou PNG, 2 Mo maximum.
          </p>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal info */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
        >
          <div className="px-6 py-4 border-b border-[#ECF0F1] dark:border-[#34495E] flex items-center gap-2">
            <UserIcon className="size-4 text-[#1ABC9C]" />
            <h3 className="font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
              Informations personnelles
            </h3>
          </div>
          <form onSubmit={saveProfile} className="p-6 space-y-4">
            <div>
              <Label htmlFor="name" className="text-xs font-medium text-[#7F8C8D] dark:text-[#95a5a6]">
                Nom complet *
              </Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className="mt-1"
              />
              {errors.name && (
                <p className="text-xs text-[#E74C3C] mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email" className="text-xs font-medium text-[#7F8C8D] dark:text-[#95a5a6]">
                Email
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D] dark:text-[#95a5a6]" />
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="pl-9 bg-[#F5F7FA] dark:bg-[#1f2330] text-[#7F8C8D] dark:text-[#95a5a6] cursor-not-allowed"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-[#95a5a6]" />
              </div>
              <p className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6] mt-1">
                L'email ne peut pas être modifié.
              </p>
            </div>
            <div>
              <Label htmlFor="phone" className="text-xs font-medium text-[#7F8C8D] dark:text-[#95a5a6]">
                Téléphone
              </Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D] dark:text-[#95a5a6]" />
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+223 7X XX XX XX"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="bio" className="text-xs font-medium text-[#7F8C8D] dark:text-[#95a5a6]">
                Bio / À propos
              </Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Quelques mots sur vous…"
                rows={3}
                maxLength={500}
                className="mt-1"
              />
              <p className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6] mt-1 text-right">
                {profile.bio?.length ?? 0} / 500
              </p>
              {errors.bio && (
                <p className="text-xs text-[#E74C3C] mt-1">{errors.bio}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#ECF0F1] dark:border-[#34495E]">
              <div>
                <Label className="text-xs font-medium text-[#7F8C8D] dark:text-[#95a5a6]">
                  Rôle
                </Label>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-[#2C3E50] dark:text-[#ECF0F1]">
                  <Shield className="size-3.5 text-[#1ABC9C]" />
                  {roleLabel(user.role)}
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-[#7F8C8D] dark:text-[#95a5a6]">
                  Inscrit le
                </Label>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-[#2C3E50] dark:text-[#ECF0F1]">
                  <CalendarDays className="size-3.5 text-[#7F8C8D] dark:text-[#95a5a6]" />
                  {formatDate(user.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={profileSaving}
                className="bg-[#1ABC9C] hover:bg-[#16A085] text-white"
              >
                {profileSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </motion.section>

        {/* Right column: security + preferences */}
        <div className="space-y-6">
          {/* Security / password */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
          >
            <div className="px-6 py-4 border-b border-[#ECF0F1] dark:border-[#34495E] flex items-center gap-2">
              <Lock className="size-4 text-[#1ABC9C]" />
              <h3 className="font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
                Sécurité du compte
              </h3>
            </div>
            <form onSubmit={changePassword} className="p-6 space-y-4">
              <div>
                <Label htmlFor="cur" className="text-xs font-medium text-[#7F8C8D] dark:text-[#95a5a6]">
                  Mot de passe actuel
                </Label>
                <Input
                  id="cur"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) =>
                    setPasswords((p) => ({ ...p, currentPassword: e.target.value }))
                  }
                  className="mt-1"
                />
                {errors.currentPassword && (
                  <p className="text-xs text-[#E74C3C] mt-1">{errors.currentPassword}</p>
                )}
              </div>
              <div>
                <Label htmlFor="new" className="text-xs font-medium text-[#7F8C8D] dark:text-[#95a5a6]">
                  Nouveau mot de passe
                </Label>
                <Input
                  id="new"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords((p) => ({ ...p, newPassword: e.target.value }))
                  }
                  className="mt-1"
                />
                {errors.newPassword && (
                  <p className="text-xs text-[#E74C3C] mt-1">{errors.newPassword}</p>
                )}
              </div>
              <div>
                <Label htmlFor="conf" className="text-xs font-medium text-[#7F8C8D] dark:text-[#95a5a6]">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="conf"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))
                  }
                  className="mt-1"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-[#E74C3C] mt-1">{errors.confirmPassword}</p>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={passwordSaving}
                  className="bg-[#1ABC9C] hover:bg-[#16A085] text-white"
                >
                  {passwordSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Lock className="size-4" />
                  )}
                  Mettre à jour
                </Button>
              </div>
            </form>
          </motion.section>

          {/* Preferences */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
          >
            <div className="px-6 py-4 border-b border-[#ECF0F1] dark:border-[#34495E] flex items-center gap-2">
              <Palette className="size-4 text-[#1ABC9C]" />
              <h3 className="font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
                Préférences
              </h3>
            </div>
            <PreferencesBody
              emailNotifs={emailNotifs}
              setEmailNotifs={setEmailNotifs}
            />
          </motion.section>
        </div>
      </div>
    </div>
  );
}

function PreferencesBody({
  emailNotifs,
  setEmailNotifs,
}: {
  emailNotifs: boolean;
  setEmailNotifs: (b: boolean) => void;
}) {
  const { theme, setTheme } = useTheme();
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-full bg-[#1ABC9C]/12 flex items-center justify-center shrink-0">
            <Palette className="size-4 text-[#1ABC9C]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#2C3E50] dark:text-[#ECF0F1]">
              Mode sombre
            </p>
            <p className="text-xs text-[#7F8C8D] dark:text-[#95a5a6]">
              Basculez entre le thème clair et sombre.
            </p>
          </div>
        </div>
        <Switch
          checked={theme === "dark"}
          onCheckedChange={(c) => setTheme(c ? "dark" : "light")}
          aria-label="Basculer le mode sombre"
        />
      </div>
      <div className="border-t border-[#ECF0F1] dark:border-[#34495E]" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-full bg-[#3498DB]/12 flex items-center justify-center shrink-0">
            <Languages className="size-4 text-[#3498DB]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#2C3E50] dark:text-[#ECF0F1]">
              Langue de l'interface
            </p>
            <p className="text-xs text-[#7F8C8D] dark:text-[#95a5a6]">
              Sélectionnez la langue d'affichage.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="teal">FR</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-[#7F8C8D] dark:text-[#95a5a6]">
            EN
            <span className="rounded-full bg-[#ECF0F1] dark:bg-[#2a3142] px-1.5 py-0.5 text-[10px] font-semibold">
              Bientôt
            </span>
          </span>
        </div>
      </div>
      <div className="border-t border-[#ECF0F1] dark:border-[#34495E]" />
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-full bg-[#E67E22]/12 flex items-center justify-center shrink-0">
            <Bell className="size-4 text-[#E67E22]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#2C3E50] dark:text-[#ECF0F1]">
              Notifications par email
            </p>
            <p className="text-xs text-[#7F8C8D] dark:text-[#95a5a6]">
              Recevez un email quand une note est publiée.
            </p>
          </div>
        </div>
        <Switch
          checked={emailNotifs}
          onCheckedChange={(c) => {
            setEmailNotifs(c);
            toast.success(
              c
                ? "Notifications email activées"
                : "Notifications email désactivées"
            );
          }}
          aria-label="Notifications email"
        />
      </div>
      <div className="border-t border-[#ECF0F1] dark:border-[#34495E]" />
      <div className="flex items-center gap-2 text-xs text-[#7F8C8D] dark:text-[#95a5a6]">
        <Check className="size-3.5 text-[#1ABC9C]" />
        Vos préférences sont enregistrées localement.
      </div>
    </div>
  );
}
