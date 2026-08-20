"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Loader2,
  Search,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  usePromotions,
  useTeachers,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
} from "@/hooks/use-api";
import { useUIStore } from "@/store/ui-store";
import { PageHeader, EmptyState, Badge } from "@/components/common/ui-bits";
import { toast } from "sonner";

export function CoursesView() {
  const { data, isLoading } = useCourses();
  const { data: promos } = usePromotions();
  const { data: teachers } = useTeachers();
  const search = useUIStore((s) => s.searchQuery);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [semesterFilter, setSemesterFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = data;
    if (semesterFilter !== "all") {
      result = result.filter((c) => c.semester === semesterFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.promotionName.toLowerCase().includes(q) ||
          (c.teacherName ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, search, semesterFilter]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Matières"
        subtitle={`${filtered.length} matière(s)`}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpenForm(true);
            }}
            className="bg-[#1ABC9C] hover:bg-[#16A085] text-white"
          >
            <Plus className="size-4" /> Ajouter
          </Button>
        }
      />
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Input
            value={search}
            onChange={(e) => useUIStore.getState().setSearch(e.target.value)}
            placeholder="Rechercher par nom, code, enseignant ou promotion…"
          />
        </div>
        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Semestre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les semestres</SelectItem>
            <SelectItem value="S1">S1</SelectItem>
            <SelectItem value="S2">S2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F5F7FA] dark:bg-[#1f2330] hover:bg-[#F5F7FA] dark:hover:bg-[#1f2330]">
              <TableHead>Code</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="text-center">Coef.</TableHead>
              <TableHead className="hidden sm:table-cell text-center">Crédits</TableHead>
              <TableHead className="text-center">Sem.</TableHead>
              <TableHead className="hidden md:table-cell">Enseignant</TableHead>
              <TableHead className="hidden lg:table-cell">Promotion</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center">
                  <Loader2 className="size-5 animate-spin text-[#7F8C8D] dark:text-[#95a5a6] mx-auto" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState title="Aucune matière" icon={BookOpen} />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-[#ECF0F1] dark:border-[#34495E]/60 hover:bg-[#F5F7FA]/60 dark:hover:bg-white/5"
                >
                  <TableCell className="font-mono text-xs text-[#1ABC9C] dark:text-[#1ABC9C] font-semibold">
                    {c.code}
                  </TableCell>
                  <TableCell className="font-medium text-[#2C3E50] dark:text-[#ECF0F1]">
                    {c.name}
                  </TableCell>
                  <TableCell className="text-center text-sm text-[#7F8C8D] dark:text-[#95a5a6]">
                    {c.coefficient}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-center text-sm text-[#7F8C8D] dark:text-[#95a5a6]">
                    {c.credits}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={c.semester === "S1" ? "teal" : "orange"}>
                      {c.semester}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-[#7F8C8D] dark:text-[#95a5a6]">
                    {c.teacherName ?? "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-[#7F8C8D] dark:text-[#95a5a6]">
                    {c.promotionName}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(c);
                          setOpenForm(true);
                        }}
                        className="size-8 rounded-md hover:bg-[#ECF0F1] dark:hover:bg-white/10 flex items-center justify-center text-[#7F8C8D] dark:text-[#95a5a6] hover:text-[#2C3E50] dark:hover:text-[#ECF0F1]"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(c.id)}
                        className="size-8 rounded-md hover:bg-[#E74C3C]/10 flex items-center justify-center text-[#7F8C8D] dark:text-[#95a5a6] hover:text-[#E74C3C]"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <CourseForm
        open={openForm}
        onOpenChange={setOpenForm}
        editing={editing}
        promotions={promos || []}
        teachers={teachers || []}
      />
      <DeleteDialog id={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}

function CourseForm({
  open,
  onOpenChange,
  editing,
  promotions,
  teachers,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  editing: any | null;
  promotions: any[];
  teachers: any[];
}) {
  const createM = useCreateCourse();
  const updateM = useUpdateCourse();
  const [form, setForm] = useState<any>({
    code: "",
    name: "",
    description: "",
    coefficient: "1",
    credits: "3",
    semester: "S1",
    academicYear: "2024-2025",
    promotionId: "",
    teacherId: "",
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          code: editing.code || "",
          name: editing.name || "",
          description: editing.description || "",
          coefficient: String(editing.coefficient || "1"),
          credits: String(editing.credits || "3"),
          semester: editing.semester || "S1",
          academicYear: editing.academicYear || "2024-2025",
          promotionId: editing.promotionId || "",
          teacherId: editing.teacherId || "",
        });
      } else {
        setForm({
          code: "",
          name: "",
          description: "",
          coefficient: "2",
          credits: "4",
          semester: "S1",
          academicYear: "2024-2025",
          promotionId: promotions[0]?.id || "",
          teacherId: teachers[0]?.id || "",
        });
      }
    }
  }, [open, editing, promotions, teachers]);

  const isEdit = !!editing;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.code || !form.name || !form.promotionId || !form.academicYear) {
      toast.error("Champs requis manquants");
      return;
    }
    try {
      if (isEdit) {
        await updateM.mutateAsync({ id: editing.id, ...form });
      } else {
        await createM.mutateAsync(form);
      }
      onOpenChange(false);
    } catch {}
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier la matière" : "Nouvelle matière"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour les informations."
              : "Créez une nouvelle matière."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, code: e.target.value }))
                }
                placeholder="INFO401"
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="coef">Coefficient</Label>
              <Input
                id="coef"
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                value={form.coefficient}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, coefficient: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="credits">Crédits ECTS</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                max="12"
                value={form.credits}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, credits: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="sem">Semestre</Label>
              <Select
                value={form.semester}
                onValueChange={(v) =>
                  setForm((f: any) => ({ ...f, semester: v }))
                }
              >
                <SelectTrigger id="sem" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S1">S1</SelectItem>
                  <SelectItem value="S2">S2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ay">Année académique</Label>
              <Input
                id="ay"
                value={form.academicYear}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, academicYear: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="promo">Promotion *</Label>
              <Select
                value={form.promotionId}
                onValueChange={(v) =>
                  setForm((f: any) => ({ ...f, promotionId: v }))
                }
              >
                <SelectTrigger id="promo" className="w-full">
                  <SelectValue placeholder="Choisir…" />
                </SelectTrigger>
                <SelectContent>
                  {promotions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="teacher">Enseignant</Label>
              <Select
                value={form.teacherId || "none"}
                onValueChange={(v) =>
                  setForm((f: any) => ({
                    ...f,
                    teacherId: v === "none" ? "" : v,
                  }))
                }
              >
                <SelectTrigger id="teacher" className="w-full">
                  <SelectValue placeholder="Non assigné" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Non assigné —</SelectItem>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createM.isPending || updateM.isPending}
              className="bg-[#1ABC9C] hover:bg-[#16A085] text-white"
            >
              {(createM.isPending || updateM.isPending) && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {isEdit ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  id,
  onClose,
}: {
  id: string | null;
  onClose: () => void;
}) {
  const del = useDeleteCourse();
  return (
    <AlertDialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette matière ?</AlertDialogTitle>
          <AlertDialogDescription>
            Toutes les notes associées seront supprimées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              if (!id) return;
              try {
                await del.mutateAsync(id);
                onClose();
              } catch {}
            }}
            className="bg-[#E74C3C] hover:bg-[#C0392B] text-white"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
