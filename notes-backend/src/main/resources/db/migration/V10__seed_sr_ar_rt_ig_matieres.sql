-- ============================================================
-- V10__seed_sr_ar_rt_ig_matieres.sql
-- Insert matières pour SR, AR, RT, IG (48 matières × 4 filières)
-- ============================================================

-- ============================================================
-- SR — Licence 1 Semestre 1
-- ============================================================
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d2000000-0000-0000-0000-000000000101', 'SR-S1-01', 'Algorithmique et Structures de Données 1',             5, 'c2000000-0000-0000-0000-000000000001'),
  ('d2000000-0000-0000-0000-000000000102', 'SR-S1-02', 'Introduction à la Programmation (Langage C)',          5, 'c2000000-0000-0000-0000-000000000001'),
  ('d2000000-0000-0000-0000-000000000103', 'SR-S1-03', 'Mathématiques pour l''Informatique 1',                 4, 'c2000000-0000-0000-0000-000000000001'),
  ('d2000000-0000-0000-0000-000000000104', 'SR-S1-04', 'Architecture des Ordinateurs',                         4, 'c2000000-0000-0000-0000-000000000001'),
  ('d2000000-0000-0000-0000-000000000105', 'SR-S1-05', 'Introduction aux Systèmes d''Exploitation',            4, 'c2000000-0000-0000-0000-000000000001'),
  ('d2000000-0000-0000-0000-000000000106', 'SR-S1-06', 'Anglais Technique 1',                                 3, 'c2000000-0000-0000-0000-000000000001'),
  ('d2000000-0000-0000-0000-000000000107', 'SR-S1-07', 'Communication et Expression Écrite',                   2, 'c2000000-0000-0000-0000-000000000001'),
  ('d2000000-0000-0000-0000-000000000108', 'SR-S1-08', 'Outils Bureautiques et Informatique Générale',         3, 'c2000000-0000-0000-0000-000000000001');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e2000000-0000-0000-0000-000000000101', 'SR-S1-01', 'Algorithmique et Structures de Données 1',             4.0, NULL, 'd2000000-0000-0000-0000-000000000101'),
  ('e2000000-0000-0000-0000-000000000102', 'SR-S1-02', 'Introduction à la Programmation (Langage C)',          4.0, NULL, 'd2000000-0000-0000-0000-000000000102'),
  ('e2000000-0000-0000-0000-000000000103', 'SR-S1-03', 'Mathématiques pour l''Informatique 1',                 3.0, NULL, 'd2000000-0000-0000-0000-000000000103'),
  ('e2000000-0000-0000-0000-000000000104', 'SR-S1-04', 'Architecture des Ordinateurs',                         3.0, NULL, 'd2000000-0000-0000-0000-000000000104'),
  ('e2000000-0000-0000-0000-000000000105', 'SR-S1-05', 'Introduction aux Systèmes d''Exploitation',            3.0, NULL, 'd2000000-0000-0000-0000-000000000105'),
  ('e2000000-0000-0000-0000-000000000106', 'SR-S1-06', 'Anglais Technique 1',                                 2.0, NULL, 'd2000000-0000-0000-0000-000000000106'),
  ('e2000000-0000-0000-0000-000000000107', 'SR-S1-07', 'Communication et Expression Écrite',                   2.0, NULL, 'd2000000-0000-0000-0000-000000000107'),
  ('e2000000-0000-0000-0000-000000000108', 'SR-S1-08', 'Outils Bureautiques et Informatique Générale',         2.0, NULL, 'd2000000-0000-0000-0000-000000000108');

-- SR — L1 S2
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d2000000-0000-0000-0000-000000000201', 'SR-S2-01', 'Algorithmique et Structures de Données 2',             5, 'c2000000-0000-0000-0000-000000000002'),
  ('d2000000-0000-0000-0000-000000000202', 'SR-S2-02', 'Programmation Orientée Objet (Java)',                  5, 'c2000000-0000-0000-0000-000000000002'),
  ('d2000000-0000-0000-0000-000000000203', 'SR-S2-03', 'Mathématiques pour l''Informatique 2',                 4, 'c2000000-0000-0000-0000-000000000002'),
  ('d2000000-0000-0000-0000-000000000204', 'SR-S2-04', 'Systèmes d''Exploitation (Linux)',                     4, 'c2000000-0000-0000-0000-000000000002'),
  ('d2000000-0000-0000-0000-000000000205', 'SR-S2-05', 'Introduction aux Réseaux Informatiques',               4, 'c2000000-0000-0000-0000-000000000002'),
  ('d2000000-0000-0000-0000-000000000206', 'SR-S2-06', 'Anglais Technique 2',                                 3, 'c2000000-0000-0000-0000-000000000002'),
  ('d2000000-0000-0000-0000-000000000207', 'SR-S2-07', 'Logique et Électronique Numérique',                    2, 'c2000000-0000-0000-0000-000000000002'),
  ('d2000000-0000-0000-0000-000000000208', 'SR-S2-08', 'Droit et Éthique de l''Informatique',                  3, 'c2000000-0000-0000-0000-000000000002');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e2000000-0000-0000-0000-000000000201', 'SR-S2-01', 'Algorithmique et Structures de Données 2',             4.0, NULL, 'd2000000-0000-0000-0000-000000000201'),
  ('e2000000-0000-0000-0000-000000000202', 'SR-S2-02', 'Programmation Orientée Objet (Java)',                  4.0, NULL, 'd2000000-0000-0000-0000-000000000202'),
  ('e2000000-0000-0000-0000-000000000203', 'SR-S2-03', 'Mathématiques pour l''Informatique 2',                 3.0, NULL, 'd2000000-0000-0000-0000-000000000203'),
  ('e2000000-0000-0000-0000-000000000204', 'SR-S2-04', 'Systèmes d''Exploitation (Linux)',                     3.0, NULL, 'd2000000-0000-0000-0000-000000000204'),
  ('e2000000-0000-0000-0000-000000000205', 'SR-S2-05', 'Introduction aux Réseaux Informatiques',               3.0, NULL, 'd2000000-0000-0000-0000-000000000205'),
  ('e2000000-0000-0000-0000-000000000206', 'SR-S2-06', 'Anglais Technique 2',                                 2.0, NULL, 'd2000000-0000-0000-0000-000000000206'),
  ('e2000000-0000-0000-0000-000000000207', 'SR-S2-07', 'Logique et Électronique Numérique',                    2.0, NULL, 'd2000000-0000-0000-0000-000000000207'),
  ('e2000000-0000-0000-0000-000000000208', 'SR-S2-08', 'Droit et Éthique de l''Informatique',                  2.0, NULL, 'd2000000-0000-0000-0000-000000000208');

-- SR — L2 S3
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d2000000-0000-0000-0000-000000000301', 'SR-S3-01', 'Réseaux Informatiques 1 (Modèle OSI/TCP-IP)',         5, 'c2000000-0000-0000-0000-000000000003'),
  ('d2000000-0000-0000-0000-000000000302', 'SR-S3-02', 'Systèmes d''Exploitation Avancés (Linux/Windows)',     5, 'c2000000-0000-0000-0000-000000000003'),
  ('d2000000-0000-0000-0000-000000000303', 'SR-S3-03', 'Bases de Données',                                     4, 'c2000000-0000-0000-0000-000000000003'),
  ('d2000000-0000-0000-0000-000000000304', 'SR-S3-04', 'Programmation Réseau (Sockets)',                       4, 'c2000000-0000-0000-0000-000000000003'),
  ('d2000000-0000-0000-0000-000000000305', 'SR-S3-05', 'Introduction à la Cryptographie',                      4, 'c2000000-0000-0000-0000-000000000003'),
  ('d2000000-0000-0000-0000-000000000306', 'SR-S3-06', 'Mathématiques Discrètes',                             3, 'c2000000-0000-0000-0000-000000000003'),
  ('d2000000-0000-0000-0000-000000000307', 'SR-S3-07', 'Anglais Technique 3',                                 2, 'c2000000-0000-0000-0000-000000000003'),
  ('d2000000-0000-0000-0000-000000000308', 'SR-S3-08', 'Probabilités et Statistiques',                        3, 'c2000000-0000-0000-0000-000000000003');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e2000000-0000-0000-0000-000000000301', 'SR-S3-01', 'Réseaux Informatiques 1 (Modèle OSI/TCP-IP)',         4.0, NULL, 'd2000000-0000-0000-0000-000000000301'),
  ('e2000000-0000-0000-0000-000000000302', 'SR-S3-02', 'Systèmes d''Exploitation Avancés (Linux/Windows)',     4.0, NULL, 'd2000000-0000-0000-0000-000000000302'),
  ('e2000000-0000-0000-0000-000000000303', 'SR-S3-03', 'Bases de Données',                                     3.0, NULL, 'd2000000-0000-0000-0000-000000000303'),
  ('e2000000-0000-0000-0000-000000000304', 'SR-S3-04', 'Programmation Réseau (Sockets)',                       3.0, NULL, 'd2000000-0000-0000-0000-000000000304'),
  ('e2000000-0000-0000-0000-000000000305', 'SR-S3-05', 'Introduction à la Cryptographie',                      3.0, NULL, 'd2000000-0000-0000-0000-000000000305'),
  ('e2000000-0000-0000-0000-000000000306', 'SR-S3-06', 'Mathématiques Discrètes',                             2.0, NULL, 'd2000000-0000-0000-0000-000000000306'),
  ('e2000000-0000-0000-0000-000000000307', 'SR-S3-07', 'Anglais Technique 3',                                 2.0, NULL, 'd2000000-0000-0000-0000-000000000307'),
  ('e2000000-0000-0000-0000-000000000308', 'SR-S3-08', 'Probabilités et Statistiques',                        2.0, NULL, 'd2000000-0000-0000-0000-000000000308');

