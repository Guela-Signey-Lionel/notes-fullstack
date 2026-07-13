-- ============================================================
-- V5__fix_admin_password.sql
-- Corrige le hash du mot de passe admin (V1 avait un hash corrompu)
-- Mot de passe : Admin@2026 (hash $2a$ standard Spring Security)
-- ============================================================

UPDATE utilisateurs
SET mot_de_passe = '$2a$12$4GUK9KQoUCDilnIyrroTauS2zZdD53LXcIQZxbsdyhl49wG5sWBpa',
    updated_at = NOW()
WHERE email = 'admin@pkfokam.edu';
