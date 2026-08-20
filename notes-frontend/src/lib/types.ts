// Shared TypeScript types — Système de Gestion des Notes Étudiantes

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar: string | null;
  profileImage: string | null;
  phone: string | null;
  bio: string | null;
  createdAt?: string;
  studentId?: string | null;
  teacherId?: string | null;
  matricule?: string | null;
  promotionName?: string | null;
  promotionId?: string | null;
  department?: string | null;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning";
}

export interface Stats {
  studentCount: number;
  gradeCount: number;
  teacherCount: number;
  courseCount: number;
  overallAverage: number;
  failingStudentCount: number;
  passingRate: number;
  gradeDistribution: { passing: number; failing: number; total: number };
  topStudents: { id: string; name: string; matricule: string; average: number; percentage: number }[];
  monthlyEvolution: { month: string; promotion: number; target: number }[];
}

export interface StudentWithStats {
  id: string;
  matricule: string;
  name: string;
  email: string;
  promotionId: string;
  promotionName: string;
  promotionLevel: string;
  promotionField: string;
  gradeCount: number;
  average: number | null;
  status: "PASS" | "FAIL" | "INCOMPLETE";
  birthDate: string | null;
  phone: string | null;
  address: string | null;
}

export interface TeacherRow {
  id: string;
  matricule: string;
  name: string;
  email: string;
  department: string;
  specialty: string | null;
  phone: string | null;
  courseCount: number;
}

export interface CourseRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  coefficient: number;
  credits: number;
  semester: string;
  academicYear: string;
  promotionId: string;
  promotionName: string;
  teacherId: string | null;
  teacherName: string | null;
  gradeCount: number;
}

export interface GradeRow {
  id: string;
  value: number;
  comment: string | null;
  studentId: string;
  studentName: string;
  studentMatricule: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  coefficient: number;
  semester: string;
  academicYear: string;
  mention: string;
  teacherName: string | null;
}

export interface PromotionRow {
  id: string;
  name: string;
  level: string;
  field: string;
  academicYear: string;
  studentCount: number;
  courseCount: number;
}

export interface StudentTranscript {
  student: {
    id: string;
    matricule: string;
    name: string;
    email: string;
    birthDate: string | null;
    phone: string | null;
    address: string | null;
  };
  promotion: {
    id: string;
    name: string;
    level: string;
    field: string;
    academicYear: string;
  };
  semesters: {
    semester: string;
    courses: {
      id: string;
      code: string;
      name: string;
      coefficient: number;
      credits: number;
      value: number;
      comment: string | null;
      mention: string;
      teacherName: string | null;
    }[];
    average: number | null;
    totalCredits: number;
    validatedCredits: number;
  }[];
  overallAverage: number | null;
  totalCredits: number;
  validatedCredits: number;
  mention: string;
}

export interface TeacherStats {
  courseCount: number;
  studentCount: number;
  overallAverage: number;
  passingRate: number;
  gradeCount: number;
  courseAverages: {
    id: string;
    code: string;
    name: string;
    semester: string;
    coefficient: number;
    promotionName: string;
    average: number;
    studentCount: number;
    passingRate: number;
  }[];
  mentionDistribution: {
    excellent: number;
    good: number;
    fairlyGood: number;
    passable: number;
    insufficient: number;
  };
}

export function mentionFor(value: number): string {
  if (value >= 16) return "Très Bien";
  if (value >= 14) return "Bien";
  if (value >= 12) return "Assez Bien";
  if (value >= 10) return "Passable";
  return "Insuffisant";
}

export function statusFor(average: number | null): "PASS" | "FAIL" | "INCOMPLETE" {
  if (average === null) return "INCOMPLETE";
  return average >= 10 ? "PASS" : "FAIL";
}
