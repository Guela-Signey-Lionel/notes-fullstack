"use client";

import { Search, Menu, Settings } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "@/components/common/notification-bell";
import { DarkModeToggle } from "@/components/common/dark-mode-toggle";

function Dot({ color }: { color: string }) {
  return (
    <span
      className="size-3 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

export function TopHeader() {
  const user = useAuthStore((s) => s.user);
  const { toggleSidebar, searchQuery, setSearch, setView } = useUIStore();

  return (
    <header className="bg-white dark:bg-[#252b3a] border-b border-[#E0E0E0] dark:border-[#34495E] px-4 sm:px-6 h-16 flex items-center gap-3 shrink-0">
      {/* Mobile menu */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden size-9 rounded-md hover:bg-[#F5F7FA] dark:hover:bg-white/10 flex items-center justify-center"
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5 text-[#2C3E50] dark:text-[#ECF0F1]" />
      </button>

      {/* Welcome */}
      <div className="min-w-0 flex-1">
        <p className="text-base sm:text-lg font-semibold text-[#2C3E50] dark:text-[#ECF0F1] truncate">
          Bienvenue, {user?.name?.split(" ").slice(0, 2).join(" ") || "Utilisateur"} !
        </p>
      </div>

      {/* Search pill */}
      <div className="relative hidden sm:block w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D] dark:text-[#95a5a6]" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un étudiant, une matière…"
          className="pl-9 rounded-full bg-[#F5F7FA] dark:bg-[#1f2330] border-[#E0E0E0] dark:border-[#34495E] text-[#2C3E50] dark:text-[#ECF0F1] placeholder:text-[#7F8C8D] dark:placeholder:text-[#95a5a6] focus-visible:border-[#1ABC9C] focus-visible:ring-[#1ABC9C]/20 h-9"
          aria-label="Recherche"
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        <NotificationBell />
        <DarkModeToggle />
        <button
          onClick={() => setView("settings")}
          className="size-9 rounded-md hover:bg-[#F5F7FA] dark:hover:bg-white/10 flex items-center justify-center transition-colors"
          aria-label="Paramètres"
          title="Paramètres"
        >
          <Settings className="size-5 text-[#2C3E50] dark:text-[#ECF0F1]" />
        </button>
      </div>

      {/* Window controls */}
      <div className="flex items-center gap-2 pl-2 ml-1 border-l border-[#E0E0E0] dark:border-[#34495E]">
        <Dot color="#F39C12" />
        <Dot color="#1ABC9C" />
        <Dot color="#E74C3C" />
      </div>
    </header>
  );
}
