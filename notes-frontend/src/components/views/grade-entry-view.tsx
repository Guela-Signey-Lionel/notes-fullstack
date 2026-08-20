"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Loader2,
  FileText,
  CheckCircle2,
  Trash2,
  RotateCcw,
  History,
  Info,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCourses,
  useStudents,
  useGrades,
  useBulkSaveGrades,
  useDeleteGrade,
} from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader, EmptyState, Badge } from "@/components/common/ui-bits";
import { mentionFor, type GradeRow } from "@/lib/types";
import { toast } from "sonner";

// History entry saved locally after each successful save
interface HistoryEntry {
  id: string;
  studentName: string;
  studentMatricule: string;
  courseCode: string;
  value: number;
  mention: string;
  savedAt: string;
}

export function GradeEntryView() {
  const user = useAuthStore((s) => s.user);
  const { data: courses } = useCourses();
  const { data: students } = useStudents();

  const [courseId, setCourseId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [semester, setSemester] = useState<string>("");
  const [gradeValue, setGradeValue] = useState("");
  const [comment, setComment] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // ---- Filter courses for the current user ----
  // Teachers see only their assigned courses; admins see all courses.
  const myCourses = useMemo(() => {
    if (!courses) return [];
    if (user?.role === "TEACHER" && user.teacherId) {
      return courses.filter((c) => c.teacherId === user.teacherId);
    }
    return courses;
  }, [courses, user]);

  // Auto-select first course once list is available
  useEffect(() => {
    if (!courseId && myCourses.length > 0) {
      setCourseId(myCourses[0].id);
    }
  }, [myCourses, courseId]);

  const selectedCourse = useMemo(
    () => myCourses.find((c) => c.id === courseId) ?? null,
    [myCourses, courseId]
  );

  // Sync semester from selected course
  useEffect(() => {
    if (selectedCourse) {
      setSemester(selectedCourse.semester);
    } else {
      setSemester("");
    }
    // reset student + grade when course changes
    setStudentId("");
    setGradeValue("");
    setComment("");
  }, [courseId, selectedCourse]);

  const academicYear = selectedCourse?.academicYear || "2024-2025";

  // Students belonging to the selected course's promotion
  const promoStudents = useMemo(() => {
    if (!students || !selectedCourse) return [];
    return students.filter((s) => s.promotionId === selectedCourse.promotionId);
  }, [students, selectedCourse]);

  // Existing grades for the selected course+semester+year
  const { data: existingGrades, isLoading: loadingGrades } = useGrades({
    courseId: courseId || undefined,
    semester,
    academicYear,
  });

  const bulk = useBulkSaveGrades();
  const delGrade = useDeleteGrade();

  // ---- Grade value validation ----
  const numValue = Number(gradeValue);
  const valueTouched = gradeValue !== "";
  const invalid =
    valueTouched && (Number.isNaN(numValue) || numValue < 0 || numValue > 20);
  const mention =
    !invalid && valueTouched ? mentionFor(numValue) : "";

  function canSave() {
    return (
      !!courseId &&
      !!studentId &&
      !!semester &&
      valueTouched &&
      !invalid &&
      !bulk.isPending
    );
  }

  function handleSave() {
    if (!selectedCourse || !studentId) {
      toast.error("Veuillez sélectionner une matière et un étudiant");
      return;
    }
    if (invalid) {
      toast.error("La note doit être comprise entre 0 et 20");
      return;
    }
    const student = promoStudents.find((s) => s.id === studentId);
    if (!student) {
      toast.error("Étudiant introuvable");
      return;
    }
    const items = [
      {
        studentId,
        courseId: selectedCourse.id,
        value: numValue,
        comment: comment.trim() || null,
        semester,
        academicYear,
      },
    ];
    bulk.mutate(items, {
      onSuccess: () => {
        // Add to local history (most recent first, max 5)
        const entry: HistoryEntry = {
          id: `${studentId}-${selectedCourse.id}-${Date.now()}`,
          studentName: student.name,
          studentMatricule: student.matricule,
          courseCode: selectedCourse.code,
          value: numValue,
          mention: mentionFor(numValue),
          savedAt: new Date().toLocaleTimeString("fr-FR"),
        };
        setHistory((h) => [entry, ...h].slice(0, 5));
        // Reset only grade + comment (keep course + student for fast re-entry)
        setGradeValue("");
        setComment("");
      },
    });
  }

  function handleDelete(id: string) {
    delGrade.mutate(id);
  }

  function resetSelection() {
    setGradeValue("");
    setComment("");
    setStudentId("");
  }

  if (user?.role === "STUDENT") {
    return (
      <EmptyState
        title="Accès refusé"
        description="Cette page est réservée aux enseignants."
      />
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Saisie des Notes"
        subtitle="Saisie guidée : matière → étudiant → note. Une note à la fois."
      />

      {myCourses.length === 0 ? (
        <div className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
          <EmptyState
            title="Aucune matière assignée"
            description="Vous n'avez aucune matière assignée pour le moment. Contactez l'administrateur."
            icon={FileText}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ---- LEFT: Guided form ---- */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5 sm:p-6 space-y-5"
          >
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-full bg-[#1ABC9C]/12 flex items-center justify-center">
                <FileText className="size-5 text-[#1ABC9C]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
                  Formulaire de saisie
                </h3>
                <p className="text-xs text-[#7F8C8D] dark:text-[#95a5a6]">
                  Renseignez chaque étape pour enregistrer une note.
                </p>
              </div>
            </div>

            {/* Step 1: Course selection */}
            <div>
              <Label
                htmlFor="course"
                className="text-xs font-semibold text-[#7F8C8D] dark:text-[#95a5a6] flex items-center gap-2"
              >
                <span className="size-5 rounded-full bg-[#1ABC9C]/12 text-[#1ABC9C] text-[10px] font-bold flex items-center justify-center">
                  1
                </span>
                Matière
              </Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger id="course" className="w-full mt-1.5">
                  <SelectValue placeholder="Choisir une matière…" />
                </SelectTrigger>
                <SelectContent>
                  {myCourses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code} · {c.name} ({c.semester} — {c.promotionName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCourse && (
                <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-[#7F8C8D] dark:text-[#95a5a6]">
                  <Badge variant="teal">
                    Coefficient {selectedCourse.coefficient}
                  </Badge>
                  <Badge variant="blue">
                    {selectedCourse.credits} crédits ECTS
                  </Badge>
                  <Badge variant="neutral">
                    {selectedCourse.semester}
                  </Badge>
                  <Badge variant="neutral">
                    {selectedCourse.academicYear}
                  </Badge>
                  {selectedCourse.teacherName && (
                    <span className="ml-1">
                      Prof. {selectedCourse.teacherName}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Student selection */}
            <div>
              <Label
                htmlFor="student"
                className="text-xs font-semibold text-[#7F8C8D] dark:text-[#95a5a6] flex items-center gap-2"
              >
                <span className="size-5 rounded-full bg-[#1ABC9C]/12 text-[#1ABC9C] text-[10px] font-bold flex items-center justify-center">
                  2
                </span>
                Étudiant
              </Label>
              <Select
                value={studentId}
                onValueChange={setStudentId}
                disabled={!selectedCourse}
              >
                <SelectTrigger id="student" className="w-full mt-1.5">
                  <SelectValue
                    placeholder={
                      selectedCourse
                        ? "Choisir un étudiant…"
                        : "Sélectionnez une matière d'abord"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {promoStudents.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.matricule} · {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCourse && promoStudents.length === 0 && (
                <p className="text-[11px] text-[#E67E22] mt-1.5">
                  Aucun étudiant dans cette promotion.
                </p>
              )}
            </div>

            {/* Step 3: Semester + Grade + Comment */}
            <div className="border-t border-[#ECF0F1] dark:border-[#34495E] pt-4 space-y-4">
              <Label className="text-xs font-semibold text-[#7F8C8D] dark:text-[#95a5a6] flex items-center gap-2">
                <span className="size-5 rounded-full bg-[#1ABC9C]/12 text-[#1ABC9C] text-[10px] font-bold flex items-center justify-center">
                  3
                </span>
                Note et commentaire
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label
                    htmlFor="semester"
                    className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6]"
                  >
                    Semestre
                  </Label>
                  <Select
                    value={semester}
                    onValueChange={setSemester}
                    disabled={!selectedCourse}
                  >
                    <SelectTrigger id="semester" className="w-full mt-1">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S1">S1</SelectItem>
                      <SelectItem value="S2">S2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor="academicYear"
                    className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6]"
                  >
                    Année académique
                  </Label>
                  <Input
                    id="academicYear"
                    value={academicYear}
                    readOnly
                    className="mt-1 bg-[#F5F7FA] dark:bg-[#1f2330] text-[#7F8C8D] dark:text-[#95a5a6] cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="grade"
                    className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6]"
                  >
                    Note /20
                  </Label>
                  <Input
                    id="grade"
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={gradeValue}
                    onChange={(e) => setGradeValue(e.target.value)}
                    placeholder="ex. 14.5"
                    disabled={!studentId}
                    className={`mt-1 ${
                      invalid
                        ? "border-[#E74C3C] focus-visible:ring-[#E74C3C]/20 text-[#E74C3C]"
                        : "border-[#E0E0E0] focus-visible:border-[#1ABC9C] focus-visible:ring-[#1ABC9C]/20"
                    }`}
                  />
                </div>
              </div>

              {invalid && (
                <p className="text-[11px] text-[#E74C3C]">
                  La note doit être un nombre entre 0 et 20.
                </p>
              )}

              {/* Mention preview */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#7F8C8D] dark:text-[#95a5a6]">
                  Mention calculée :
                </span>
                {mention ? (
                  <Badge
                    variant={
                      mention === "Insuffisant"
                        ? "red"
                        : mention === "Très Bien"
                        ? "teal"
                        : mention === "Bien"
                        ? "teal"
                        : "neutral"
                    }
                  >
                    {mention}
                  </Badge>
                ) : (
                  <span className="text-[#7F8C8D] dark:text-[#95a5a6]">—</span>
                )}
              </div>

              <div>
                <Label
                  htmlFor="comment"
                  className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6]"
                >
                  Commentaire (optionnel)
                </Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Observation sur la copie…"
                  rows={3}
                  disabled={!studentId}
                  className="mt-1 resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  onClick={handleSave}
                  disabled={!canSave()}
                  className="bg-[#1ABC9C] hover:bg-[#16A085] text-white"
                >
                  {bulk.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Enregistrer la note
                </Button>
                <Button
                  variant="ghost"
                  onClick={resetSelection}
                  disabled={bulk.isPending}
                  className="text-[#7F8C8D] dark:text-[#95a5a6] hover:bg-[#F5F7FA] dark:hover:bg-white/10"
                >
                  <RotateCcw className="size-4" />
                  Réinitialiser
                </Button>
              </div>
            </div>

            {/* History (last 5 entries this session) */}
            {history.length > 0 && (
              <div className="border-t border-[#ECF0F1] dark:border-[#34495E] pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <History className="size-4 text-[#1ABC9C]" />
                  <h4 className="text-xs font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
                    Saisies récentes (cette session)
                  </h4>
                </div>
                <ul className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin">
                  {history.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-center gap-2 text-[11px] px-2 py-1.5 rounded-md bg-[#F5F7FA] dark:bg-[#1f2330]"
                    >
                      <CheckCircle2 className="size-3.5 text-[#1ABC9C] shrink-0" />
                      <span className="font-medium text-[#2C3E50] dark:text-[#ECF0F1] truncate">
                        {h.studentMatricule}
                      </span>
                      <span className="text-[#7F8C8D] dark:text-[#95a5a6] truncate">
                        {h.courseCode}
                      </span>
                      <span className="font-bold text-[#1ABC9C] ml-auto">
                        {h.value.toFixed(2)}
                      </span>
                      <Badge
                        variant={
                          h.mention === "Insuffisant"
                            ? "red"
                            : "teal"
                        }
                      >
                        {h.mention}
                      </Badge>
                      <span className="text-[10px] text-[#7F8C8D] dark:text-[#95a5a6]">
                        {h.savedAt}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>

          {/* ---- RIGHT: Existing grades table for the selected course+semester ---- */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col"
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-[#ECF0F1] dark:border-[#34495E]">
              <Info className="size-4 text-[#3498DB]" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
                  Notes déjà saisies
                </h3>
                <p className="text-[11px] text-[#7F8C8D] dark:text-[#95a5a6]">
                  {selectedCourse
                    ? `${selectedCourse.code} · ${selectedCourse.name} · ${semester} · ${academicYear}`
                    : "Sélectionnez une matière."}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {!courseId ? (
                <EmptyState
                  title="Aucune matière sélectionnée"
                  description="Choisissez une matière pour voir les notes existantes."
                  icon={FileText}
                />
              ) : loadingGrades ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="size-6 animate-spin text-[#7F8C8D] dark:text-[#95a5a6]" />
                </div>
              ) : !existingGrades || existingGrades.length === 0 ? (
                <EmptyState
                  title="Aucune note saisie"
                  description="Aucune note n'a encore été enregistrée pour ce cours et ce semestre."
                  icon={FileText}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F5F7FA] dark:bg-[#1f2330] hover:bg-[#F5F7FA] dark:hover:bg-[#1f2330]">
                      <TableHead className="w-24">Matricule</TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead className="text-center w-16">Note</TableHead>
                      <TableHead className="text-center w-28">Mention</TableHead>
                      <TableHead>Commentaire</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {existingGrades.map((g: GradeRow) => (
                      <TableRow
                        key={g.id}
                        className="hover:bg-[#F5F7FA]/60 dark:hover:bg-white/5"
                      >
                        <TableCell className="font-mono text-xs text-[#7F8C8D] dark:text-[#95a5a6]">
                          {g.studentMatricule}
                        </TableCell>
                        <TableCell className="font-medium text-sm text-[#2C3E50] dark:text-[#ECF0F1]">
                          {g.studentName}
                        </TableCell>
                        <TableCell className="text-center font-bold text-sm text-[#2C3E50] dark:text-[#ECF0F1]">
                          {g.value.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              g.mention === "Insuffisant"
                                ? "red"
                                : g.mention === "Très Bien" ||
                                  g.mention === "Bien"
                                ? "teal"
                                : "neutral"
                            }
                          >
                            {g.mention}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-[#7F8C8D] dark:text-[#95a5a6] max-w-[160px] truncate">
                          {g.comment || "—"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(g.id)}
                            disabled={delGrade.isPending}
                            className="size-7 p-0 text-[#E74C3C] hover:bg-[#E74C3C]/10"
                            aria-label="Supprimer la note"
                            title="Supprimer la note"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