-- SR — L2 S4
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d2000000-0000-0000-0000-000000000401', 'SR-S4-01', 'Réseaux Informatiques 2 (Routage et Commutation)',     5, 'c2000000-0000-0000-0000-000000000004'),
  ('d2000000-0000-0000-0000-000000000402', 'SR-S4-02', 'Sécurité des Systèmes d''Exploitation',               5, 'c2000000-0000-0000-0000-000000000004'),
  ('d2000000-0000-0000-0000-000000000403', 'SR-S4-03', 'Administration Systèmes Linux/Windows',                4, 'c2000000-0000-0000-0000-000000000004'),
  ('d2000000-0000-0000-0000-000000000404', 'SR-S4-04', 'Cryptographie Appliquée',                             4, 'c2000000-0000-0000-0000-000000000004'),
  ('d2000000-0000-0000-0000-000000000405', 'SR-S4-05', 'Protocoles de Sécurité Réseau',                       4, 'c2000000-0000-0000-0000-000000000004'),
  ('d2000000-0000-0000-0000-000000000406', 'SR-S4-06', 'Gestion de Projet Informatique',                      3, 'c2000000-0000-0000-0000-000000000004'),
  ('d2000000-0000-0000-0000-000000000407', 'SR-S4-07', 'Anglais Technique 4',                                 2, 'c2000000-0000-0000-0000-000000000004'),
  ('d2000000-0000-0000-0000-000000000408', 'SR-S4-08', 'Recherche Opérationnelle',                            3, 'c2000000-0000-0000-0000-000000000004');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e2000000-0000-0000-0000-000000000401', 'SR-S4-01', 'Réseaux Informatiques 2 (Routage et Commutation)',     4.0, NULL, 'd2000000-0000-0000-0000-000000000401'),
  ('e2000000-0000-0000-0000-000000000402', 'SR-S4-02', 'Sécurité des Systèmes d''Exploitation',               4.0, NULL, 'd2000000-0000-0000-0000-000000000402'),
  ('e2000000-0000-0000-0000-000000000403', 'SR-S4-03', 'Administration Systèmes Linux/Windows',                3.0, NULL, 'd2000000-0000-0000-0000-000000000403'),
  ('e2000000-0000-0000-0000-000000000404', 'SR-S4-04', 'Cryptographie Appliquée',                             3.0, NULL, 'd2000000-0000-0000-0000-000000000404'),
  ('e2000000-0000-0000-0000-000000000405', 'SR-S4-05', 'Protocoles de Sécurité Réseau',                       3.0, NULL, 'd2000000-0000-0000-0000-000000000405'),
  ('e2000000-0000-0000-0000-000000000406', 'SR-S4-06', 'Gestion de Projet Informatique',                      2.0, NULL, 'd2000000-0000-0000-0000-000000000406'),
  ('e2000000-0000-0000-0000-000000000407', 'SR-S4-07', 'Anglais Technique 4',                                 2.0, NULL, 'd2000000-0000-0000-0000-000000000407'),
  ('e2000000-0000-0000-0000-000000000408', 'SR-S4-08', 'Recherche Opérationnelle',                            2.0, NULL, 'd2000000-0000-0000-0000-000000000408');

-- SR — L3 S5
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d2000000-0000-0000-0000-000000000501', 'SR-S5-01', 'Sécurité des Réseaux 1 (Pare-feu, VPN, IDS/IPS)',     5, 'c2000000-0000-0000-0000-000000000005'),
  ('d2000000-0000-0000-0000-000000000502', 'SR-S5-02', 'Audit et Gouvernance de la Sécurité',                 5, 'c2000000-0000-0000-0000-000000000005'),
  ('d2000000-0000-0000-0000-000000000503', 'SR-S5-03', 'Sécurité des Applications Web',                       4, 'c2000000-0000-0000-0000-000000000005'),
  ('d2000000-0000-0000-0000-000000000504', 'SR-S5-04', 'Cloud Computing et Virtualisation',                    4, 'c2000000-0000-0000-0000-000000000005'),
  ('d2000000-0000-0000-0000-000000000505', 'SR-S5-05', 'Analyse de Vulnérabilités et Tests d''Intrusion',     4, 'c2000000-0000-0000-0000-000000000005'),
  ('d2000000-0000-0000-0000-000000000506', 'SR-S5-06', 'Législation et Éthique de la Cybersécurité',           3, 'c2000000-0000-0000-0000-000000000005'),
  ('d2000000-0000-0000-0000-000000000507', 'SR-S5-07', 'Anglais Technique 5',                                 2, 'c2000000-0000-0000-0000-000000000005'),
  ('d2000000-0000-0000-0000-000000000508', 'SR-S5-08', 'Projet Tutoré 1',                                     3, 'c2000000-0000-0000-0000-000000000005');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e2000000-0000-0000-0000-000000000501', 'SR-S5-01', 'Sécurité des Réseaux 1 (Pare-feu, VPN, IDS/IPS)',     4.0, NULL, 'd2000000-0000-0000-0000-000000000501'),
  ('e2000000-0000-0000-0000-000000000502', 'SR-S5-02', 'Audit et Gouvernance de la Sécurité',                 4.0, NULL, 'd2000000-0000-0000-0000-000000000502'),
  ('e2000000-0000-0000-0000-000000000503', 'SR-S5-03', 'Sécurité des Applications Web',                       3.0, NULL, 'd2000000-0000-0000-0000-000000000503'),
  ('e2000000-0000-0000-0000-000000000504', 'SR-S5-04', 'Cloud Computing et Virtualisation',                    3.0, NULL, 'd2000000-0000-0000-0000-000000000504'),
  ('e2000000-0000-0000-0000-000000000505', 'SR-S5-05', 'Analyse de Vulnérabilités et Tests d''Intrusion',     3.0, NULL, 'd2000000-0000-0000-0000-000000000505'),
  ('e2000000-0000-0000-0000-000000000506', 'SR-S5-06', 'Législation et Éthique de la Cybersécurité',           2.0, NULL, 'd2000000-0000-0000-0000-000000000506'),
  ('e2000000-0000-0000-0000-000000000507', 'SR-S5-07', 'Anglais Technique 5',                                 2.0, NULL, 'd2000000-0000-0000-0000-000000000507'),
  ('e2000000-0000-0000-0000-000000000508', 'SR-S5-08', 'Projet Tutoré 1',                                     2.0, NULL, 'd2000000-0000-0000-0000-000000000508');

-- SR — L3 S6
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d2000000-0000-0000-0000-000000000601', 'SR-S6-01', 'Sécurité des Réseaux 2 (Détection et Réponse)',        5, 'c2000000-0000-0000-0000-000000000006'),
  ('d2000000-0000-0000-0000-000000000602', 'SR-S6-02', 'Cybercriminalité et Investigation Numérique',          5, 'c2000000-0000-0000-0000-000000000006'),
  ('d2000000-0000-0000-0000-000000000603', 'SR-S6-03', 'Sécurité des Infrastructures Critiques',              4, 'c2000000-0000-0000-0000-000000000006'),
  ('d2000000-0000-0000-0000-000000000604', 'SR-S6-04', 'Entrepreneuriat et Innovation',                       3, 'c2000000-0000-0000-0000-000000000006'),
  ('d2000000-0000-0000-0000-000000000605', 'SR-S6-05', 'Anglais Technique 6',                                 2, 'c2000000-0000-0000-0000-000000000006'),
  ('d2000000-0000-0000-0000-000000000606', 'SR-S6-06', 'Droit du Travail et Insertion Professionnelle',        2, 'c2000000-0000-0000-0000-000000000006'),
  ('d2000000-0000-0000-0000-000000000607', 'SR-S6-07', 'Mémoire / Projet de Fin d''Études',                   6, 'c2000000-0000-0000-0000-000000000006'),
  ('d2000000-0000-0000-0000-000000000608', 'SR-S6-08', 'Stage Professionnel',                                  3, 'c2000000-0000-0000-0000-000000000006');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e2000000-0000-0000-0000-000000000601', 'SR-S6-01', 'Sécurité des Réseaux 2 (Détection et Réponse)',        4.0, NULL, 'd2000000-0000-0000-0000-000000000601'),
  ('e2000000-0000-0000-0000-000000000602', 'SR-S6-02', 'Cybercriminalité et Investigation Numérique',          4.0, NULL, 'd2000000-0000-0000-0000-000000000602'),
  ('e2000000-0000-0000-0000-000000000603', 'SR-S6-03', 'Sécurité des Infrastructures Critiques',              3.0, NULL, 'd2000000-0000-0000-0000-000000000603'),
  ('e2000000-0000-0000-0000-000000000604', 'SR-S6-04', 'Entrepreneuriat et Innovation',                       2.0, NULL, 'd2000000-0000-0000-0000-000000000604'),
  ('e2000000-0000-0000-0000-000000000605', 'SR-S6-05', 'Anglais Technique 6',                                 2.0, NULL, 'd2000000-0000-0000-0000-000000000605'),
  ('e2000000-0000-0000-0000-000000000606', 'SR-S6-06', 'Droit du Travail et Insertion Professionnelle',        2.0, NULL, 'd2000000-0000-0000-0000-000000000606'),
  ('e2000000-0000-0000-0000-000000000607', 'SR-S6-07', 'Mémoire / Projet de Fin d''Études',                   4.0, NULL, 'd2000000-0000-0000-0000-000000000607'),
  ('e2000000-0000-0000-0000-000000000608', 'SR-S6-08', 'Stage Professionnel',                                  3.0, NULL, 'd2000000-0000-0000-0000-000000000608');

