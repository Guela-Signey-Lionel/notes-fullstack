-- ============================================================
-- V7__seed_filieres_matieres.sql
-- Filière Développement Logiciel + Semestres + Matières
-- (ON CONFLICT DO NOTHING pour idempotence)
-- ============================================================

-- ── Filière ─────────────────────────────────────────────────
INSERT INTO filieres (id, nom, code, niveau, duree, actif)
VALUES ('a1000000-0000-0000-0000-000000000001', 'Développement Logiciel', 'DL', 'LICENCE', 3, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ── Promotion ───────────────────────────────────────────────
INSERT INTO promotions (id, nom, annee_academique, filiere_id, actif)
VALUES ('b1000000-0000-0000-0000-000000000001', 'DL-1ère Année', '2025-2026', 'a1000000-0000-0000-0000-000000000001', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ── Semestres ───────────────────────────────────────────────
INSERT INTO semestres (id, numero, annee_academique, date_debut, date_fin, statut, promotion_id)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 1, '2025-2026', '2025-09-01', '2026-01-31', 'OUVERT', 'b1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000002', 2, '2025-2026', '2026-02-01', '2026-06-30', 'OUVERT', 'b1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEMESTRE 1 — Développement Logiciel (32 crédits)
-- ============================================================

INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d1000000-0000-0000-0000-000000000101', 'DEV101', 'Introduction à l''informatique',                   3, 'c1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000102', 'DEV102', 'Fondamentaux de la programmation',                  4, 'c1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000103', 'DEV103', 'Algorithmique et structures de données',           4, 'c1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000104', 'DEV104', 'Programmation orientée objet',                     4, 'c1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000105', 'DEV105', 'Fondamentaux des bases de données',                3, 'c1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000106', 'DEV106', 'Fondamentaux du développement web',                3, 'c1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000107', 'DEV107', 'Réseaux informatiques',                           3, 'c1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000108', 'DEV108', 'Mathématiques pour l''informatique',               3, 'c1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000109', 'DEV109', 'Anglais technique',                               2, 'c1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000110', 'DEV110', 'Systèmes informatiques et systèmes d''exploitation', 3, 'c1000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e1000000-0000-0000-0000-000000000101', 'DEV101', 'Introduction à l''informatique',                   1.0, NULL, 'd1000000-0000-0000-0000-000000000101'),
  ('e1000000-0000-0000-0000-000000000102', 'DEV102', 'Fondamentaux de la programmation',                 1.0, NULL, 'd1000000-0000-0000-0000-000000000102'),
  ('e1000000-0000-0000-0000-000000000103', 'DEV103', 'Algorithmique et structures de données',          1.0, NULL, 'd1000000-0000-0000-0000-000000000103'),
  ('e1000000-0000-0000-0000-000000000104', 'DEV104', 'Programmation orientée objet',                    1.0, NULL, 'd1000000-0000-0000-0000-000000000104'),
  ('e1000000-0000-0000-0000-000000000105', 'DEV105', 'Fondamentaux des bases de données',               1.0, NULL, 'd1000000-0000-0000-0000-000000000105'),
  ('e1000000-0000-0000-0000-000000000106', 'DEV106', 'Fondamentaux du développement web',               1.0, NULL, 'd1000000-0000-0000-0000-000000000106'),
  ('e1000000-0000-0000-0000-000000000107', 'DEV107', 'Réseaux informatiques',                          1.0, NULL, 'd1000000-0000-0000-0000-000000000107'),
  ('e1000000-0000-0000-0000-000000000108', 'DEV108', 'Mathématiques pour l''informatique',              1.0, NULL, 'd1000000-0000-0000-0000-000000000108'),
  ('e1000000-0000-0000-0000-000000000109', 'DEV109', 'Anglais technique',                              1.0, NULL, 'd1000000-0000-0000-0000-000000000109'),
  ('e1000000-0000-0000-0000-000000000110', 'DEV110', 'Systèmes informatiques et systèmes d''exploitation', 1.0, NULL, 'd1000000-0000-0000-0000-000000000110')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEMESTRE 2 — Développement Logiciel (34 crédits)
-- ============================================================

INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d1000000-0000-0000-0000-000000000201', 'DEV201', 'Programmation orientée objet avancée',             4, 'c1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000202', 'DEV202', 'Algorithmique et structures de données avancées', 4, 'c1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000203', 'DEV203', 'Gestion des bases de données relationnelles',     4, 'c1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000204', 'DEV204', 'Développement web Front-End',                     4, 'c1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000205', 'DEV205', 'Développement web Back-End',                      4, 'c1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000206', 'DEV206', 'Génie logiciel',                                  3, 'c1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000207', 'DEV207', 'Gestion de versions et développement collaboratif', 2, 'c1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000208', 'DEV208', 'Tests logiciels et assurance qualité',            3, 'c1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000209', 'DEV209', 'Conception d''interfaces utilisateur et expérience utilisateur (UI/UX)', 2, 'c1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000210', 'DEV210', 'Projet de développement logiciel',               4, 'c1000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e1000000-0000-0000-0000-000000000201', 'DEV201', 'Programmation orientée objet avancée',             1.0, NULL, 'd1000000-0000-0000-0000-000000000201'),
  ('e1000000-0000-0000-0000-000000000202', 'DEV202', 'Algorithmique et structures de données avancées', 1.0, NULL, 'd1000000-0000-0000-0000-000000000202'),
  ('e1000000-0000-0000-0000-000000000203', 'DEV203', 'Gestion des bases de données relationnelles',     1.0, NULL, 'd1000000-0000-0000-0000-000000000203'),
  ('e1000000-0000-0000-0000-000000000204', 'DEV204', 'Développement web Front-End',                     1.0, NULL, 'd1000000-0000-0000-0000-000000000204'),
  ('e1000000-0000-0000-0000-000000000205', 'DEV205', 'Développement web Back-End',                      1.0, NULL, 'd1000000-0000-0000-0000-000000000205'),
  ('e1000000-0000-0000-0000-000000000206', 'DEV206', 'Génie logiciel',                                  1.0, NULL, 'd1000000-0000-0000-0000-000000000206'),
  ('e1000000-0000-0000-0000-000000000207', 'DEV207', 'Gestion de versions et développement collaboratif', 1.0, NULL, 'd1000000-0000-0000-0000-000000000207'),
  ('e1000000-0000-0000-0000-000000000208', 'DEV208', 'Tests logiciels et assurance qualité',            1.0, NULL, 'd1000000-0000-0000-0000-000000000208'),
  ('e1000000-0000-0000-0000-000000000209', 'DEV209', 'Conception d''interfaces utilisateur et expérience utilisateur (UI/UX)', 1.0, NULL, 'd1000000-0000-0000-0000-000000000209'),
  ('e1000000-0000-0000-0000-000000000210', 'DEV210', 'Projet de développement logiciel',               1.0, NULL, 'd1000000-0000-0000-0000-000000000210')
ON CONFLICT (id) DO NOTHING;
