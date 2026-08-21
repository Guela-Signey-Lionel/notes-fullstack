"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
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
  useStudents,
  usePromotions,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  useStudent,
} from "@/hooks/use-api";
import { useUIStore } from "@/store/ui-store";
import { PageHeader, EmptyState, Badge } from "@/components/common/ui-bits";
import { StudentTranscriptView } from "@/components/views/student-transcript-view";
import { toast } from "sonner";

export function StudentsView() {
  const { data, isLoading } = useStudents();
  const { data: promos } = usePromotions();
  const search = useUIStore((s) => s.searchQuery);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [promoFilter, setPromoFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const pageSize = 10;

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = data;
    // Promotion filter
    if (promoFilter !== "all") {
      result = result.filter((s) => s.promotionName === promoFilter);
    }
    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }
    // Text search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.matricule.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.promotionName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, search, promoFilter, statusFilter]);

  const uniquePromos = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((s) => s.promotionName).filter(Boolean))];
  }, [data]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Étudiants"
        subtitle={`${filtered.length} étudiant(s) enregistré(s)`}
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#7F8C8D] dark:text-[#95a5a6]" />
          <Input
            value={search}
            onChange={(e) => useUIStore.getState().setSearch(e.target.value)}
            placeholder="Rechercher par nom, matricule ou email…"
            className="pl-9"
          />
        </div>
        <Select value={promoFilter} onValueChange={setPromoFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Promotion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les promotions</SelectItem>
            {uniquePromos.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="PASS">Validé</SelectItem>
            <SelectItem value="FAIL">Échec</SelectItem>
            <SelectItem value="INCOMPLETE">Incomplet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F5F7FA] dark:bg-[#1f2330] hover:bg-[#F5F7FA] dark:hover:bg-[#1f2330]">
              <TableHead>Matricule</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="hidden md:table-cell">Promotion</TableHead>
              <TableHead className="text-center">Notes</TableHead>
              <TableHead className="text-center">Moyenne</TableHead>
              <TableHead className="text-center">Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="size-5 animate-spin text-[#7F8C8D] dark:text-[#95a5a6]" />
                  </div>
                </TableCell>
              </TableRow>
            ) : pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState
                    title="Aucun étudiant"
                    description="Aucun étudiant ne correspond à votre recherche."
                    icon={GraduationCap}
                  />
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-[#ECF0F1] dark:border-[#34495E]/60 hover:bg-[#F5F7FA]/60 dark:hover:bg-white/5"
                >
                  <TableCell className="font-mono text-xs text-[#7F8C8D] dark:text-[#95a5a6]">
                    {s.matricule}
                  </TableCell>
                  <TableCell className="font-medium text-[#2C3E50] dark:text-[#ECF0F1]">
                    {s.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-[#7F8C8D] dark:text-[#95a5a6]">
                    {s.promotionName}
                  </TableCell>
                  <TableCell className="text-center text-sm text-[#7F8C8D] dark:text-[#95a5a6]">
                    {s.gradeCount}
                  </TableCell>
                  <TableCell className="text-center text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
                    {s.average !== null ? (
                      <>
                        {s.average.toFixed(2)}
                        <span className="text-xs text-[#7F8C8D] dark:text-[#95a5a6]"> /20</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {s.status === "PASS" ? (
                      <Badge variant="green">Validé</Badge>
                    ) : s.status === "FAIL" ? (
                      <Badge variant="red">Échec</Badge>
                    ) : (
                      <Badge>—</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewing(s.id)}
                        className="size-8 rounded-md hover:bg-[#ECF0F1] dark:hover:bg-white/10 flex items-center justify-center text-[#7F8C8D] dark:text-[#95a5a6] hover:text-[#2C3E50] dark:hover:text-[#ECF0F1]"
                        aria-label="Voir l'étudiant"
                      >
                        <Eye className="size-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditing(s);
                          setOpenForm(true);
                        }}
                        className="size-8 rounded-md hover:bg-[#ECF0F1] dark:hover:bg-white/10 flex items-center justify-center text-[#7F8C8D] dark:text-[#95a5a6] hover:text-[#2C3E50] dark:hover:text-[#ECF0F1]"
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(s.id)}
                        className="size-8 rounded-md hover:bg-[#E74C3C]/10 flex items-center justify-center text-[#7F8C8D] dark:text-[#95a5a6] hover:text-[#E74C3C]"
                        aria-label="Supprimer"
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
        {pageCount > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-[#ECF0F1] dark:border-[#34495E]">
            <p className="text-xs text-[#7F8C8D] dark:text-[#95a5a6]">
              Page {page + 1} / {pageCount}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Précédent
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Student form dialog */}
      <StudentForm
        open={openForm}
        onOpenChange={setOpenForm}
        editing={editing}
        promotions={promos || []}
      />

      {/* View transcript dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Relevé de l'étudiant</DialogTitle>
            <DialogDescription>
              Notes par semestre et mentions obtenues.
            </DialogDescription>
          </DialogHeader>
          {viewing && <StudentTranscriptView id={viewing} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <DeleteDialog
        id={deleting}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

function StudentForm({
  open,
  onOpenChange,
  editing,
  promotions,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  editing: any | null;
  promotions: any[];
}) {
  const createM = useCreateStudent();
  const updateM = useUpdateStudent();
  const [form, setForm] = useState<any>({
    name: "",
    email: "",
    password: "",
    matricule: "",
    promotionId: "",
    birthDate: "",
    phone: "",
    address: "",
  });

  // Sync when opening
  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          name: editing.name || "",
          email: editing.email || "",
          password: "",
          matricule: editing.matricule || "",
          promotionId: editing.promotionId || "",
          birthDate: editing.birthDate || "",
          phone: editing.phone || "",
          address: editing.address || "",
        });
      } else {
        setForm({
          name: "",
          email: "",
          password: "",
          matricule: "",
          promotionId: promotions[0]?.id || "",
          birthDate: "",
          phone: "",
          address: "",
        });
      }
    }
  }, [open, editing, promotions]);

  const isEdit = !!editing;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.matricule || !form.promotionId) {
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
    } catch {
      /* handled in hook */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier l'étudiant" : "Nouvel étudiant"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Mettez à jour les informations de l'étudiant."
              : "Créez un compte étudiant. Un utilisateur sera créé avec le rôle STUDENT."}
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
                placeholder="ETU031"
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
                  <span className="text-[#7F8C8D] text-xs"> (laisser vide)</span>
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
            <div>
              <Label htmlFor="bd">Date de naissance</Label>
              <Input
                id="bd"
                value={form.birthDate}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, birthDate: e.target.value }))
                }
                placeholder="2002-05-12"
              />
            </div>
            <div>
              <Label htmlFor="ph">Téléphone</Label>
              <Input
                id="ph"
                value={form.phone}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="ad">Adresse</Label>
              <Input
                id="ad"
                value={form.address}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, address: e.target.value }))
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
              {isEdit ? "Mettre à jour" : "Créer l'étudiant"}
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
  const del = useDeleteStudent();
  return (
    <AlertDialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cet étudiant ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Toutes les notes associées seront
            également supprimées.
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