-- ============================================================
-- AR — Licence 1 Semestre 1
-- ============================================================
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d3000000-0000-0000-0000-000000000101', 'AR-S1-01', 'Algorithmique et Structures de Données 1',             5, 'c3000000-0000-0000-0000-000000000001'),
  ('d3000000-0000-0000-0000-000000000102', 'AR-S1-02', 'Introduction à la Programmation (Langage C)',          5, 'c3000000-0000-0000-0000-000000000001'),
  ('d3000000-0000-0000-0000-000000000103', 'AR-S1-03', 'Mathématiques pour l''Informatique 1',                 4, 'c3000000-0000-0000-0000-000000000001'),
  ('d3000000-0000-0000-0000-000000000104', 'AR-S1-04', 'Architecture des Ordinateurs',                         4, 'c3000000-0000-0000-0000-000000000001'),
  ('d3000000-0000-0000-0000-000000000105', 'AR-S1-05', 'Introduction aux Systèmes d''Exploitation',            4, 'c3000000-0000-0000-0000-000000000001'),
  ('d3000000-0000-0000-0000-000000000106', 'AR-S1-06', 'Anglais Technique 1',                                 3, 'c3000000-0000-0000-0000-000000000001'),
  ('d3000000-0000-0000-0000-000000000107', 'AR-S1-07', 'Communication et Expression Écrite',                   2, 'c3000000-0000-0000-0000-000000000001'),
  ('d3000000-0000-0000-0000-000000000108', 'AR-S1-08', 'Outils Bureautiques et Informatique Générale',         3, 'c3000000-0000-0000-0000-000000000001');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e3000000-0000-0000-0000-000000000101', 'AR-S1-01', 'Algorithmique et Structures de Données 1',             4.0, NULL, 'd3000000-0000-0000-0000-000000000101'),
  ('e3000000-0000-0000-0000-000000000102', 'AR-S1-02', 'Introduction à la Programmation (Langage C)',          4.0, NULL, 'd3000000-0000-0000-0000-000000000102'),
  ('e3000000-0000-0000-0000-000000000103', 'AR-S1-03', 'Mathématiques pour l''Informatique 1',                 3.0, NULL, 'd3000000-0000-0000-0000-000000000103'),
  ('e3000000-0000-0000-0000-000000000104', 'AR-S1-04', 'Architecture des Ordinateurs',                         3.0, NULL, 'd3000000-0000-0000-0000-000000000104'),
  ('e3000000-0000-0000-0000-000000000105', 'AR-S1-05', 'Introduction aux Systèmes d''Exploitation',            3.0, NULL, 'd3000000-0000-0000-0000-000000000105'),
  ('e3000000-0000-0000-0000-000000000106', 'AR-S1-06', 'Anglais Technique 1',                                 2.0, NULL, 'd3000000-0000-0000-0000-000000000106'),
  ('e3000000-0000-0000-0000-000000000107', 'AR-S1-07', 'Communication et Expression Écrite',                   2.0, NULL, 'd3000000-0000-0000-0000-000000000107'),
  ('e3000000-0000-0000-0000-000000000108', 'AR-S1-08', 'Outils Bureautiques et Informatique Générale',         2.0, NULL, 'd3000000-0000-0000-0000-000000000108');

-- AR — L1 S2
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d3000000-0000-0000-0000-000000000201', 'AR-S2-01', 'Algorithmique et Structures de Données 2',             5, 'c3000000-0000-0000-0000-000000000002'),
  ('d3000000-0000-0000-0000-000000000202', 'AR-S2-02', 'Programmation Orientée Objet (Java)',                  5, 'c3000000-0000-0000-0000-000000000002'),
  ('d3000000-0000-0000-0000-000000000203', 'AR-S2-03', 'Mathématiques pour l''Informatique 2',                 4, 'c3000000-0000-0000-0000-000000000002'),
  ('d3000000-0000-0000-0000-000000000204', 'AR-S2-04', 'Systèmes d''Exploitation (Linux)',                     4, 'c3000000-0000-0000-0000-000000000002'),
  ('d3000000-0000-0000-0000-000000000205', 'AR-S2-05', 'Introduction aux Réseaux Informatiques',               4, 'c3000000-0000-0000-0000-000000000002'),
  ('d3000000-0000-0000-0000-000000000206', 'AR-S2-06', 'Anglais Technique 2',                                 3, 'c3000000-0000-0000-0000-000000000002'),
  ('d3000000-0000-0000-0000-000000000207', 'AR-S2-07', 'Logique et Électronique Numérique',                    2, 'c3000000-0000-0000-0000-000000000002'),
  ('d3000000-0000-0000-0000-000000000208', 'AR-S2-08', 'Droit et Éthique de l''Informatique',                  3, 'c3000000-0000-0000-0000-000000000002');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e3000000-0000-0000-0000-000000000201', 'AR-S2-01', 'Algorithmique et Structures de Données 2',             4.0, NULL, 'd3000000-0000-0000-0000-000000000201'),
  ('e3000000-0000-0000-0000-000000000202', 'AR-S2-02', 'Programmation Orientée Objet (Java)',                  4.0, NULL, 'd3000000-0000-0000-0000-000000000202'),
  ('e3000000-0000-0000-0000-000000000203', 'AR-S2-03', 'Mathématiques pour l''Informatique 2',                 3.0, NULL, 'd3000000-0000-0000-0000-000000000203'),
  ('e3000000-0000-0000-0000-000000000204', 'AR-S2-04', 'Systèmes d''Exploitation (Linux)',                     3.0, NULL, 'd3000000-0000-0000-0000-000000000204'),
  ('e3000000-0000-0000-0000-000000000205', 'AR-S2-05', 'Introduction aux Réseaux Informatiques',               3.0, NULL, 'd3000000-0000-0000-0000-000000000205'),
  ('e3000000-0000-0000-0000-000000000206', 'AR-S2-06', 'Anglais Technique 2',                                 2.0, NULL, 'd3000000-0000-0000-0000-000000000206'),
  ('e3000000-0000-0000-0000-000000000207', 'AR-S2-07', 'Logique et Électronique Numérique',                    2.0, NULL, 'd3000000-0000-0000-0000-000000000207'),
  ('e3000000-0000-0000-0000-000000000208', 'AR-S2-08', 'Droit et Éthique de l''Informatique',                  2.0, NULL, 'd3000000-0000-0000-0000-000000000208');

-- AR — L2 S3
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d3000000-0000-0000-0000-000000000301', 'AR-S3-01', 'Réseaux Informatiques 1 (Modèle OSI/TCP-IP)',         5, 'c3000000-0000-0000-0000-000000000003'),
  ('d3000000-0000-0000-0000-000000000302', 'AR-S3-02', 'Systèmes d''Exploitation Serveurs (Linux)',            5, 'c3000000-0000-0000-0000-000000000003'),
  ('d3000000-0000-0000-0000-000000000303', 'AR-S3-03', 'Bases de Données',                                     4, 'c3000000-0000-0000-0000-000000000003'),
  ('d3000000-0000-0000-0000-000000000304', 'AR-S3-04', 'Câblage et Infrastructures Réseau',                    4, 'c3000000-0000-0000-0000-000000000003'),
  ('d3000000-0000-0000-0000-000000000305', 'AR-S3-05', 'Administration Systèmes Windows Server',               4, 'c3000000-0000-0000-0000-000000000003'),
  ('d3000000-0000-0000-0000-000000000306', 'AR-S3-06', 'Mathématiques Discrètes',                             3, 'c3000000-0000-0000-0000-000000000003'),
  ('d3000000-0000-0000-0000-000000000307', 'AR-S3-07', 'Anglais Technique 3',                                 2, 'c3000000-0000-0000-0000-000000000003'),
  ('d3000000-0000-0000-0000-000000000308', 'AR-S3-08', 'Probabilités et Statistiques',                        3, 'c3000000-0000-0000-0000-000000000003');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e3000000-0000-0000-0000-000000000301', 'AR-S3-01', 'Réseaux Informatiques 1 (Modèle OSI/TCP-IP)',         4.0, NULL, 'd3000000-0000-0000-0000-000000000301'),
  ('e3000000-0000-0000-0000-000000000302', 'AR-S3-02', 'Systèmes d''Exploitation Serveurs (Linux)',            4.0, NULL, 'd3000000-0000-0000-0000-000000000302'),
  ('e3000000-0000-0000-0000-000000000303', 'AR-S3-03', 'Bases de Données',                                     3.0, NULL, 'd3000000-0000-0000-0000-000000000303'),
  ('e3000000-0000-0000-0000-000000000304', 'AR-S3-04', 'Câblage et Infrastructures Réseau',                    3.0, NULL, 'd3000000-0000-0000-0000-000000000304'),
  ('e3000000-0000-0000-0000-000000000305', 'AR-S3-05', 'Administration Systèmes Windows Server',               3.0, NULL, 'd3000000-0000-0000-0000-000000000305'),
  ('e3000000-0000-0000-0000-000000000306', 'AR-S3-06', 'Mathématiques Discrètes',                             2.0, NULL, 'd3000000-0000-0000-0000-000000000306'),
  ('e3000000-0000-0000-0000-000000000307', 'AR-S3-07', 'Anglais Technique 3',                                 2.0, NULL, 'd3000000-0000-0000-0000-000000000307'),
  ('e3000000-0000-0000-0000-000000000308', 'AR-S3-08', 'Probabilités et Statistiques',                        2.0, NULL, 'd3000000-0000-0000-0000-000000000308');

