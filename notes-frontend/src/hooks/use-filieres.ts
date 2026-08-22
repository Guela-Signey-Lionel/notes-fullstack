"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

export interface FiliereRow {
  id: string;
  name: string;
  code: string;
  level: string;
  duration: number;
  active: boolean;
}

export function useFilieres() {
  const user = useAuthStore((s) => s.user);
  return useQuery<FiliereRow[]>({
    queryKey: ["filieres"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("/api/filieres", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Erreur filières");
      return res.json();
    },
  });
}

export function useCreateFiliere() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; code: string; level: string; duration: number }) => {
      const res = await fetch("/api/filieres", {
        credentials: "same-origin",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["filieres"] });
      toast.success("Filière créée");
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });
}
