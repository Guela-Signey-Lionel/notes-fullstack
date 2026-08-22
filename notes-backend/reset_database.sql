-- ============================================================
-- reset_database.sql — Réinitialise complètement la base de données
-- Exécuter ce script en tant que superutilisateur (postgres)
-- ============================================================

-- 1. Fermer toutes les connexions existantes
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'notes_db' AND pid <> pg_backend_pid();

-- 2. Supprimer et recréer la base
DROP DATABASE IF EXISTS notes_db;
CREATE DATABASE notes_db;

-- 3. Créer l'utilisateur notes_user
DROP USER IF EXISTS notes_user;
CREATE USER notes_user WITH PASSWORD 'notes_pass';

-- 4. Donner les droits sur la base
GRANT ALL PRIVILEGES ON DATABASE notes_db TO notes_user;

-- 5. Se connecter à la nouvelle base et accorder les droits schéma
\c notes_db

-- 6. Accorder les droits sur le schéma public
GRANT ALL ON SCHEMA public TO notes_user;

-- 7. Accorder les droits par défaut pour les futures tables/séquences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO notes_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO notes_user;

-- 8. Vérification
SELECT usename FROM pg_user WHERE usename = 'notes_user';
SELECT datname FROM pg_database WHERE datname = 'notes_db';
