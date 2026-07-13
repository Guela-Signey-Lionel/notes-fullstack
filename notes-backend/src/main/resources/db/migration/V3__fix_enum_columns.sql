-- ============================================================
-- V3__fix_enum_columns.sql
-- Passe les colonnes de type enum PostgreSQL en VARCHAR
-- pour la compatibilité avec Hibernate / JPA
-- ============================================================

-- Supprime d'abord les DEFAULT qui référencent les types enum
ALTER TABLE ONLY notes       ALTER COLUMN statut    DROP DEFAULT;
ALTER TABLE ONLY notes       ALTER COLUMN type_note DROP DEFAULT;
ALTER TABLE ONLY semestres   ALTER COLUMN statut    DROP DEFAULT;
ALTER TABLE ONLY filieres    ALTER COLUMN niveau    DROP DEFAULT;
ALTER TABLE ONLY moyennes_calculees ALTER COLUMN mention DROP DEFAULT;

-- Change les types des colonnes
ALTER TABLE utilisateurs       ALTER COLUMN role    TYPE VARCHAR(20);
ALTER TABLE semestres          ALTER COLUMN statut  TYPE VARCHAR(20);
ALTER TABLE filieres           ALTER COLUMN niveau  TYPE VARCHAR(20);
ALTER TABLE moyennes_calculees ALTER COLUMN mention TYPE VARCHAR(20);
ALTER TABLE notes              ALTER COLUMN type_note TYPE VARCHAR(20);
ALTER TABLE notes              ALTER COLUMN statut    TYPE VARCHAR(20);

-- Remet les DEFAULT en VARCHAR
ALTER TABLE ONLY notes       ALTER COLUMN statut    SET DEFAULT 'PRESENT';
ALTER TABLE ONLY notes       ALTER COLUMN type_note SET DEFAULT 'UNIQUE';
ALTER TABLE ONLY semestres   ALTER COLUMN statut    SET DEFAULT 'OUVERT';
ALTER TABLE ONLY filieres    ALTER COLUMN niveau    SET DEFAULT 'LICENCE';

-- Supprime les types enum devenus inutiles (dans l'ordre des dépendances)
DROP TYPE IF EXISTS statut_note_enum;
DROP TYPE IF EXISTS niveau_filiere;
DROP TYPE IF EXISTS mention_enum;
DROP TYPE IF EXISTS type_note;
DROP TYPE IF EXISTS statut_semestre;
DROP TYPE IF EXISTS role_utilisateur;