-- AR — L2 S4
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d3000000-0000-0000-0000-000000000401', 'AR-S4-01', 'Réseaux Informatiques 2 (Routage et Commutation)',     5, 'c3000000-0000-0000-0000-000000000004'),
  ('d3000000-0000-0000-0000-000000000402', 'AR-S4-02', 'Administration Systèmes Linux Avancée',                5, 'c3000000-0000-0000-0000-000000000004'),
  ('d3000000-0000-0000-0000-000000000403', 'AR-S4-03', 'Services Réseau (DNS, DHCP, Active Directory)',        4, 'c3000000-0000-0000-0000-000000000004'),
  ('d3000000-0000-0000-0000-000000000404', 'AR-S4-04', 'Virtualisation (VMware/Hyper-V)',                      4, 'c3000000-0000-0000-0000-000000000004'),
  ('d3000000-0000-0000-0000-000000000405', 'AR-S4-05', 'Sécurité des Réseaux — Notions de Base',              4, 'c3000000-0000-0000-0000-000000000004'),
  ('d3000000-0000-0000-0000-000000000406', 'AR-S4-06', 'Gestion de Projet Informatique',                      3, 'c3000000-0000-0000-0000-000000000004'),
  ('d3000000-0000-0000-0000-000000000407', 'AR-S4-07', 'Anglais Technique 4',                                 2, 'c3000000-0000-0000-0000-000000000004'),
  ('d3000000-0000-0000-0000-000000000408', 'AR-S4-08', 'Recherche Opérationnelle',                            3, 'c3000000-0000-0000-0000-000000000004');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e3000000-0000-0000-0000-000000000401', 'AR-S4-01', 'Réseaux Informatiques 2 (Routage et Commutation)',     4.0, NULL, 'd3000000-0000-0000-0000-000000000401'),
  ('e3000000-0000-0000-0000-000000000402', 'AR-S4-02', 'Administration Systèmes Linux Avancée',                4.0, NULL, 'd3000000-0000-0000-0000-000000000402'),
  ('e3000000-0000-0000-0000-000000000403', 'AR-S4-03', 'Services Réseau (DNS, DHCP, Active Directory)',        3.0, NULL, 'd3000000-0000-0000-0000-000000000403'),
  ('e3000000-0000-0000-0000-000000000404', 'AR-S4-04', 'Virtualisation (VMware/Hyper-V)',                      3.0, NULL, 'd3000000-0000-0000-0000-000000000404'),
  ('e3000000-0000-0000-0000-000000000405', 'AR-S4-05', 'Sécurité des Réseaux — Notions de Base',              3.0, NULL, 'd3000000-0000-0000-0000-000000000405'),
  ('e3000000-0000-0000-0000-000000000406', 'AR-S4-06', 'Gestion de Projet Informatique',                      2.0, NULL, 'd3000000-0000-0000-0000-000000000406'),
  ('e3000000-0000-0000-0000-000000000407', 'AR-S4-07', 'Anglais Technique 4',                                 2.0, NULL, 'd3000000-0000-0000-0000-000000000407'),
  ('e3000000-0000-0000-0000-000000000408', 'AR-S4-08', 'Recherche Opérationnelle',                            2.0, NULL, 'd3000000-0000-0000-0000-000000000408');

-- AR — L3 S5
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d3000000-0000-0000-0000-000000000501', 'AR-S5-01', 'Administration Réseaux Avancée (Cisco CCNA)',          5, 'c3000000-0000-0000-0000-000000000005'),
  ('d3000000-0000-0000-0000-000000000502', 'AR-S5-02', 'Supervision et Monitoring Réseau',                    5, 'c3000000-0000-0000-0000-000000000005'),
  ('d3000000-0000-0000-0000-000000000503', 'AR-S5-03', 'Cloud Computing et Virtualisation Avancée',            4, 'c3000000-0000-0000-0000-000000000005'),
  ('d3000000-0000-0000-0000-000000000504', 'AR-S5-04', 'Haute Disponibilité et Sauvegarde (Clustering)',       4, 'c3000000-0000-0000-0000-000000000005'),
  ('d3000000-0000-0000-0000-000000000505', 'AR-S5-05', 'Automatisation de l''Administration (Ansible)',         4, 'c3000000-0000-0000-0000-000000000005'),
  ('d3000000-0000-0000-0000-000000000506', 'AR-S5-06', 'Législation et Éthique en Informatique',              3, 'c3000000-0000-0000-0000-000000000005'),
  ('d3000000-0000-0000-0000-000000000507', 'AR-S5-07', 'Anglais Technique 5',                                 2, 'c3000000-0000-0000-0000-000000000005'),
  ('d3000000-0000-0000-0000-000000000508', 'AR-S5-08', 'Projet Tutoré 1',                                     3, 'c3000000-0000-0000-0000-000000000005');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e3000000-0000-0000-0000-000000000501', 'AR-S5-01', 'Administration Réseaux Avancée (Cisco CCNA)',          4.0, NULL, 'd3000000-0000-0000-0000-000000000501'),
  ('e3000000-0000-0000-0000-000000000502', 'AR-S5-02', 'Supervision et Monitoring Réseau',                    4.0, NULL, 'd3000000-0000-0000-0000-000000000502'),
  ('e3000000-0000-0000-0000-000000000503', 'AR-S5-03', 'Cloud Computing et Virtualisation Avancée',            3.0, NULL, 'd3000000-0000-0000-0000-000000000503'),
  ('e3000000-0000-0000-0000-000000000504', 'AR-S5-04', 'Haute Disponibilité et Sauvegarde (Clustering)',       3.0, NULL, 'd3000000-0000-0000-0000-000000000504'),
  ('e3000000-0000-0000-0000-000000000505', 'AR-S5-05', 'Automatisation de l''Administration (Ansible)',         3.0, NULL, 'd3000000-0000-0000-0000-000000000505'),
  ('e3000000-0000-0000-0000-000000000506', 'AR-S5-06', 'Législation et Éthique en Informatique',              2.0, NULL, 'd3000000-0000-0000-0000-000000000506'),
  ('e3000000-0000-0000-0000-000000000507', 'AR-S5-07', 'Anglais Technique 5',                                 2.0, NULL, 'd3000000-0000-0000-0000-000000000507'),
  ('e3000000-0000-0000-0000-000000000508', 'AR-S5-08', 'Projet Tutoré 1',                                     2.0, NULL, 'd3000000-0000-0000-0000-000000000508');

-- AR — L3 S6
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d3000000-0000-0000-0000-000000000601', 'AR-S6-01', 'Administration Réseaux d''Entreprise (WAN/VPN/MPLS)',  5, 'c3000000-0000-0000-0000-000000000006'),
  ('d3000000-0000-0000-0000-000000000602', 'AR-S6-02', 'Datacenter et Infrastructure Cloud',                  5, 'c3000000-0000-0000-0000-000000000006'),
  ('d3000000-0000-0000-0000-000000000603', 'AR-S6-03', 'Gestion des Incidents et Support (ITIL)',              4, 'c3000000-0000-0000-0000-000000000006'),
  ('d3000000-0000-0000-0000-000000000604', 'AR-S6-04', 'Entrepreneuriat et Innovation',                       3, 'c3000000-0000-0000-0000-000000000006'),
  ('d3000000-0000-0000-0000-000000000605', 'AR-S6-05', 'Anglais Technique 6',                                 2, 'c3000000-0000-0000-0000-000000000006'),
  ('d3000000-0000-0000-0000-000000000606', 'AR-S6-06', 'Droit du Travail et Insertion Professionnelle',        2, 'c3000000-0000-0000-0000-000000000006'),
  ('d3000000-0000-0000-0000-000000000607', 'AR-S6-07', 'Mémoire / Projet de Fin d''Études',                   6, 'c3000000-0000-0000-0000-000000000006'),
  ('d3000000-0000-0000-0000-000000000608', 'AR-S6-08', 'Stage Professionnel',                                  3, 'c3000000-0000-0000-0000-000000000006');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e3000000-0000-0000-0000-000000000601', 'AR-S6-01', 'Administration Réseaux d''Entreprise (WAN/VPN/MPLS)',  4.0, NULL, 'd3000000-0000-0000-0000-000000000601'),
  ('e3000000-0000-0000-0000-000000000602', 'AR-S6-02', 'Datacenter et Infrastructure Cloud',                  4.0, NULL, 'd3000000-0000-0000-0000-000000000602'),
  ('e3000000-0000-0000-0000-000000000603', 'AR-S6-03', 'Gestion des Incidents et Support (ITIL)',              3.0, NULL, 'd3000000-0000-0000-0000-000000000603'),
  ('e3000000-0000-0000-0000-000000000604', 'AR-S6-04', 'Entrepreneuriat et Innovation',                       2.0, NULL, 'd3000000-0000-0000-0000-000000000604'),
  ('e3000000-0000-0000-0000-000000000605', 'AR-S6-05', 'Anglais Technique 6',                                 2.0, NULL, 'd3000000-0000-0000-0000-000000000605'),
  ('e3000000-0000-0000-0000-000000000606', 'AR-S6-06', 'Droit du Travail et Insertion Professionnelle',        2.0, NULL, 'd3000000-0000-0000-0000-000000000606'),
  ('e3000000-0000-0000-0000-000000000607', 'AR-S6-07', 'Mémoire / Projet de Fin d''Études',                   4.0, NULL, 'd3000000-0000-0000-0000-000000000607'),
  ('e3000000-0000-0000-0000-000000000608', 'AR-S6-08', 'Stage Professionnel',                                  3.0, NULL, 'd3000000-0000-0000-0000-000000000608');

