-- ============================================================
-- V6__fix_admin_email.sql
-- Met à jour l'email de l'administrateur par défaut
-- Ancien : admin@pkfokam.edu → Nouveau : admin@notes.com
-- ============================================================

UPDATE utilisateurs
SET email = 'admin@notes.com',
    nom = 'Admin',
    prenom = 'Système',
    updated_at = NOW()
WHERE email = 'admin@pkfokam.edu';
