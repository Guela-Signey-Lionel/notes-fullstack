"use client";

import { create } from "zustand";

export type ViewKey =
  | "dashboard"
  | "students"
  | "teachers"
  | "courses"
  | "grades-entry"
  | "my-grades"
  | "promotions"
  | "reports"
  | "settings";

interface UIState {
  activeView: ViewKey;
  sidebarOpen: boolean;
  searchQuery: string;
  setView: (v: ViewKey) => void;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  setSearch: (q: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeView: "dashboard",
  sidebarOpen: false,
  searchQuery: "",
  setView: (activeView) => set({ activeView, sidebarOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (sidebarOpen) => set({ sidebarOpen }),
  setSearch: (searchQuery) => set({ searchQuery }),
}));