-- ============================================================
-- RT — Licence 1 Semestre 1
-- ============================================================
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d4000000-0000-0000-0000-000000000101', 'RT-S1-01', 'Algorithmique et Structures de Données 1',             5, 'c4000000-0000-0000-0000-000000000001'),
  ('d4000000-0000-0000-0000-000000000102', 'RT-S1-02', 'Introduction à la Programmation (Langage C)',          5, 'c4000000-0000-0000-0000-000000000001'),
  ('d4000000-0000-0000-0000-000000000103', 'RT-S1-03', 'Mathématiques pour l''Informatique 1',                 4, 'c4000000-0000-0000-0000-000000000001'),
  ('d4000000-0000-0000-0000-000000000104', 'RT-S1-04', 'Architecture des Ordinateurs',                         4, 'c4000000-0000-0000-0000-000000000001'),
  ('d4000000-0000-0000-0000-000000000105', 'RT-S1-05', 'Électricité et Électronique Générale',                 4, 'c4000000-0000-0000-0000-000000000001'),
  ('d4000000-0000-0000-0000-000000000106', 'RT-S1-06', 'Anglais Technique 1',                                 3, 'c4000000-0000-0000-0000-000000000001'),
  ('d4000000-0000-0000-0000-000000000107', 'RT-S1-07', 'Communication et Expression Écrite',                   2, 'c4000000-0000-0000-0000-000000000001'),
  ('d4000000-0000-0000-0000-000000000108', 'RT-S1-08', 'Outils Bureautiques et Informatique Générale',         3, 'c4000000-0000-0000-0000-000000000001');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e4000000-0000-0000-0000-000000000101', 'RT-S1-01', 'Algorithmique et Structures de Données 1',             4.0, NULL, 'd4000000-0000-0000-0000-000000000101'),
  ('e4000000-0000-0000-0000-000000000102', 'RT-S1-02', 'Introduction à la Programmation (Langage C)',          4.0, NULL, 'd4000000-0000-0000-0000-000000000102'),
  ('e4000000-0000-0000-0000-000000000103', 'RT-S1-03', 'Mathématiques pour l''Informatique 1',                 3.0, NULL, 'd4000000-0000-0000-0000-000000000103'),
  ('e4000000-0000-0000-0000-000000000104', 'RT-S1-04', 'Architecture des Ordinateurs',                         3.0, NULL, 'd4000000-0000-0000-0000-000000000104'),
  ('e4000000-0000-0000-0000-000000000105', 'RT-S1-05', 'Électricité et Électronique Générale',                 3.0, NULL, 'd4000000-0000-0000-0000-000000000105'),
  ('e4000000-0000-0000-0000-000000000106', 'RT-S1-06', 'Anglais Technique 1',                                 2.0, NULL, 'd4000000-0000-0000-0000-000000000106'),
  ('e4000000-0000-0000-0000-000000000107', 'RT-S1-07', 'Communication et Expression Écrite',                   2.0, NULL, 'd4000000-0000-0000-0000-000000000107'),
  ('e4000000-0000-0000-0000-000000000108', 'RT-S1-08', 'Outils Bureautiques et Informatique Générale',         2.0, NULL, 'd4000000-0000-0000-0000-000000000108');

-- RT — L1 S2
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d4000000-0000-0000-0000-000000000201', 'RT-S2-01', 'Algorithmique et Structures de Données 2',             5, 'c4000000-0000-0000-0000-000000000002'),
  ('d4000000-0000-0000-0000-000000000202', 'RT-S2-02', 'Programmation Orientée Objet (Java)',                  5, 'c4000000-0000-0000-0000-000000000002'),
  ('d4000000-0000-0000-0000-000000000203', 'RT-S2-03', 'Mathématiques pour l''Informatique 2',                 4, 'c4000000-0000-0000-0000-000000000002'),
  ('d4000000-0000-0000-0000-000000000204', 'RT-S2-04', 'Systèmes d''Exploitation (Linux)',                     4, 'c4000000-0000-0000-0000-000000000002'),
  ('d4000000-0000-0000-0000-000000000205', 'RT-S2-05', 'Introduction aux Réseaux et Télécoms',                 4, 'c4000000-0000-0000-0000-000000000002'),
  ('d4000000-0000-0000-0000-000000000206', 'RT-S2-06', 'Électronique Numérique',                              3, 'c4000000-0000-0000-0000-000000000002'),
  ('d4000000-0000-0000-0000-000000000207', 'RT-S2-07', 'Anglais Technique 2',                                 2, 'c4000000-0000-0000-0000-000000000002'),
  ('d4000000-0000-0000-0000-000000000208', 'RT-S2-08', 'Droit et Éthique de l''Informatique',                  3, 'c4000000-0000-0000-0000-000000000002');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e4000000-0000-0000-0000-000000000201', 'RT-S2-01', 'Algorithmique et Structures de Données 2',             4.0, NULL, 'd4000000-0000-0000-0000-000000000201'),
  ('e4000000-0000-0000-0000-000000000202', 'RT-S2-02', 'Programmation Orientée Objet (Java)',                  4.0, NULL, 'd4000000-0000-0000-0000-000000000202'),
  ('e4000000-0000-0000-0000-000000000203', 'RT-S2-03', 'Mathématiques pour l''Informatique 2',                 3.0, NULL, 'd4000000-0000-0000-0000-000000000203'),
  ('e4000000-0000-0000-0000-000000000204', 'RT-S2-04', 'Systèmes d''Exploitation (Linux)',                     3.0, NULL, 'd4000000-0000-0000-0000-000000000204'),
  ('e4000000-0000-0000-0000-000000000205', 'RT-S2-05', 'Introduction aux Réseaux et Télécoms',                 3.0, NULL, 'd4000000-0000-0000-0000-000000000205'),
  ('e4000000-0000-0000-0000-000000000206', 'RT-S2-06', 'Électronique Numérique',                              2.0, NULL, 'd4000000-0000-0000-0000-000000000206'),
  ('e4000000-0000-0000-0000-000000000207', 'RT-S2-07', 'Anglais Technique 2',                                 2.0, NULL, 'd4000000-0000-0000-0000-000000000207'),
  ('e4000000-0000-0000-0000-000000000208', 'RT-S2-08', 'Droit et Éthique de l''Informatique',                  2.0, NULL, 'd4000000-0000-0000-0000-000000000208');

-- RT — L2 S3
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d4000000-0000-0000-0000-000000000301', 'RT-S3-01', 'Réseaux Informatiques 1 (Modèle OSI/TCP-IP)',         5, 'c4000000-0000-0000-0000-000000000003'),
  ('d4000000-0000-0000-0000-000000000302', 'RT-S3-02', 'Théorie du Signal et Transmission',                   5, 'c4000000-0000-0000-0000-000000000003'),
  ('d4000000-0000-0000-0000-000000000303', 'RT-S3-03', 'Bases de Données',                                     4, 'c4000000-0000-0000-0000-000000000003'),
  ('d4000000-0000-0000-0000-000000000304', 'RT-S3-04', 'Câblage et Infrastructures Réseau',                    4, 'c4000000-0000-0000-0000-000000000003'),
  ('d4000000-0000-0000-0000-000000000305', 'RT-S3-05', 'Systèmes d''Exploitation Serveurs',                    4, 'c4000000-0000-0000-0000-000000000003'),
  ('d4000000-0000-0000-0000-000000000306', 'RT-S3-06', 'Mathématiques Discrètes et Théorie de l''Information',3, 'c4000000-0000-0000-0000-000000000003'),
  ('d4000000-0000-0000-0000-000000000307', 'RT-S3-07', 'Anglais Technique 3',                                 2, 'c4000000-0000-0000-0000-000000000003'),
  ('d4000000-0000-0000-0000-000000000308', 'RT-S3-08', 'Probabilités et Statistiques',                        3, 'c4000000-0000-0000-0000-000000000003');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e4000000-0000-0000-0000-000000000301', 'RT-S3-01', 'Réseaux Informatiques 1 (Modèle OSI/TCP-IP)',         4.0, NULL, 'd4000000-0000-0000-0000-000000000301'),
  ('e4000000-0000-0000-0000-000000000302', 'RT-S3-02', 'Théorie du Signal et Transmission',                   4.0, NULL, 'd4000000-0000-0000-0000-000000000302'),
  ('e4000000-0000-0000-0000-000000000303', 'RT-S3-03', 'Bases de Données',                                     3.0, NULL, 'd4000000-0000-0000-0000-000000000303'),
  ('e4000000-0000-0000-0000-000000000304', 'RT-S3-04', 'Câblage et Infrastructures Réseau',                    3.0, NULL, 'd4000000-0000-0000-0000-000000000304'),
  ('e4000000-0000-0000-0000-000000000305', 'RT-S3-05', 'Systèmes d''Exploitation Serveurs',                    3.0, NULL, 'd4000000-0000-0000-0000-000000000305'),
  ('e4000000-0000-0000-0000-000000000306', 'RT-S3-06', 'Mathématiques Discrètes et Théorie de l''Information',2.0, NULL, 'd4000000-0000-0000-0000-000000000306'),
  ('e4000000-0000-0000-0000-000000000307', 'RT-S3-07', 'Anglais Technique 3',                                 2.0, NULL, 'd4000000-0000-0000-0000-000000000307'),
  ('e4000000-0000-0000-0000-000000000308', 'RT-S3-08', 'Probabilités et Statistiques',                        2.0, NULL, 'd4000000-0000-0000-0000-000000000308');

