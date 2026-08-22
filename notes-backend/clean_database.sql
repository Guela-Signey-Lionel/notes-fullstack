-- ============================================================
-- clean_database.sql — Nettoie TOUT pour un démarrage Flyway propre
-- Exécuter en tant que superutilisateur sur la base notes_db
-- ============================================================

-- Supprimer toutes les tables (dans l'ordre des dépendances)
DROP TABLE IF EXISTS releves CASCADE;
DROP TABLE IF EXISTS historique_notes CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS moyennes_calculees CASCADE;
DROP TABLE IF EXISTS matieres CASCADE;
DROP TABLE IF EXISTS unites_enseignement CASCADE;
DROP TABLE IF EXISTS semestres CASCADE;
DROP TABLE IF EXISTS inscriptions_promotions CASCADE;
DROP TABLE IF EXISTS promotions CASCADE;
DROP TABLE IF EXISTS filieres CASCADE;
DROP TABLE IF EXISTS enseignants CASCADE;
DROP TABLE IF EXISTS etudiants CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS utilisateurs CASCADE;

-- Supprimer les types enum
DROP TYPE IF EXISTS statut_note_enum CASCADE;
DROP TYPE IF EXISTS niveau_filiere CASCADE;
DROP TYPE IF EXISTS mention_enum CASCADE;
DROP TYPE IF EXISTS type_note CASCADE;
DROP TYPE IF EXISTS statut_semestre CASCADE;
DROP TYPE IF EXISTS role_utilisateur CASCADE;

-- Supprimer l'historique Flyway
DROP TABLE IF EXISTS flyway_schema_history CASCADE;

-- Supprimer l'extension uuid-ossp si présente
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Vérification : rien ne doit rester
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
