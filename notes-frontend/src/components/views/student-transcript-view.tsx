"use client";

import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/common/ui-bits";
import { useStudentTranscript } from "@/hooks/use-api";

export function StudentTranscriptView({ id }: { id: string }) {
  const { data, isLoading } = useStudentTranscript(id);
  if (isLoading || !data) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="size-6 animate-spin text-[#7F8C8D] dark:text-[#95a5a6]" />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="bg-[#F5F7FA] dark:bg-[#1f2330] rounded-md p-2">
          <p className="text-[10px] uppercase tracking-wide text-[#7F8C8D] dark:text-[#95a5a6]">
            Matricule
          </p>
          <p className="font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
            {data.student.matricule}
          </p>
        </div>
        <div className="bg-[#F5F7FA] dark:bg-[#1f2330] rounded-md p-2">
          <p className="text-[10px] uppercase tracking-wide text-[#7F8C8D] dark:text-[#95a5a6]">
            Moyenne
          </p>
          <p className="font-semibold text-[#1ABC9C]">
            {data.overallAverage !== null
              ? `${data.overallAverage.toFixed(2)} /20`
              : "—"}
          </p>
        </div>
        <div className="bg-[#F5F7FA] dark:bg-[#1f2330] rounded-md p-2">
          <p className="text-[10px] uppercase tracking-wide text-[#7F8C8D] dark:text-[#95a5a6]">
            Mention
          </p>
          <p className="font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
            {data.mention}
          </p>
        </div>
      </div>
      {data.semesters.map((sem) => (
        <div
          key={sem.semester}
          className="border border-[#E0E0E0] dark:border-[#34495E] rounded-md overflow-hidden"
        >
          <div className="px-3 py-2 bg-[#F5F7FA] dark:bg-[#1f2330] border-b border-[#ECF0F1] dark:border-[#34495E] text-xs font-semibold text-[#2C3E50] dark:text-[#ECF0F1] flex items-center justify-between">
            <span>Semestre {sem.semester}</span>
            <span className="text-[#7F8C8D] dark:text-[#95a5a6]">
              Moyenne {sem.average !== null ? sem.average.toFixed(2) : "—"} /20
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Matière</TableHead>
                <TableHead className="text-center">Coef.</TableHead>
                <TableHead className="text-center">Note</TableHead>
                <TableHead className="text-center">Mention</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sem.courses.map((c) => (
                <TableRow
                  key={c.id}
                  className="hover:bg-[#F5F7FA]/60 dark:hover:bg-white/5"
                >
                  <TableCell className="text-sm font-medium text-[#2C3E50] dark:text-[#ECF0F1]">
                    {c.code} · {c.name}
                  </TableCell>
                  <TableCell className="text-center text-xs text-[#7F8C8D] dark:text-[#95a5a6]">
                    {c.coefficient}
                  </TableCell>
                  <TableCell className="text-center text-sm font-semibold text-[#2C3E50] dark:text-[#ECF0F1]">
                    {c.value.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        c.value < 10 ? "red" : c.value >= 14 ? "teal" : "neutral"
                      }
                    >
                      {c.mention}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
