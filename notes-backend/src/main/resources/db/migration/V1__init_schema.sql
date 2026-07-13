-- ============================================================
-- V1__init_schema.sql — Système de Gestion des Notes
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enums ─────────────────────────────────────────────────
CREATE TYPE role_utilisateur  AS ENUM ('ADMIN','ENSEIGNANT','ETUDIANT');
CREATE TYPE statut_semestre   AS ENUM ('OUVERT','CLOTURE');
CREATE TYPE type_note         AS ENUM ('CC','EXAMEN','UNIQUE');
CREATE TYPE mention_enum      AS ENUM ('AJOURNE','PASSABLE','ASSEZ_BIEN','BIEN','TRES_BIEN');
CREATE TYPE niveau_filiere    AS ENUM ('LICENCE','MASTER','DOCTORAT');
CREATE TYPE statut_note_enum  AS ENUM ('PRESENT','ABSENT','DISPENSE');

-- ── Utilisateurs ──────────────────────────────────────────
CREATE TABLE utilisateurs (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom          VARCHAR(100) NOT NULL,
    prenom       VARCHAR(100) NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role         role_utilisateur NOT NULL,
    actif        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_util_email ON utilisateurs(email);
CREATE INDEX idx_util_role  ON utilisateurs(role);

-- ── Refresh tokens ─────────────────────────────────────────
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token           VARCHAR(512) NOT NULL UNIQUE,
    utilisateur_id  UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    expiration      TIMESTAMP NOT NULL,
    revoque         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ── Étudiants ──────────────────────────────────────────────
CREATE TABLE etudiants (
    id                UUID PRIMARY KEY REFERENCES utilisateurs(id) ON DELETE CASCADE,
    numero_etudiant   VARCHAR(50) NOT NULL UNIQUE,
    date_naissance    DATE,
    telephone         VARCHAR(20),
    adresse           TEXT,
    photo_url         VARCHAR(500)
);
CREATE INDEX idx_etudiant_num ON etudiants(numero_etudiant);

-- ── Enseignants ────────────────────────────────────────────
CREATE TABLE enseignants (
    id         UUID PRIMARY KEY REFERENCES utilisateurs(id) ON DELETE CASCADE,
    specialite VARCHAR(200),
    grade      VARCHAR(100)
);

-- ── Filières ───────────────────────────────────────────────
CREATE TABLE filieres (
    id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom     VARCHAR(200) NOT NULL,
    code    VARCHAR(50)  NOT NULL UNIQUE,
    niveau  niveau_filiere NOT NULL DEFAULT 'LICENCE',
    duree   INTEGER NOT NULL DEFAULT 3,
    actif   BOOLEAN NOT NULL DEFAULT TRUE
);

-- ── Promotions ─────────────────────────────────────────────
CREATE TABLE promotions (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom              VARCHAR(200) NOT NULL,
    annee_academique VARCHAR(20)  NOT NULL,
    filiere_id       UUID NOT NULL REFERENCES filieres(id),
    actif            BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX idx_promo_filiere ON promotions(filiere_id);

-- ── Inscription étudiant → promotion ──────────────────────
CREATE TABLE inscriptions_promotions (
    etudiant_id  UUID NOT NULL REFERENCES etudiants(id) ON DELETE CASCADE,
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
    PRIMARY KEY (etudiant_id, promotion_id)
);

-- ── Semestres ──────────────────────────────────────────────
CREATE TABLE semestres (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero           INTEGER NOT NULL,
    annee_academique VARCHAR(20) NOT NULL,
    date_debut       DATE,
    date_fin         DATE,
    statut           statut_semestre NOT NULL DEFAULT 'OUVERT',
    promotion_id     UUID NOT NULL REFERENCES promotions(id)
);
CREATE INDEX idx_semestre_promo ON semestres(promotion_id);

-- ── Unités d'Enseignement (UE) ────────────────────────────
CREATE TABLE unites_enseignement (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code         VARCHAR(50)  NOT NULL,
    intitule     VARCHAR(200) NOT NULL,
    credits_ects INTEGER NOT NULL DEFAULT 3,
    semestre_id  UUID NOT NULL REFERENCES semestres(id) ON DELETE CASCADE,
    UNIQUE (code, semestre_id)
);
CREATE INDEX idx_ue_semestre ON unites_enseignement(semestre_id);

-- ── Matières ───────────────────────────────────────────────
CREATE TABLE matieres (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50)  NOT NULL,
    intitule        VARCHAR(200) NOT NULL,
    coefficient     NUMERIC(4,2) NOT NULL CHECK (coefficient > 0),
    volume_horaire  INTEGER,
    ue_id           UUID NOT NULL REFERENCES unites_enseignement(id) ON DELETE CASCADE,
    enseignant_id   UUID REFERENCES enseignants(id),
    UNIQUE (code, ue_id)
);
CREATE INDEX idx_matiere_ue          ON matieres(ue_id);
CREATE INDEX idx_matiere_enseignant  ON matieres(enseignant_id);

-- ── Notes ──────────────────────────────────────────────────
CREATE TABLE notes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id     UUID NOT NULL REFERENCES etudiants(id),
    matiere_id      UUID NOT NULL REFERENCES matieres(id),
    valeur          NUMERIC(5,2) CHECK (valeur >= 0 AND valeur <= 20),
    type_note       type_note NOT NULL DEFAULT 'UNIQUE',
    statut          statut_note_enum NOT NULL DEFAULT 'PRESENT',
    commentaire     VARCHAR(500),
    verrouille      BOOLEAN NOT NULL DEFAULT FALSE,
    saisie_par      UUID REFERENCES enseignants(id),
    date_saisie     TIMESTAMP NOT NULL DEFAULT NOW(),
    date_modification TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (etudiant_id, matiere_id, type_note)
);
CREATE INDEX idx_note_etudiant ON notes(etudiant_id);
CREATE INDEX idx_note_matiere  ON notes(matiere_id);

