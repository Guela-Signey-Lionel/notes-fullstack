-- ============================================================
-- V2__update_admin_password.sql
-- Met à jour le mot de passe de l'administrateur par défaut
-- Ancien : Admin@2024 → Nouveau : Admin@2026
-- ============================================================

UPDATE utilisateurs
SET mot_de_passe = '$2b$12$GrApc.7wSm7lwF8tMHclE.XqXrLwe.ObrrudkBN1n1M/9bj7Osd52',
    updated_at = NOW()
WHERE email = 'admin@pkfokam.edu';