-- RT — L2 S4
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d4000000-0000-0000-0000-000000000401', 'RT-S4-01', 'Réseaux Informatiques 2 (Routage et Commutation)',     5, 'c4000000-0000-0000-0000-000000000004'),
  ('d4000000-0000-0000-0000-000000000402', 'RT-S4-02', 'Télécommunications Mobiles (GSM, 3G/4G)',             5, 'c4000000-0000-0000-0000-000000000004'),
  ('d4000000-0000-0000-0000-000000000403', 'RT-S4-03', 'Réseaux Sans Fil (WiFi, Bluetooth)',                   4, 'c4000000-0000-0000-0000-000000000004'),
  ('d4000000-0000-0000-0000-000000000404', 'RT-S4-04', 'Transmission de Données et Modulation',                4, 'c4000000-0000-0000-0000-000000000004'),
  ('d4000000-0000-0000-0000-000000000405', 'RT-S4-05', 'Sécurité des Réseaux — Notions de Base',              4, 'c4000000-0000-0000-0000-000000000004'),
  ('d4000000-0000-0000-0000-000000000406', 'RT-S4-06', 'Gestion de Projet Informatique',                      3, 'c4000000-0000-0000-0000-000000000004'),
  ('d4000000-0000-0000-0000-000000000407', 'RT-S4-07', 'Anglais Technique 4',                                 2, 'c4000000-0000-0000-0000-000000000004'),
  ('d4000000-0000-0000-0000-000000000408', 'RT-S4-08', 'Recherche Opérationnelle',                            3, 'c4000000-0000-0000-0000-000000000004');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e4000000-0000-0000-0000-000000000401', 'RT-S4-01', 'Réseaux Informatiques 2 (Routage et Commutation)',     4.0, NULL, 'd4000000-0000-0000-0000-000000000401'),
  ('e4000000-0000-0000-0000-000000000402', 'RT-S4-02', 'Télécommunications Mobiles (GSM, 3G/4G)',             4.0, NULL, 'd4000000-0000-0000-0000-000000000402'),
  ('e4000000-0000-0000-0000-000000000403', 'RT-S4-03', 'Réseaux Sans Fil (WiFi, Bluetooth)',                   3.0, NULL, 'd4000000-0000-0000-0000-000000000403'),
  ('e4000000-0000-0000-0000-000000000404', 'RT-S4-04', 'Transmission de Données et Modulation',                3.0, NULL, 'd4000000-0000-0000-0000-000000000404'),
  ('e4000000-0000-0000-0000-000000000405', 'RT-S4-05', 'Sécurité des Réseaux — Notions de Base',              3.0, NULL, 'd4000000-0000-0000-0000-000000000405'),
  ('e4000000-0000-0000-0000-000000000406', 'RT-S4-06', 'Gestion de Projet Informatique',                      2.0, NULL, 'd4000000-0000-0000-0000-000000000406'),
  ('e4000000-0000-0000-0000-000000000407', 'RT-S4-07', 'Anglais Technique 4',                                 2.0, NULL, 'd4000000-0000-0000-0000-000000000407'),
  ('e4000000-0000-0000-0000-000000000408', 'RT-S4-08', 'Recherche Opérationnelle',                            2.0, NULL, 'd4000000-0000-0000-0000-000000000408');

-- RT — L3 S5
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d4000000-0000-0000-0000-000000000501', 'RT-S5-01', 'Réseaux d''Opérateurs et Cœur de Réseau',              5, 'c4000000-0000-0000-0000-000000000005'),
  ('d4000000-0000-0000-0000-000000000502', 'RT-S5-02', 'Voix sur IP (VoIP) et IPTV',                          5, 'c4000000-0000-0000-0000-000000000005'),
  ('d4000000-0000-0000-0000-000000000503', 'RT-S5-03', 'Réseaux Mobiles Avancés (4G/5G)',                     4, 'c4000000-0000-0000-0000-000000000005'),
  ('d4000000-0000-0000-0000-000000000504', 'RT-S5-04', 'Fibre Optique et Réseaux Haut Débit',                  4, 'c4000000-0000-0000-0000-000000000005'),
  ('d4000000-0000-0000-0000-000000000505', 'RT-S5-05', 'Supervision et Qualité de Service (QoS)',              4, 'c4000000-0000-0000-0000-000000000005'),
  ('d4000000-0000-0000-0000-000000000506', 'RT-S5-06', 'Législation des Télécommunications',                   3, 'c4000000-0000-0000-0000-000000000005'),
  ('d4000000-0000-0000-0000-000000000507', 'RT-S5-07', 'Anglais Technique 5',                                 2, 'c4000000-0000-0000-0000-000000000005'),
  ('d4000000-0000-0000-0000-000000000508', 'RT-S5-08', 'Projet Tutoré 1',                                     3, 'c4000000-0000-0000-0000-000000000005');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e4000000-0000-0000-0000-000000000501', 'RT-S5-01', 'Réseaux d''Opérateurs et Cœur de Réseau',              4.0, NULL, 'd4000000-0000-0000-0000-000000000501'),
  ('e4000000-0000-0000-0000-000000000502', 'RT-S5-02', 'Voix sur IP (VoIP) et IPTV',                          4.0, NULL, 'd4000000-0000-0000-0000-000000000502'),
  ('e4000000-0000-0000-0000-000000000503', 'RT-S5-03', 'Réseaux Mobiles Avancés (4G/5G)',                     3.0, NULL, 'd4000000-0000-0000-0000-000000000503'),
  ('e4000000-0000-0000-0000-000000000504', 'RT-S5-04', 'Fibre Optique et Réseaux Haut Débit',                  3.0, NULL, 'd4000000-0000-0000-0000-000000000504'),
  ('e4000000-0000-0000-0000-000000000505', 'RT-S5-05', 'Supervision et Qualité de Service (QoS)',              3.0, NULL, 'd4000000-0000-0000-0000-000000000505'),
  ('e4000000-0000-0000-0000-000000000506', 'RT-S5-06', 'Législation des Télécommunications',                   2.0, NULL, 'd4000000-0000-0000-0000-000000000506'),
  ('e4000000-0000-0000-0000-000000000507', 'RT-S5-07', 'Anglais Technique 5',                                 2.0, NULL, 'd4000000-0000-0000-0000-000000000507'),
  ('e4000000-0000-0000-0000-000000000508', 'RT-S5-08', 'Projet Tutoré 1',                                     2.0, NULL, 'd4000000-0000-0000-0000-000000000508');

-- RT — L3 S6
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d4000000-0000-0000-0000-000000000601', 'RT-S6-01', 'Réseaux de Nouvelle Génération (NGN) et Cloud',        5, 'c4000000-0000-0000-0000-000000000006'),
  ('d4000000-0000-0000-0000-000000000602', 'RT-S6-02', 'Sécurité des Réseaux de Télécommunications',           5, 'c4000000-0000-0000-0000-000000000006'),
  ('d4000000-0000-0000-0000-000000000603', 'RT-S6-03', 'Ingénierie des Réseaux et Dimensionnement',           4, 'c4000000-0000-0000-0000-000000000006'),
  ('d4000000-0000-0000-0000-000000000604', 'RT-S6-04', 'Entrepreneuriat et Innovation',                       3, 'c4000000-0000-0000-0000-000000000006'),
  ('d4000000-0000-0000-0000-000000000605', 'RT-S6-05', 'Anglais Technique 6',                                 2, 'c4000000-0000-0000-0000-000000000006'),
  ('d4000000-0000-0000-0000-000000000606', 'RT-S6-06', 'Droit du Travail et Insertion Professionnelle',        2, 'c4000000-0000-0000-0000-000000000006'),
  ('d4000000-0000-0000-0000-000000000607', 'RT-S6-07', 'Mémoire / Projet de Fin d''Études',                   6, 'c4000000-0000-0000-0000-000000000006'),
  ('d4000000-0000-0000-0000-000000000608', 'RT-S6-08', 'Stage Professionnel',                                  3, 'c4000000-0000-0000-0000-000000000006');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e4000000-0000-0000-0000-000000000601', 'RT-S6-01', 'Réseaux de Nouvelle Génération (NGN) et Cloud',        4.0, NULL, 'd4000000-0000-0000-0000-000000000601'),
  ('e4000000-0000-0000-0000-000000000602', 'RT-S6-02', 'Sécurité des Réseaux de Télécommunications',           4.0, NULL, 'd4000000-0000-0000-0000-000000000602'),
  ('e4000000-0000-0000-0000-000000000603', 'RT-S6-03', 'Ingénierie des Réseaux et Dimensionnement',           3.0, NULL, 'd4000000-0000-0000-0000-000000000603'),
  ('e4000000-0000-0000-0000-000000000604', 'RT-S6-04', 'Entrepreneuriat et Innovation',                       2.0, NULL, 'd4000000-0000-0000-0000-000000000604'),
  ('e4000000-0000-0000-0000-000000000605', 'RT-S6-05', 'Anglais Technique 6',                                 2.0, NULL, 'd4000000-0000-0000-0000-000000000605'),
  ('e4000000-0000-0000-0000-000000000606', 'RT-S6-06', 'Droit du Travail et Insertion Professionnelle',        2.0, NULL, 'd4000000-0000-0000-0000-000000000606'),
  ('e4000000-0000-0000-0000-000000000607', 'RT-S6-07', 'Mémoire / Projet de Fin d''Études',                   4.0, NULL, 'd4000000-0000-0000-0000-000000000607'),
  ('e4000000-0000-0000-0000-000000000608', 'RT-S6-08', 'Stage Professionnel',                                  3.0, NULL, 'd4000000-0000-0000-0000-000000000608');

