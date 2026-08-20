"use client";

import { create } from "zustand";
import type { SafeUser } from "@/lib/types";

interface AuthState {
  user: SafeUser | null;
  loading: boolean;
  setUser: (u: SafeUser | null) => void;
  setLoading: (b: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },
}));
