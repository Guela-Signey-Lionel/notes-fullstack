package com.notes.service;

import com.notes.dto.request.*;
import com.notes.dto.response.*;
import com.notes.entity.*;
import com.notes.exception.NotesException;
import com.notes.repository.*;
import com.opencsv.CSVReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.math.BigDecimal;
import java.util.*;

@Service @RequiredArgsConstructor @Slf4j @Transactional
public class NoteService {

    private final NoteRepository noteRepo;
    private final MatiereRepository matiereRepo;
    private final EtudiantRepository etudiantRepo;
    private final EnseignantRepository enseignantRepo;
    private final HistoriqueNoteRepository historiqueRepo;
    private final SemestreRepository semestreRepo;
    private final EmailService emailService;

    // ── Saisie individuelle ───────────────────────────────────────────────
    public NoteResponse saisirNote(SaisieNoteRequest req, UUID enseignantId) {
        NoteResponse response = saisirNoteInterne(req, enseignantId);

        // Notification email à l'étudiant (uniquement pour saisie individuelle)
        if (req.getValeur() != null && req.getStatut() == StatutNoteEnum.PRESENT) {
            try {
                Matiere matiere = matiereRepo.findById(req.getMatiereId())
                    .orElseThrow(() -> NotesException.notFound("Matière"));
                Semestre sem = matiere.getUe().getSemestre();
                Etudiant etudiant = etudiantRepo.findById(req.getEtudiantId())
                    .orElseThrow(() -> NotesException.notFound("Étudiant"));
                emailService.notifyStudentGradeEntry(
                    etudiant.getUtilisateur().getEmail(),
                    etudiant.getUtilisateur().getNomComplet(),
                    matiere.getIntitule(),
                    req.getValeur().doubleValue(),
                    "Semestre " + sem.getNumero() + " — " + sem.getAnneeAcademique()
                );
            } catch (Exception e) {
                log.warn("Erreur envoi notification étudiant: {}", e.getMessage());
            }
        }

        return response;
    }

    // ── Saisie groupée (batch) ────────────────────────────────────────────
    public List<NoteResponse> saisirBatch(BatchNotesRequest req, UUID enseignantId) {
        Matiere matiere = matiereRepo.findById(req.getMatiereId())
            .orElseThrow(() -> NotesException.notFound("Matière"));
        validerSemestreOuvert(matiere);

        List<NoteResponse> results = new ArrayList<>();
        for (SaisieNoteRequest nr : req.getNotes()) {
            nr.setMatiereId(req.getMatiereId());
            results.add(saisirNoteInterne(nr, enseignantId));
        }
        log.info("Batch {} notes enregistrées pour matière {}", results.size(), req.getMatiereId());
        return results;
    }

    // ── Correction d'une note ─────────────────────────────────────────────
    public NoteResponse corrigerNote(UUID noteId, CorrectionNoteRequest req, UUID userId) {
        Note note = noteRepo.findById(noteId)
            .orElseThrow(() -> NotesException.notFound("Note"));
        if (note.isVerrouille())
            throw NotesException.forbidden("Note verrouillée, contactez l'administrateur");
        validerSemestreOuvert(note.getMatiere());

        Utilisateur user = new Utilisateur(); user.setId(userId);

        // Historique
        historiqueRepo.save(HistoriqueNote.builder()
            .note(note).ancienneValeur(note.getValeur())
            .nouvelleValeur(req.getNouvelleValeur())
            .motifCorrection(req.getMotifCorrection())
            .modifiePar(user).build());

        note.setValeur(req.getNouvelleValeur());
        return mapNote(noteRepo.save(note));
    }

    // ── Verrouillage ──────────────────────────────────────────────────────
    public void verrouillerMatiere(UUID matiereId, UUID enseignantId) {
        List<Note> notes = noteRepo.findByMatiereIdNonVerrouille(matiereId);
        notes.forEach(n -> n.setVerrouille(true));
        noteRepo.saveAll(notes);
        log.info("Matière {} verrouillée par {}: {} notes", matiereId, enseignantId, notes.size());

        // Notification email à l'enseignant
        Matiere matiere = matiereRepo.findById(matiereId).orElse(null);
        if (matiere != null && matiere.getEnseignant() != null) {
            try {
                emailService.notifyGradeLock(
                    matiere.getEnseignant().getUtilisateur().getEmail(),
                    matiere.getEnseignant().getUtilisateur().getNomComplet(),
                    matiere.getCode(), matiere.getIntitule()
                );
            } catch (Exception e) {
                log.warn("Erreur envoi notification verrouillage: {}", e.getMessage());
            }
        }
    }

    public void deverrouillerMatiere(UUID matiereId) {
        noteRepo.findByMatiereId(matiereId).forEach(n -> n.setVerrouille(false));
    }

    // ── Notes d'un étudiant pour un semestre ──────────────────────────────
    @Transactional(readOnly = true)
    public List<NoteResponse> findByEtudiantAndSemestre(UUID etudiantId, UUID semestreId) {
        return noteRepo.findByEtudiantAndSemestre(etudiantId, semestreId)
            .stream().map(this::mapNote).toList();
    }

