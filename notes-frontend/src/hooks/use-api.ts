"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import type {
  CourseRow,
  GradeRow,
  PromotionRow,
  Stats,
  StudentTranscript,
  StudentWithStats,
  TeacherRow,
  TeacherStats,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      return data.user;
    },
  });
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------
export function useStats() {
  const user = useAuthStore((s) => s.user);
  return useQuery<Stats>({
    queryKey: ["stats"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur stats");
      return res.json();
    },
  });
}

export function useTeacherStats() {
  return useQuery<TeacherStats>({
    queryKey: ["stats", "teacher"],
    queryFn: async () => {
      const res = await fetch("/api/stats/teacher", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur stats enseignant");
      return res.json();
    },
  });
}

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------
export function useStudents() {
  const user = useAuthStore((s) => s.user);
  return useQuery<StudentWithStats[]>({
    queryKey: ["students"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("/api/students", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur étudiants");
      return res.json();
    },
  });
}

export function useStudent(id: string | null | undefined) {
  return useQuery<StudentTranscript>({
    queryKey: ["student", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await fetch(`/api/students/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur étudiant");
      return res.json();
    },
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Étudiant créé avec succès");
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: any) => {
      const res = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Étudiant mis à jour");
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erreur");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Étudiant supprimé");
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });
}

// ---------------------------------------------------------------------------
// Teachers
// ---------------------------------------------------------------------------
export function useTeachers() {
  const user = useAuthStore((s) => s.user);
  return useQuery<TeacherRow[]>({
    queryKey: ["teachers"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("/api/teachers", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur enseignants");
      return res.json();
    },
  });
}

export function useCreateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Enseignant créé");
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: any) => {
      const res = await fetch(`/api/teachers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Enseignant mis à jour");
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });
}

export function useDeleteTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erreur");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Enseignant supprimé");
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------
export function useCourses(filters?: {
  promotionId?: string;
  semester?: string;
}) {
  const user = useAuthStore((s) => s.user);
  return useQuery<CourseRow[]>({
    queryKey: ["courses", filters],
    enabled: !!user,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.promotionId) params.set("promotionId", filters.promotionId);
      if (filters?.semester) params.set("semester", filters.semester);
      const res = await fetch(`/api/courses?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Erreur matières");
      return res.json();
    },
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Matière créée");
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });
}

export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: any) => {
      const res = await fetch(`/api/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Matière mise à jour");
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erreur");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Matière supprimée");
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });
}

// ---------------------------------------------------------------------------
// Promotions
// ---------------------------------------------------------------------------
export function usePromotions() {
  const user = useAuthStore((s) => s.user);
  return useQuery<PromotionRow[]>({
    queryKey: ["promotions"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("/api/promotions", { cache: "no-store" });
      if (!res.ok) throw new Error("Erreur promotions");
      return res.json();
    },
  });
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: any) => {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promotion créée");
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });
}

export function useUpdatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: any) => {
      const res = await fetch(`/api/promotions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promotion mise à jour");
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/promotions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erreur");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promotions"] });
      toast.success("Promotion supprimée");
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });
}

// ---------------------------------------------------------------------------
// Grades
// ---------------------------------------------------------------------------
export function useGrades(filters: {
  studentId?: string;
  courseId?: string;
  semester?: string;
  academicYear?: string;
}) {
  const user = useAuthStore((s) => s.user);
  return useQuery<GradeRow[]>({
    queryKey: ["grades", filters],
    enabled: !!user,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.studentId) params.set("studentId", filters.studentId);
      if (filters.courseId) params.set("courseId", filters.courseId);
      if (filters.semester) params.set("semester", filters.semester);
      if (filters.academicYear) params.set("academicYear", filters.academicYear);
      const res = await fetch(`/api/grades?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Erreur notes");
      return res.json();
    },
  });
}

export function useBulkSaveGrades() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: any[]) => {
      const res = await fetch("/api/grades/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["grades"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["student"] });
      toast.success(`${data.saved} note(s) enregistrée(s)`);
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });
}

export function useStudentTranscript(studentId: string | null | undefined) {
  return useQuery<StudentTranscript>({
    queryKey: ["student-transcript", studentId],
    enabled: !!studentId,
    queryFn: async () => {
      const res = await fetch(`/api/grades/student/${studentId}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Erreur notes étudiant");
      return res.json();
    },
  });
}

export function useDeleteGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/grades/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erreur");
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["grades"] });
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["student"] });
      toast.success("Note supprimée");
    },
    onError: (e: any) => toast.error(e.message || "Erreur"),
  });
}
