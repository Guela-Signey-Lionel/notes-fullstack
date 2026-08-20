"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Layers,
  Loader2,
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
  usePromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
} from "@/hooks/use-api";
import { PageHeader, EmptyState, Badge } from "@/components/common/ui-bits";
import { toast } from "sonner";

export function PromotionsView() {
  const { data, isLoading } = usePromotions();
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Promotions"
        subtitle={`${data?.length ?? 0} promotion(s)`}
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
      <div className="bg-white dark:bg-[#252b3a] rounded-xl border border-[#E0E0E0] dark:border-[#34495E] shadow-[0_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F5F7FA] dark:bg-[#1f2330] hover:bg-[#F5F7FA] dark:hover:bg-[#1f2330]">
              <TableHead>Nom</TableHead>
              <TableHead className="text-center">Niveau</TableHead>
              <TableHead>Filière</TableHead>
              <TableHead>Année</TableHead>
              <TableHead className="text-center">Étudiants</TableHead>
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
            ) : (data?.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState title="Aucune promotion" icon={Layers} />
                </TableCell>
              </TableRow>
            ) : (
              data!.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-[#ECF0F1] dark:border-[#34495E]/60 hover:bg-[#F5F7FA]/60 dark:hover:bg-white/5"
                >
                  <TableCell className="font-medium text-[#2C3E50] dark:text-[#ECF0F1]">
                    {p.name}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="teal">{p.level}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#7F8C8D] dark:text-[#95a5a6]">
                    {p.field}
                  </TableCell>
                  <TableCell className="text-sm text-[#7F8C8D] dark:text-[#95a5a6]">
                    {p.academicYear}
                  </TableCell>
                  <TableCell className="text-center text-sm text-[#2C3E50] dark:text-[#ECF0F1]">
                    {p.studentCount}
                  </TableCell>
                  <TableCell className="text-center text-sm text-[#2C3E50] dark:text-[#ECF0F1]">
                    {p.courseCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditing(p);
                          setOpenForm(true);
                        }}
                        className="size-8 rounded-md hover:bg-[#ECF0F1] dark:hover:bg-white/10 flex items-center justify-center text-[#7F8C8D] dark:text-[#95a5a6] hover:text-[#2C3E50] dark:hover:text-[#ECF0F1]"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(p.id)}
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
      <PromoForm
        open={openForm}
        onOpenChange={setOpenForm}
        editing={editing}
      />
      <DeleteDialog id={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}

function PromoForm({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  editing: any | null;
}) {
  const createM = useCreatePromotion();
  const updateM = useUpdatePromotion();
  const [form, setForm] = useState<any>({
    name: "",
    level: "L3",
    field: "",
    academicYear: "2024-2025",
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          name: editing.name || "",
          level: editing.level || "L3",
          field: editing.field || "",
          academicYear: editing.academicYear || "2024-2025",
        });
      } else {
        setForm({
          name: "",
          level: "L3",
          field: "",
          academicYear: "2024-2025",
        });
      }
    }
  }, [open, editing]);

  const isEdit = !!editing;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.field || !form.academicYear) {
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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Modifier la promotion" : "Nouvelle promotion"}
          </DialogTitle>
          <DialogDescription>
            Créez un niveau académique (L1-L3, M1, M2).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) =>
                setForm((f: any) => ({ ...f, name: e.target.value }))
              }
              placeholder="Licence 3 Informatique"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="level">Niveau</Label>
              <Select
                value={form.level}
                onValueChange={(v) =>
                  setForm((f: any) => ({ ...f, level: v }))
                }
              >
                <SelectTrigger id="level" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["L1", "L2", "L3", "M1", "M2"].map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="field">Filière *</Label>
              <Input
                id="field"
                value={form.field}
                onChange={(e) =>
                  setForm((f: any) => ({ ...f, field: e.target.value }))
                }
                placeholder="Informatique"
                required
              />
            </div>
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
  const del = useDeletePromotion();
  return (
    <AlertDialog open={!!id} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette promotion ?</AlertDialogTitle>
          <AlertDialogDescription>
            Action impossible si des étudiants ou matières y sont rattachés.
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
