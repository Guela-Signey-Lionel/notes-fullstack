import { NextResponse } from "next/server";
import { getCurrentUser, requireRole } from "@/lib/auth";
import type { AppNotification } from "@/lib/types";

function relTime(minutes: number): string {
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${Math.round(minutes)} min`;
  const hours = minutes / 60;
  if (hours < 24) return `il y a ${Math.round(hours)} h`;
  const days = hours / 24;
  return `il y a ${Math.round(days)} j`;
}

const ADMIN_NOTIFS: Array<{ title: string; message: string; type: AppNotification["type"]; mins: number; read: boolean }> = [
  { title: "Bienvenue sur Gestion des Notes", message: "Connectez-vous en tant qu'administrateur pour gérer les données.", type: "info", mins: 1, read: false },
];

const TEACHER_NOTIFS: Array<{ title: string; message: string; type: AppNotification["type"]; mins: number; read: boolean }> = [
  { title: "Bienvenue", message: "Vous êtes connecté en tant qu'enseignant. Consultez vos matières assignées.", type: "info", mins: 1, read: false },
];

const STUDENT_NOTIFS: Array<{ title: string; message: string; type: AppNotification["type"]; mins: number; read: boolean }> = [
  { title: "Bienvenue", message: "Consultez vos notes et relevés dans l'onglet Mes Notes.", type: "info", mins: 1, read: false },
];

export async function GET() {
  const user = await getCurrentUser();
  const guard = requireRole(user, "ADMIN", "TEACHER", "STUDENT");
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const base =
    guard.user.role === "ADMIN"
      ? ADMIN_NOTIFS
      : guard.user.role === "TEACHER"
      ? TEACHER_NOTIFS
      : STUDENT_NOTIFS;

  const notifications: AppNotification[] = base.map((n, i) => ({
    id: `${guard.user.role.toLowerCase()}-${i}`,
    title: n.title,
    message: n.message,
    time: relTime(n.mins),
    read: n.read,
    type: n.type,
  }));

  return NextResponse.json({ notifications });
}