-- ============================================================
-- IG — Licence 1 Semestre 1
-- ============================================================
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d5000000-0000-0000-0000-000000000101', 'IG-S1-01', 'Algorithmique et Structures de Données 1',             5, 'c5000000-0000-0000-0000-000000000001'),
  ('d5000000-0000-0000-0000-000000000102', 'IG-S1-02', 'Introduction à la Programmation (Langage C)',          5, 'c5000000-0000-0000-0000-000000000001'),
  ('d5000000-0000-0000-0000-000000000103', 'IG-S1-03', 'Mathématiques pour l''Informatique 1',                 4, 'c5000000-0000-0000-0000-000000000001'),
  ('d5000000-0000-0000-0000-000000000104', 'IG-S1-04', 'Introduction à la Gestion des Entreprises',            4, 'c5000000-0000-0000-0000-000000000001'),
  ('d5000000-0000-0000-0000-000000000105', 'IG-S1-05', 'Comptabilité Générale 1',                              4, 'c5000000-0000-0000-0000-000000000001'),
  ('d5000000-0000-0000-0000-000000000106', 'IG-S1-06', 'Anglais Technique 1',                                 3, 'c5000000-0000-0000-0000-000000000001'),
  ('d5000000-0000-0000-0000-000000000107', 'IG-S1-07', 'Communication et Expression Écrite',                   2, 'c5000000-0000-0000-0000-000000000001'),
  ('d5000000-0000-0000-0000-000000000108', 'IG-S1-08', 'Outils Bureautiques et Informatique Générale',         3, 'c5000000-0000-0000-0000-000000000001');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e5000000-0000-0000-0000-000000000101', 'IG-S1-01', 'Algorithmique et Structures de Données 1',             4.0, NULL, 'd5000000-0000-0000-0000-000000000101'),
  ('e5000000-0000-0000-0000-000000000102', 'IG-S1-02', 'Introduction à la Programmation (Langage C)',          4.0, NULL, 'd5000000-0000-0000-0000-000000000102'),
  ('e5000000-0000-0000-0000-000000000103', 'IG-S1-03', 'Mathématiques pour l''Informatique 1',                 3.0, NULL, 'd5000000-0000-0000-0000-000000000103'),
  ('e5000000-0000-0000-0000-000000000104', 'IG-S1-04', 'Introduction à la Gestion des Entreprises',            3.0, NULL, 'd5000000-0000-0000-0000-000000000104'),
  ('e5000000-0000-0000-0000-000000000105', 'IG-S1-05', 'Comptabilité Générale 1',                              3.0, NULL, 'd5000000-0000-0000-0000-000000000105'),
  ('e5000000-0000-0000-0000-000000000106', 'IG-S1-06', 'Anglais Technique 1',                                 2.0, NULL, 'd5000000-0000-0000-0000-000000000106'),
  ('e5000000-0000-0000-0000-000000000107', 'IG-S1-07', 'Communication et Expression Écrite',                   2.0, NULL, 'd5000000-0000-0000-0000-000000000107'),
  ('e5000000-0000-0000-0000-000000000108', 'IG-S1-08', 'Outils Bureautiques et Informatique Générale',         2.0, NULL, 'd5000000-0000-0000-0000-000000000108');

-- IG — L1 S2
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d5000000-0000-0000-0000-000000000201', 'IG-S2-01', 'Algorithmique et Structures de Données 2',             5, 'c5000000-0000-0000-0000-000000000002'),
  ('d5000000-0000-0000-0000-000000000202', 'IG-S2-02', 'Programmation Orientée Objet (Java)',                  5, 'c5000000-0000-0000-0000-000000000002'),
  ('d5000000-0000-0000-0000-000000000203', 'IG-S2-03', 'Mathématiques Financières',                            4, 'c5000000-0000-0000-0000-000000000002'),
  ('d5000000-0000-0000-0000-000000000204', 'IG-S2-04', 'Comptabilité Générale 2',                              4, 'c5000000-0000-0000-0000-000000000002'),
  ('d5000000-0000-0000-0000-000000000205', 'IG-S2-05', 'Introduction aux Bases de Données',                    4, 'c5000000-0000-0000-0000-000000000002'),
  ('d5000000-0000-0000-0000-000000000206', 'IG-S2-06', 'Microéconomie',                                        3, 'c5000000-0000-0000-0000-000000000002'),
  ('d5000000-0000-0000-0000-000000000207', 'IG-S2-07', 'Anglais Technique 2',                                 2, 'c5000000-0000-0000-0000-000000000002'),
  ('d5000000-0000-0000-0000-000000000208', 'IG-S2-08', 'Droit et Éthique de l''Informatique',                  3, 'c5000000-0000-0000-0000-000000000002');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e5000000-0000-0000-0000-000000000201', 'IG-S2-01', 'Algorithmique et Structures de Données 2',             4.0, NULL, 'd5000000-0000-0000-0000-000000000201'),
  ('e5000000-0000-0000-0000-000000000202', 'IG-S2-02', 'Programmation Orientée Objet (Java)',                  4.0, NULL, 'd5000000-0000-0000-0000-000000000202'),
  ('e5000000-0000-0000-0000-000000000203', 'IG-S2-03', 'Mathématiques Financières',                            3.0, NULL, 'd5000000-0000-0000-0000-000000000203'),
  ('e5000000-0000-0000-0000-000000000204', 'IG-S2-04', 'Comptabilité Générale 2',                              3.0, NULL, 'd5000000-0000-0000-0000-000000000204'),
  ('e5000000-0000-0000-0000-000000000205', 'IG-S2-05', 'Introduction aux Bases de Données',                    3.0, NULL, 'd5000000-0000-0000-0000-000000000205'),
  ('e5000000-0000-0000-0000-000000000206', 'IG-S2-06', 'Microéconomie',                                        2.0, NULL, 'd5000000-0000-0000-0000-000000000206'),
  ('e5000000-0000-0000-0000-000000000207', 'IG-S2-07', 'Anglais Technique 2',                                 2.0, NULL, 'd5000000-0000-0000-0000-000000000207'),
  ('e5000000-0000-0000-0000-000000000208', 'IG-S2-08', 'Droit et Éthique de l''Informatique',                  2.0, NULL, 'd5000000-0000-0000-0000-000000000208');

-- IG — L2 S3
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d5000000-0000-0000-0000-000000000301', 'IG-S3-01', 'Bases de Données Avancées (SQL)',                      5, 'c5000000-0000-0000-0000-000000000003'),
  ('d5000000-0000-0000-0000-000000000302', 'IG-S3-02', 'Programmation Orientée Objet Avancée',                 5, 'c5000000-0000-0000-0000-000000000003'),
  ('d5000000-0000-0000-0000-000000000303', 'IG-S3-03', 'Comptabilité Analytique et de Gestion',                4, 'c5000000-0000-0000-0000-000000000003'),
  ('d5000000-0000-0000-0000-000000000304', 'IG-S3-04', 'Analyse et Conception des Systèmes d''Info (UML)',      4, 'c5000000-0000-0000-0000-000000000003'),
  ('d5000000-0000-0000-0000-000000000305', 'IG-S3-05', 'Statistiques Appliquées à la Gestion',                 4, 'c5000000-0000-0000-0000-000000000003'),
  ('d5000000-0000-0000-0000-000000000306', 'IG-S3-06', 'Macroéconomie',                                        3, 'c5000000-0000-0000-0000-000000000003'),
  ('d5000000-0000-0000-0000-000000000307', 'IG-S3-07', 'Anglais Technique 3',                                 2, 'c5000000-0000-0000-0000-000000000003'),
  ('d5000000-0000-0000-0000-000000000308', 'IG-S3-08', 'Réseaux Informatiques — Notions de Base',              3, 'c5000000-0000-0000-0000-000000000003');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e5000000-0000-0000-0000-000000000301', 'IG-S3-01', 'Bases de Données Avancées (SQL)',                      4.0, NULL, 'd5000000-0000-0000-0000-000000000301'),
  ('e5000000-0000-0000-0000-000000000302', 'IG-S3-02', 'Programmation Orientée Objet Avancée',                 4.0, NULL, 'd5000000-0000-0000-0000-000000000302'),
  ('e5000000-0000-0000-0000-000000000303', 'IG-S3-03', 'Comptabilité Analytique et de Gestion',                3.0, NULL, 'd5000000-0000-0000-0000-000000000303'),
  ('e5000000-0000-0000-0000-000000000304', 'IG-S3-04', 'Analyse et Conception des Systèmes d''Info (UML)',      3.0, NULL, 'd5000000-0000-0000-0000-000000000304'),
  ('e5000000-0000-0000-0000-000000000305', 'IG-S3-05', 'Statistiques Appliquées à la Gestion',                 3.0, NULL, 'd5000000-0000-0000-0000-000000000305'),
  ('e5000000-0000-0000-0000-000000000306', 'IG-S3-06', 'Macroéconomie',                                        2.0, NULL, 'd5000000-0000-0000-0000-000000000306'),
  ('e5000000-0000-0000-0000-000000000307', 'IG-S3-07', 'Anglais Technique 3',                                 2.0, NULL, 'd5000000-0000-0000-0000-000000000307'),
  ('e5000000-0000-0000-0000-000000000308', 'IG-S3-08', 'Réseaux Informatiques — Notions de Base',              2.0, NULL, 'd5000000-0000-0000-0000-000000000308');

