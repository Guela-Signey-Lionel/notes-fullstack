"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
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
import { Label } from "@/components/ui/label";import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTeachers,
  useCreateTeacher,
  useUpdateTeacher,
  useDeleteTeacher,
} from "@/hooks/use-api";
import { useUIStore } from "@/store/ui-store";
import { PageHeader, EmptyState, Badge } from "@/components/common/ui-bits";
import { toast } from "sonner";

export function TeachersView() {
  const { data, isLoading } = useTeachers();
  const search = useUIStore((s) => s.searchQuery);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const uniqueDepts = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((t) => t.department).filter(Boolean))];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = data;
    if (deptFilter !== "all") {
      result = result.filter((t) => t.department === deptFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.matricule.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          t.department.toLowerCase().includes(q) ||
          (t.specialty ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, search, deptFilter]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Enseignants"
        subtitle={`${filtered.length} enseignant(s)`}
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
            placeholder="Rechercher par nom, matricule, email ou département…"
          />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Département" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les départements</SelectItem>
            {uniqueDepts.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F5F7FA] dark:bg-[#1f2330] hover:bg-[#F5F7FA] dark:hover:bg-[#1f2330]">
              <TableHead>Matricule</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="hidden sm:table-cell">Département</TableHead>
              <TableHead className="hidden md:table-cell">Spécialité</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="text-center">Matières</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center">
                  <Loader2 className="size-5 animate-spin text-[#7F8C8D] dark:text-[#95a5a6] mx-auto" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState title="Aucun enseignant" icon={Users} />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-[#ECF0F1] dark:border-[#34495E]/60 hover:bg-[#F5F7FA]/60 dark:hover:bg-white/5"
                >
                  <TableCell className="font-mono text-xs text-[#7F8C8D] dark:text-[#95a5a6]">
                    {t.matricule}
                  </TableCell>
                  <TableCell className="font-medium text-[#2C3E50] dark:text-[#ECF0F1]">
                    {t.name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    <Badge variant="blue">{t.department}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-[#7F8C8D] dark:text-[#95a5a6]">
                    {t.specialty ?? "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-[#7F8C8D] dark:text-[#95a5a6] font-mono">
                    {t.email}
                  </TableCell>
                  <TableCell className="text-center text-sm text-[#7F8C8D] dark:text-[#95a5a6]">
                    {t.courseCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(t);
                          setOpenForm(true);
                        }}
                        className="size-8 rounded-md hover:bg-[#ECF0F1] dark:hover:bg-white/10 flex items-center justify-center text-[#7F8C8D] dark:text-[#95a5a6] hover:text-[#2C3E50] dark:hover:text-[#ECF0F1]"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(t.id)}
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
      <TeacherForm open={openForm} onOpenChange={setOpenForm} editing={editing} />
      <DeleteDialog id={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}

function TeacherForm({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  editing: any | null;
}) {
  const createM = useCreateTeacher();
  const updateM = useUpdateTeacher();
  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    password: "",
    matricule: "",
    department: "",
    specialty: "",
    phone: "",
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          name: editing.name || "",
          email: editing.email || "",
          password: "",
          matricule: editing.matricule || "",
          department: editing.department || "",
          specialty: editing.specialty || "",
          phone: editing.phone || "",
        });
      } else {
        setForm({
          name: "",
          email: "",
          password: "",
          matricule: "",
          department: "Informatique",
          specialty: "",
          phone: "",
        });
      }
    }
  }, [open, editing]);

  const isEdit = !!editing;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.matricule || !form.department) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }
    if (!isEdit && !form.password) {
      toast.error("Mot de passe requis");
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
            {isEdit ? "Modifier l'enseignant" : "Nouvel enseignant"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour les informations."
              : "Créez un compte enseignant."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label htmlFor="name">Nom complet *</Label>
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
              <Label htmlFor="mat">Matricule *</Label>
              <Input
                id="mat"
                value={form.matricule}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, matricule: e.target.value }))
                }
                placeholder="ENS007"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, email: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="pw">
                Mot de passe {!isEdit && "*"}
                {isEdit && (
                  <span className="text-[#7F8C8D] text-xs"> (vide = inchangé)</span>
                )}
              </Label>
              <Input
                id="pw"
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, password: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="dept">Département *</Label>
              <Input
                id="dept"
                value={form.department}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, department: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="spec">Spécialité</Label>
              <Input
                id="spec"
                value={form.specialty}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, specialty: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="ph">Téléphone</Label>
              <Input
                id="ph"
                value={form.phone}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, phone: e.target.value }))
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
  const del = useDeleteTeacher();
  return (
    <AlertDialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cet enseignant ?</AlertDialogTitle>
          <AlertDialogDescription>
            Les matières qu'il enseigne seront détachées (mais non supprimées).
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

