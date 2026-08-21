"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  FileText,
  Layers,
  BarChart3,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore, type ViewKey } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  key: ViewKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Array<"ADMIN" | "TEACHER" | "STUDENT">;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "TEACHER", "STUDENT"] },
  { key: "students", label: "Étudiants", icon: GraduationCap, roles: ["ADMIN", "TEACHER"] },
  { key: "teachers", label: "Enseignants", icon: Users, roles: ["ADMIN"] },
  { key: "courses", label: "Matières", icon: BookOpen, roles: ["ADMIN", "TEACHER"] },
  { key: "grades-entry", label: "Notes", icon: FileText, roles: ["TEACHER", "ADMIN"] },
  { key: "my-grades", label: "Mes Notes", icon: FileText, roles: ["STUDENT"] },
  { key: "promotions", label: "Promotions", icon: Layers, roles: ["ADMIN"] },
  { key: "reports", label: "Rapports", icon: BarChart3, roles: ["ADMIN", "TEACHER"] },
  { key: "settings", label: "Paramètres", icon: Settings, roles: ["ADMIN", "TEACHER", "STUDENT"] },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { activeView, setView, sidebarOpen, setSidebar } = useUIStore();

  if (!user) return null;

  const initials =
    user.name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  const roleLabel =
    user.role === "ADMIN"
      ? "Administrateur"
      : user.role === "TEACHER"
      ? "Enseignant"
      : "Étudiant";

  const items = NAV_ITEMS.filter((it) => it.roles.includes(user.role));

  return (
    <>
      <aside
        className={cn(
          "bg-[#2C3E50] text-white w-60 shrink-0 flex flex-col",
          "fixed lg:static inset-y-0 left-0 z-50 lg:z-0 transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        aria-label="Navigation principale"
      >
        {/* Profile */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-full bg-[#1ABC9C] text-white flex items-center justify-center font-semibold text-sm shrink-0 ring-2 ring-white/20 overflow-hidden">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="size-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-[#ECF0F1]/70 truncate">{roleLabel}</p>
            </div>
            <button
              onClick={() => setSidebar(false)}
              className="lg:hidden ml-auto size-7 rounded-md hover:bg-white/10 flex items-center justify-center"
              aria-label="Fermer le menu"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
          {items.map((it) => {
            const Icon = it.icon;
            const active = activeView === it.key;
            return (
              <button
                key={it.key}
                onClick={() => setView(it.key)}
                className={cn(
                  "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                  active
                    ? "bg-white text-[#2C3E50] shadow-sm"
                    : "text-[#ECF0F1] hover:bg-white/10"
                )}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-[#1ABC9C] -ml-1" />
                )}
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-[#1ABC9C]" : "text-[#ECF0F1]/70 group-hover:text-white"
                  )}
                />
                <span className="truncate">{it.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom area: logout */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Button
            onClick={async () => {
              await logout();
              window.location.reload();
            }}
            variant="ghost"
            className="w-full justify-start gap-3 text-[#ECF0F1] hover:bg-white/10 hover:text-white h-10 font-medium"
          >
            <LogOut className="size-4" />
            Déconnexion
          </Button>
        </div>
      </aside>
    </>
  );
}