-- ── Historique des corrections ─────────────────────────────
CREATE TABLE historique_notes (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id          UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    ancienne_valeur  NUMERIC(5,2),
    nouvelle_valeur  NUMERIC(5,2),
    motif_correction VARCHAR(500) NOT NULL,
    modifie_par      UUID NOT NULL REFERENCES utilisateurs(id),
    date_modification TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_histo_note ON historique_notes(note_id);

-- ── Cache moyennes calculées ───────────────────────────────
CREATE TABLE moyennes_calculees (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id     UUID NOT NULL REFERENCES etudiants(id),
    semestre_id     UUID NOT NULL REFERENCES semestres(id),
    moyenne         NUMERIC(5,2),
    mention         mention_enum,
    rang            INTEGER,
    credits_obtenus INTEGER NOT NULL DEFAULT 0,
    valide          BOOLEAN NOT NULL DEFAULT FALSE,
    date_calcul     TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (etudiant_id, semestre_id)
);
CREATE INDEX idx_moy_etudiant  ON moyennes_calculees(etudiant_id);
CREATE INDEX idx_moy_semestre  ON moyennes_calculees(semestre_id);

-- ── Relevés de notes ───────────────────────────────────────
CREATE TABLE releves (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_releve   VARCHAR(100) NOT NULL UNIQUE,
    etudiant_id     UUID NOT NULL REFERENCES etudiants(id),
    semestre_id     UUID NOT NULL REFERENCES semestres(id),
    pdf_url         VARCHAR(500),
    genere_par      UUID REFERENCES utilisateurs(id),
    date_generation TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_releve_etudiant ON releves(etudiant_id);

-- ── Données initiales ──────────────────────────────────────
-- Admin par défaut (mot de passe : Admin@2024)
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role)
VALUES ('Admin','Système','admin@pkfokam.edu',
        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYpR5gzOlCDGmKy','ADMIN');

-- Filière de démo
INSERT INTO filieres (nom, code, niveau, duree)
VALUES ('Génie Informatique','GI','LICENCE',3),
       ('Génie Logiciel','GL','LICENCE',3),
       ('Réseaux et Télécommunications','RT','LICENCE',3);