    // ── Notes d'une matière (vue enseignant) ──────────────────────────────
    @Transactional(readOnly = true)
    public List<NoteResponse> findByMatiere(UUID matiereId) {
        return noteRepo.findByMatiereId(matiereId).stream().map(this::mapNote).toList();
    }

    // ── Historique corrections ─────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<HistoriqueNote> getHistorique(UUID noteId) {
        return historiqueRepo.findByNoteIdOrderByDateModificationDesc(noteId);
    }

    // ── Import CSV ────────────────────────────────────────────────────────
    public CsvImportResponse importerCSV(MultipartFile file, UUID matiereId, UUID enseignantId) {
        Matiere matiere = matiereRepo.findById(matiereId)
            .orElseThrow(() -> NotesException.notFound("Matière"));
        validerSemestreOuvert(matiere);

        List<String> erreurs = new ArrayList<>();
        int importees = 0; int lignes = 0;

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] line;
            reader.skip(1); // skip header
            while ((line = reader.readNext()) != null) {
                lignes++;
                try {
                    if (line.length < 2) { erreurs.add("Ligne " + lignes + ": format invalide (num_etudiant;note)"); continue; }
                    String numEtudiant = line[0].trim();
                    BigDecimal valeur  = new BigDecimal(line[1].trim().replace(",", "."));
                    String commentaire = line.length > 2 ? line[2].trim() : null;

                    if (valeur.compareTo(BigDecimal.ZERO) < 0 || valeur.compareTo(BigDecimal.valueOf(20)) > 0) {
                        erreurs.add("Ligne " + lignes + " (" + numEtudiant + "): note hors plage 0-20"); continue;
                    }

                    Etudiant etudiant = etudiantRepo.findByNumeroEtudiant(numEtudiant)
                        .orElse(null);
                    if (etudiant == null) { erreurs.add("Ligne " + lignes + ": étudiant introuvable: " + numEtudiant); continue; }

                    SaisieNoteRequest req = SaisieNoteRequest.builder()
                        .etudiantId(etudiant.getId()).matiereId(matiereId)
                        .valeur(valeur).typeNote(TypeNote.UNIQUE)
                        .statut(StatutNoteEnum.PRESENT).commentaire(commentaire).build();
                    saisirNote(req, enseignantId);
                    importees++;
                } catch (NumberFormatException e) {
                    erreurs.add("Ligne " + lignes + ": valeur numérique invalide");
                } catch (Exception e) {
                    erreurs.add("Ligne " + lignes + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw NotesException.badRequest("Erreur lecture CSV: " + e.getMessage());
        }

        return CsvImportResponse.builder().totalLignes(lignes)
            .importees(importees).erreurs(erreurs.size())
            .rapportErreurs(erreurs).build();
    }

    // ── Saisie interne (sans notification) ────────────────────────────────
    private NoteResponse saisirNoteInterne(SaisieNoteRequest req, UUID enseignantId) {
        Matiere matiere = matiereRepo.findById(req.getMatiereId())
            .orElseThrow(() -> NotesException.notFound("Matière"));
        validerSemestreOuvert(matiere);

        Etudiant etudiant = etudiantRepo.findById(req.getEtudiantId())
            .orElseThrow(() -> NotesException.notFound("Étudiant"));

        Optional<Note> existing = noteRepo.findByEtudiantIdAndMatiereIdAndTypeNote(
            req.getEtudiantId(), req.getMatiereId(), req.getTypeNote());

        if (existing.isPresent() && existing.get().isVerrouille())
            throw NotesException.forbidden("Cette note est verrouillée");

        Enseignant enseignant = enseignantRepo.findById(enseignantId)
            .orElseThrow(() -> NotesException.notFound("Enseignant"));

        Note note = existing.orElse(Note.builder()
            .etudiant(etudiant).matiere(matiere).build());

        note.setValeur(req.getValeur());
        note.setTypeNote(req.getTypeNote());
        note.setStatut(req.getStatut());
        note.setCommentaire(req.getCommentaire());
        note.setSaisiePar(enseignant);

        return mapNote(noteRepo.save(note));
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    private void validerSemestreOuvert(Matiere matiere) {
        StatutSemestre statut = matiere.getUe().getSemestre().getStatut();
        if (statut == StatutSemestre.CLOTURE)
            throw NotesException.badRequest("Le semestre est clôturé, saisie de notes impossible");
    }

    public NoteResponse mapNote(Note n) {
        return NoteResponse.builder()
            .id(n.getId())
            .etudiantId(n.getEtudiant().getId())
            .etudiantNom(n.getEtudiant().getUtilisateur().getNomComplet())
            .numeroEtudiant(n.getEtudiant().getNumeroEtudiant())
            .matiereId(n.getMatiere().getId())
            .matiereIntitule(n.getMatiere().getIntitule())
            .valeur(n.getValeur()).typeNote(n.getTypeNote())
            .statut(n.getStatut()).commentaire(n.getCommentaire())
            .verrouille(n.isVerrouille())
            .dateSaisie(n.getDateSaisie())
            .dateModification(n.getDateModification())
            .build();
    }
}
