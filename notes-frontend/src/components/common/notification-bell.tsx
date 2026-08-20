"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@/lib/types";

const TYPE_STYLES: Record<
  AppNotification["type"],
  { border: string; bg: string; icon: typeof Info; color: string }
> = {
  info: {
    border: "border-l-[#3498DB]",
    bg: "bg-[#3498DB]/10",
    icon: Info,
    color: "text-[#3498DB]",
  },
  success: {
    border: "border-l-[#1ABC9C]",
    bg: "bg-[#1ABC9C]/10",
    icon: CheckCircle2,
    color: "text-[#1ABC9C]",
  },
  warning: {
    border: "border-l-[#E67E22]",
    bg: "bg-[#E67E22]/10",
    icon: AlertCircle,
    color: "text-[#E67E22]",
  },
};

export function NotificationBell() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery<AppNotification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur notifications");
      const d = await res.json();
      return d.notifications as AppNotification[];
    },
  });

  // Track IDs of notifications that should be hidden from the list
  // (either because they were marked as read individually, or marked all).
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  // Visible notifications = data minus hidden IDs
  const visible = useMemo(
    () => (data ?? []).filter((n) => !hiddenIds.has(n.id)),
    [data, hiddenIds]
  );

  // Unread count = visible + not-yet-read items
  const unreadCount = visible.filter((n) => !n.read).length;

  function markOneRead(id: string) {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    // also mark as read in cache so the bell never resurrects it
    qc.setQueryData(["notifications"], (old: AppNotification[] | undefined) =>
      (old ?? []).map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAll() {
    if (!data) return;
    const next = new Set(hiddenIds);
    for (const n of data) next.add(n.id);
    setHiddenIds(next);
    qc.setQueryData(["notifications"], (old: AppNotification[] | undefined) =>
      (old ?? []).map((n) => ({ ...n, read: true }))
    );
    toast.success("Toutes les notifications marquées comme lues");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative size-9 rounded-md hover:bg-[#F5F7FA] dark:hover:bg-white/10 flex items-center justify-center transition-colors"
          aria-label={`Notifications${
            unreadCount > 0 ? ` (${unreadCount} non lues)` : ""
          }`}
        >
          <Bell className="size-5 text-[#2C3E50] dark:text-[#ECF0F1]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-[#E74C3C] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#252b3a]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 bg-white dark:bg-[#252b3a] border-[#E0E0E0] dark:border-[#34495E] mr-2 lg:mr-0"
      >
        <div className="px-4 py-3 border-b border-[#ECF0F1] dark:border-[#34495E] flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
              Notifications
            </p>
            <p className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6]">
              {unreadCount > 0
                ? `${unreadCount} non lue(s)`
                : "Tout est à jour"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={markAll}
              className="h-7 text-[#1ABC9C] hover:bg-[#1ABC9C]/10 text-xs gap-1.5"
            >
              <CheckCheck className="size-3.5" />
              Tout lire
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="size-5 animate-spin text-[#7F8C8D] dark:text-[#95a5a6]" />
            </div>
          ) : visible.length === 0 ? (
            <div className="py-12 px-4 text-center flex flex-col items-center gap-2">
              <CheckCircle2 className="size-8 text-[#1ABC9C]" />
              <p className="text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
                Tout est à jour
              </p>
              <p className="text-xs text-[#7F8C8D] dark:text-[#95a5a6]">
                Aucune notification non lue.
              </p>
            </div>
          ) : (
            visible.map((n) => {
              const s = TYPE_STYLES[n.type];
              const Icon = s.icon;
              return (
                <div
                  key={n.id}
                  className={`group flex gap-3 px-4 py-3 border-b border-[#ECF0F1] dark:border-[#34495E]/60 last:border-0 border-l-4 ${s.border} ${s.bg} hover:bg-white/60 dark:hover:bg-white/5 transition-colors`}
                >
                  <Icon className={`size-4 shrink-0 mt-0.5 ${s.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#2C3E50] dark:text-[#ECF0F1]">
                      {n.title}
                    </p>
                    <p className="text-xs text-[#7F8C8D] dark:text-[#95a5a6] mt-0.5">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-[#7F8C8D] dark:text-[#95a5a6] mt-1">
                      {n.time}
                    </p>
                  </div>
                  {!n.read && (
                    <span
                      className="size-2 rounded-full bg-[#E74C3C] shrink-0 mt-1.5"
                      aria-hidden
                    />
                  )}
                  <button
                    onClick={() => markOneRead(n.id)}
                    className="shrink-0 size-5 rounded-md hover:bg-[#2C3E50]/10 dark:hover:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Marquer comme lu"
                    title="Marquer comme lu"
                  >
                    <X className="size-3.5 text-[#7F8C8D] dark:text-[#95a5a6]" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
