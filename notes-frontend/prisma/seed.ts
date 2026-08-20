/**
 * Seed script - Système de Gestion des Notes Étudiantes
 * Génère des données réalistes pour la soutenance
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FIRST_NAMES = [
  'Aïcha', 'Mamadou', 'Fatou', 'Ibrahim', 'Awa', 'Moussa', 'Aminata', 'Oumar',
  'Kadiatou', 'Seydou', 'Bintou', 'Mouhamed', 'Rokia', 'Lassana', 'Nana', 'Adama',
  'Salimata', 'Bakary', 'Kesso', 'Drissa', 'Hawa', 'Modibo', 'Boubacar', 'Fanta',
  'Cheick', 'Oumou', 'Lassina', 'Mariam', 'Yacouba', 'Sira',
];

const LAST_NAMES = [
  'Traoré', 'Diarra', 'Coulibaly', 'Konaté', 'Diallo', 'Camara', 'Sangaré', 'Bah',
  'Cissé', 'Maïga', 'Touré', 'Sidibé', 'Fofana', 'Diakité', 'Doumbia', 'Kanté',
  'Keïta', 'Sow', 'Diop', 'Ndiaye', 'Sylla', 'Bagayoko', 'Kouyaté', 'Traoré',
  'Dembele', 'Cissé', 'Sangoyandé', 'Diabaté', 'Doucouré', 'Koné',
];

function randomGrade(): number {
  // Generates a grade between 5 and 19 with most between 9 and 16
  const r = Math.random();
  if (r < 0.1) return Math.round((5 + Math.random() * 4) * 2) / 2; // 5-9 (échec)
  if (r < 0.7) return Math.round((10 + Math.random() * 6) * 2) / 2; // 10-16 (passant)
  return Math.round((16 + Math.random() * 4) * 2) / 2; // 16-20 (excellent)
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🌱 Début du seed...');

  // ============================================================
  // 1. ADMIN
  // ============================================================
  const admin = await prisma.user.create({
    data: {
      email: 'admin@notes.com',
      password: 'Admin@2026',
      name: 'Administrateur Général',
      role: 'ADMIN',
      avatar: 'AD',
      phone: '+223 760000000',
      bio: 'Administrateur système de la plateforme académique de gestion des notes.',
    },
  });
  console.log('✅ Admin créé:', admin.email);

  // ============================================================
  // 2. ENSEIGNANTS
  // ============================================================
  const teacherData = [
    { name: 'Dr. Adama Koné', email: 'enseignant1@notes.com', password: 'Ens1@2026', department: 'Informatique', specialty: 'Algorithmique' },
    { name: 'Pr. Fatoumata Diallo', email: 'enseignant2@notes.com', password: 'Ens2@2026', department: 'Mathématiques', specialty: 'Algèbre' },
    { name: 'Dr. Seydou Traoré', email: 'enseignant3@notes.com', password: 'Ens3@2026', department: 'Informatique', specialty: 'Bases de données' },
    { name: 'Dr. Aminata Coulibaly', email: 'enseignant4@notes.com', password: 'Ens4@2026', department: 'Informatique', specialty: 'Réseaux' },
    { name: 'Pr. Moussa Camara', email: 'enseignant5@notes.com', password: 'Ens5@2026', department: 'Mathématiques', specialty: 'Probabilités' },
    { name: 'Dr. Bintou Sangaré', email: 'enseignant6@notes.com', password: 'Ens6@2026', department: 'Informatique', specialty: 'Intelligence Artificielle' },
  ];

  const teachers = [];
  for (let i = 0; i < teacherData.length; i++) {
    const t = teacherData[i];
    const user = await prisma.user.create({
      data: {
        email: t.email,
        password: t.password,
        name: t.name,
        role: 'TEACHER',
        avatar: t.name.split(' ').slice(-1)[0].slice(0, 2).toUpperCase(),
        phone: '+223 7' + String(0 + i) + ' ' + String(100000 + i * 1111).slice(0, 2) + ' ' + String(20000 + i * 3333).slice(0, 2) + ' ' + String(30000 + i * 5555).slice(0, 2),
        bio: `${t.name} — ${t.specialty} (${t.department})`,
      },
    });
    const teacher = await prisma.teacher.create({
      data: {
        matricule: `ENS${String(i + 1).padStart(3, '0')}`,
        userId: user.id,
        department: t.department,
        specialty: t.specialty,
        phone: '+223 7' + String(0 + i) + ' ' + String(100000 + i * 1111).slice(0, 2) + ' ' + String(20000 + i * 3333).slice(0, 2) + ' ' + String(30000 + i * 5555).slice(0, 2),
      },
    });
    teachers.push(teacher);
  }
  console.log(`✅ ${teachers.length} enseignants créés`);

  // ============================================================
  // 3. PROMOTIONS
  // ============================================================
  const promotions = [
    { name: 'Licence 3 Informatique', level: 'L3', field: 'Informatique', academicYear: '2024-2025' },
    { name: 'Licence 3 Mathématiques', level: 'L3', field: 'Mathématiques', academicYear: '2024-2025' },
  ].map(async (p) => await prisma.promotion.create({ data: p }));
  const promoRecords = await Promise.all(promotions);
  console.log(`✅ ${promoRecords.length} promotions créées`);

  // ============================================================
  // 4. COURS / MATIÈRES
  // ============================================================
  const courseTemplates = [
    // L3 Informatique - S1
    { code: 'INFO301', name: 'Algorithmique Avancée', coeff: 3, credits: 6, semester: 'S1', department: 'Informatique' },
    { code: 'INFO302', name: 'Base de Données II', coeff: 2, credits: 4, semester: 'S1', department: 'Informatique' },
    { code: 'INFO303', name: 'Réseaux Informatiques', coeff: 2, credits: 4, semester: 'S1', department: 'Informatique' },
    { code: 'INFO304', name: 'Génie Logiciel', coeff: 3, credits: 6, semester: 'S1', department: 'Informatique' },
    // L3 Informatique - S2
    { code: 'INFO311', name: 'Intelligence Artificielle', coeff: 3, credits: 6, semester: 'S2', department: 'Informatique' },
    { code: 'INFO312', name: 'Systèmes Distribués', coeff: 2, credits: 4, semester: 'S2', department: 'Informatique' },
    // L3 Mathématiques - S1
    { code: 'MATH301', name: 'Algèbre Linéaire', coeff: 3, credits: 6, semester: 'S1', department: 'Mathématiques' },
    { code: 'MATH302', name: 'Analyse Numérique', coeff: 2, credits: 4, semester: 'S1', department: 'Mathématiques' },
    // L3 Mathématiques - S2
    { code: 'MATH311', name: 'Probabilités & Statistiques', coeff: 3, credits: 6, semester: 'S2', department: 'Mathématiques' },
    { code: 'MATH312', name: 'Équations Différentielles', coeff: 2, credits: 4, semester: 'S2', department: 'Mathématiques' },
  ];

  const courses = [];
  for (const c of courseTemplates) {
    // Find promotion matching field
    const promo = promoRecords.find((p) => p.field === c.department);
    // Find teacher matching department
    const teacher = teachers.find((t) => t.department === c.department);
    const course = await prisma.course.create({
      data: {
        code: c.code,
        name: c.name,
        description: `Cours de ${c.name} pour la ${promo?.name}`,
        coefficient: c.coeff,
        credits: c.credits,
        semester: c.semester,
        academicYear: '2024-2025',
        promotionId: promo!.id,
        teacherId: teacher?.id,
      },
    });
    courses.push(course);
  }
  console.log(`✅ ${courses.length} matières créées`);

  // ============================================================
  // 5. ÉTUDIANTS (30 étudiants)
  // ============================================================
  const students = [];
  const promoInfo = promoRecords.map(p => ({ id: p.id, name: p.name }));

  for (let i = 0; i < 30; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    // Alternate promotions
    const promoIndex = i < 18 ? 0 : 1;
    const promo = promoRecords[promoIndex];

    const user = await prisma.user.create({
      data: {
        email: `etudiant${String(i + 1)}@notes.com`,
        password: `Etu${String(i + 1)}@2026`,
        name: fullName,
        role: 'STUDENT',
        avatar: (firstName[0] + lastName[0]).toUpperCase(),
        phone: `+223 7${String(0 + (i % 9))} ${String(10000 + i * 137).slice(0, 2)} ${String(20000 + i * 211).slice(0, 2)} ${String(30000 + i * 313).slice(0, 2)}`,
        bio: `Étudiant en ${promo.name}.`,
      },
    });

    const student = await prisma.student.create({
      data: {
        matricule: `ETU${String(i + 1).padStart(3, '0')}`,
        userId: user.id,
        promotionId: promo.id,
        birthDate: `${2000 + (i % 5)}-0${(i % 9) + 1}-1${i % 9}`,
        address: `Quartier Sogoniko, Bamako, Mali`,
        phone: `+223 7${String(0 + (i % 9))} ${String(10000 + i * 137).slice(0, 2)} ${String(20000 + i * 211).slice(0, 2)} ${String(30000 + i * 313).slice(0, 2)}`,
      },
    });
    students.push(student);
  }
  console.log(`✅ ${students.length} étudiants créés`);

  // ============================================================
  // 6. NOTES (pour chaque étudiant, toutes les matières de sa promo)
  // ============================================================
  const comments = [
    'Travail satisfaisant', 'Excellente participation', 'Peut mieux faire',
    'Très bonne compréhension', 'Manque de rigueur', 'Bon résultat',
    'Encourageant', 'À retravailler', 'Excellent', 'Assez bien',
  ];

  let gradeCount = 0;
  for (const student of students) {
    // Get the student's promotion
    const studentWithPromo = await prisma.student.findUnique({
      where: { id: student.id },
      include: { promotion: true },
    });
    const promoCourses = courses.filter((c) => c.promotionId === studentWithPromo?.promotionId);

    for (const course of promoCourses) {
      // Assign a grade for this course
      const value = randomGrade();
      const hasComment = Math.random() > 0.4;
      await prisma.grade.create({
        data: {
          value,
          comment: hasComment ? pick(comments) : null,
          studentId: student.id,
          courseId: course.id,
          semester: course.semester,
          academicYear: '2024-2025',
        },
      });
      gradeCount++;
    }
  }
  console.log(`✅ ${gradeCount} notes créées`);

  // ============================================================
  // 7. STATISTIQUES FINALES
  // ============================================================
  const totalStudents = await prisma.student.count();
  const totalTeachers = await prisma.teacher.count();
  const totalCourses = await prisma.course.count();
  const totalGrades = await prisma.grade.count();
  const totalUsers = await prisma.user.count();

  console.log('\n📊 STATISTIQUES FINALES:');
  console.log(`   👥 Utilisateurs : ${totalUsers}`);
  console.log(`   🎓 Étudiants : ${totalStudents}`);
  console.log(`   👨‍🏫 Enseignants : ${totalTeachers}`);
  console.log(`   📚 Matières : ${totalCourses}`);
  console.log(`   📝 Notes : ${totalGrades}`);

  console.log('\n🔐 COMPTES DE TEST:');
  console.log('   Admin: admin@notes.com / Admin@2026');
  console.log('   Enseignant: enseignant1@notes.com / Ens1@2026');
  console.log('   Étudiant: etudiant1@notes.com / Etu1@2026');

  console.log('\n✅ Seed terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
