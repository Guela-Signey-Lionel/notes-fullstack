-- Ajouter le champ numero_enseignant (matricule enseignant) à la table enseignants
ALTER TABLE enseignants ADD COLUMN IF NOT EXISTS numero_enseignant VARCHAR(50);