-- IG — L2 S4
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d5000000-0000-0000-0000-000000000401', 'IG-S4-01', 'Programmation Web pour la Gestion (PHP/MySQL)',         5, 'c5000000-0000-0000-0000-000000000004'),
  ('d5000000-0000-0000-0000-000000000402', 'IG-S4-02', 'Systèmes d''Information de Gestion (SIG)',             5, 'c5000000-0000-0000-0000-000000000004'),
  ('d5000000-0000-0000-0000-000000000403', 'IG-S4-03', 'Contrôle de Gestion',                                  4, 'c5000000-0000-0000-0000-000000000004'),
  ('d5000000-0000-0000-0000-000000000404', 'IG-S4-04', 'Gestion des Ressources Humaines',                      4, 'c5000000-0000-0000-0000-000000000004'),
  ('d5000000-0000-0000-0000-000000000405', 'IG-S4-05', 'Marketing et Techniques Commerciales',                  4, 'c5000000-0000-0000-0000-000000000004'),
  ('d5000000-0000-0000-0000-000000000406', 'IG-S4-06', 'Gestion de Projet Informatique',                      3, 'c5000000-0000-0000-0000-000000000004'),
  ('d5000000-0000-0000-0000-000000000407', 'IG-S4-07', 'Anglais Technique 4',                                 2, 'c5000000-0000-0000-0000-000000000004'),
  ('d5000000-0000-0000-0000-000000000408', 'IG-S4-08', 'Recherche Opérationnelle',                            3, 'c5000000-0000-0000-0000-000000000004');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e5000000-0000-0000-0000-000000000401', 'IG-S4-01', 'Programmation Web pour la Gestion (PHP/MySQL)',         4.0, NULL, 'd5000000-0000-0000-0000-000000000401'),
  ('e5000000-0000-0000-0000-000000000402', 'IG-S4-02', 'Systèmes d''Information de Gestion (SIG)',             4.0, NULL, 'd5000000-0000-0000-0000-000000000402'),
  ('e5000000-0000-0000-0000-000000000403', 'IG-S4-03', 'Contrôle de Gestion',                                  3.0, NULL, 'd5000000-0000-0000-0000-000000000403'),
  ('e5000000-0000-0000-0000-000000000404', 'IG-S4-04', 'Gestion des Ressources Humaines',                      3.0, NULL, 'd5000000-0000-0000-0000-000000000404'),
  ('e5000000-0000-0000-0000-000000000405', 'IG-S4-05', 'Marketing et Techniques Commerciales',                  3.0, NULL, 'd5000000-0000-0000-0000-000000000405'),
  ('e5000000-0000-0000-0000-000000000406', 'IG-S4-06', 'Gestion de Projet Informatique',                      2.0, NULL, 'd5000000-0000-0000-0000-000000000406'),
  ('e5000000-0000-0000-0000-000000000407', 'IG-S4-07', 'Anglais Technique 4',                                 2.0, NULL, 'd5000000-0000-0000-0000-000000000407'),
  ('e5000000-0000-0000-0000-000000000408', 'IG-S4-08', 'Recherche Opérationnelle',                            2.0, NULL, 'd5000000-0000-0000-0000-000000000408');

-- IG — L3 S5
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d5000000-0000-0000-0000-000000000501', 'IG-S5-01', 'Progiciels de Gestion Intégrée (ERP)',                  5, 'c5000000-0000-0000-0000-000000000005'),
  ('d5000000-0000-0000-0000-000000000502', 'IG-S5-02', 'Business Intelligence et Data Analytics',               5, 'c5000000-0000-0000-0000-000000000005'),
  ('d5000000-0000-0000-0000-000000000503', 'IG-S5-03', 'Audit et Sécurité des Systèmes d''Information',        4, 'c5000000-0000-0000-0000-000000000005'),
  ('d5000000-0000-0000-0000-000000000504', 'IG-S5-04', 'Gestion Financière et Comptable Assistée par Ordinateur', 4, 'c5000000-0000-0000-0000-000000000005'),
  ('d5000000-0000-0000-0000-000000000505', 'IG-S5-05', 'E-commerce et Transformation Digitale',                4, 'c5000000-0000-0000-0000-000000000005'),
  ('d5000000-0000-0000-0000-000000000506', 'IG-S5-06', 'Droit des Affaires et Fiscalité',                      3, 'c5000000-0000-0000-0000-000000000005'),
  ('d5000000-0000-0000-0000-000000000507', 'IG-S5-07', 'Anglais Technique 5',                                 2, 'c5000000-0000-0000-0000-000000000005'),
  ('d5000000-0000-0000-0000-000000000508', 'IG-S5-08', 'Projet Tutoré 1',                                     3, 'c5000000-0000-0000-0000-000000000005');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e5000000-0000-0000-0000-000000000501', 'IG-S5-01', 'Progiciels de Gestion Intégrée (ERP)',                  4.0, NULL, 'd5000000-0000-0000-0000-000000000501'),
  ('e5000000-0000-0000-0000-000000000502', 'IG-S5-02', 'Business Intelligence et Data Analytics',               4.0, NULL, 'd5000000-0000-0000-0000-000000000502'),
  ('e5000000-0000-0000-0000-000000000503', 'IG-S5-03', 'Audit et Sécurité des Systèmes d''Information',        3.0, NULL, 'd5000000-0000-0000-0000-000000000503'),
  ('e5000000-0000-0000-0000-000000000504', 'IG-S5-04', 'Gestion Financière et Comptable Assistée par Ordinateur', 3.0, NULL, 'd5000000-0000-0000-0000-000000000504'),
  ('e5000000-0000-0000-0000-000000000505', 'IG-S5-05', 'E-commerce et Transformation Digitale',                3.0, NULL, 'd5000000-0000-0000-0000-000000000505'),
  ('e5000000-0000-0000-0000-000000000506', 'IG-S5-06', 'Droit des Affaires et Fiscalité',                      2.0, NULL, 'd5000000-0000-0000-0000-000000000506'),
  ('e5000000-0000-0000-0000-000000000507', 'IG-S5-07', 'Anglais Technique 5',                                 2.0, NULL, 'd5000000-0000-0000-0000-000000000507'),
  ('e5000000-0000-0000-0000-000000000508', 'IG-S5-08', 'Projet Tutoré 1',                                     2.0, NULL, 'd5000000-0000-0000-0000-000000000508');

-- IG — L3 S6
INSERT INTO unites_enseignement (id, code, intitule, credits_ects, semestre_id) VALUES
  ('d5000000-0000-0000-0000-000000000601', 'IG-S6-01', 'Data Warehouse et Aide à la Décision',                 5, 'c5000000-0000-0000-0000-000000000006'),
  ('d5000000-0000-0000-0000-000000000602', 'IG-S6-02', 'Gouvernance des Systèmes d''Information',              5, 'c5000000-0000-0000-0000-000000000006'),
  ('d5000000-0000-0000-0000-000000000603', 'IG-S6-03', 'Management des Organisations',                          4, 'c5000000-0000-0000-0000-000000000006'),
  ('d5000000-0000-0000-0000-000000000604', 'IG-S6-04', 'Entrepreneuriat et Innovation',                       3, 'c5000000-0000-0000-0000-000000000006'),
  ('d5000000-0000-0000-0000-000000000605', 'IG-S6-05', 'Anglais Technique 6',                                 2, 'c5000000-0000-0000-0000-000000000006'),
  ('d5000000-0000-0000-0000-000000000606', 'IG-S6-06', 'Droit du Travail et Insertion Professionnelle',        2, 'c5000000-0000-0000-0000-000000000006'),
  ('d5000000-0000-0000-0000-000000000607', 'IG-S6-07', 'Mémoire / Projet de Fin d''Études',                   6, 'c5000000-0000-0000-0000-000000000006'),
  ('d5000000-0000-0000-0000-000000000608', 'IG-S6-08', 'Stage Professionnel',                                  3, 'c5000000-0000-0000-0000-000000000006');
INSERT INTO matieres (id, code, intitule, coefficient, volume_horaire, ue_id) VALUES
  ('e5000000-0000-0000-0000-000000000601', 'IG-S6-01', 'Data Warehouse et Aide à la Décision',                 4.0, NULL, 'd5000000-0000-0000-0000-000000000601'),
  ('e5000000-0000-0000-0000-000000000602', 'IG-S6-02', 'Gouvernance des Systèmes d''Information',              4.0, NULL, 'd5000000-0000-0000-0000-000000000602'),
  ('e5000000-0000-0000-0000-000000000603', 'IG-S6-03', 'Management des Organisations',                          3.0, NULL, 'd5000000-0000-0000-0000-000000000603'),
  ('e5000000-0000-0000-0000-000000000604', 'IG-S6-04', 'Entrepreneuriat et Innovation',                       2.0, NULL, 'd5000000-0000-0000-0000-000000000604'),
  ('e5000000-0000-0000-0000-000000000605', 'IG-S6-05', 'Anglais Technique 6',                                 2.0, NULL, 'd5000000-0000-0000-0000-000000000605'),
  ('e5000000-0000-0000-0000-000000000606', 'IG-S6-06', 'Droit du Travail et Insertion Professionnelle',        2.0, NULL, 'd5000000-0000-0000-0000-000000000606'),
  ('e5000000-0000-0000-0000-000000000607', 'IG-S6-07', 'Mémoire / Projet de Fin d''Études',                   4.0, NULL, 'd5000000-0000-0000-0000-000000000607'),
  ('e5000000-0000-0000-0000-000000000608', 'IG-S6-08', 'Stage Professionnel',                                  3.0, NULL, 'd5000000-0000-0000-0000-000000000608');
