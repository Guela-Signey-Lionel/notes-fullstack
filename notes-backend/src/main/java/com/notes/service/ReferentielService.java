package com.notes.service;

import com.notes.dto.request.*;
import com.notes.dto.response.*;
import com.notes.entity.*;
import com.notes.exception.NotesException;
import com.notes.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

import com.notes.entity.Etudiant;
import com.notes.entity.Matiere;

@Service @RequiredArgsConstructor @Transactional @Slf4j
public class ReferentielService {

    private final FiliereRepository filiereRepo;
    private final PromotionRepository promotionRepo;
    private final SemestreRepository semestreRepo;
    private final UniteEnseignementRepository ueRepo;
    private final MatiereRepository matiereRepo;
    private final EnseignantRepository enseignantRepo;
    private final EtudiantRepository etudiantRepo;
    private final EmailService emailService;

    // ── Filières ──────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<FiliereResponse> findAllFilieres() {
        return filiereRepo.findByActif(true).stream().map(this::mapFiliere).toList();
    }

    public FiliereResponse createFiliere(CreateFiliereRequest req) {
        if (filiereRepo.existsByCode(req.getCode()))
            throw NotesException.conflict("Code filière déjà utilisé : " + req.getCode());
        Filiere f = Filiere.builder().nom(req.getNom()).code(req.getCode())
            .niveau(req.getNiveau()).duree(req.getDuree()).build();
        return mapFiliere(filiereRepo.save(f));
    }

    public FiliereResponse updateFiliere(UUID id, CreateFiliereRequest req) {
        Filiere f = filiereRepo.findById(id).orElseThrow(() -> NotesException.notFound("Filière"));
        f.setNom(req.getNom()); f.setNiveau(req.getNiveau()); f.setDuree(req.getDuree());
        return mapFiliere(filiereRepo.save(f));
    }

    // ── Promotions ────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<PromotionResponse> findPromotionsByFiliere(UUID filiereId) {
        return promotionRepo.findByFiliereIdAndActif(filiereId, true)
            .stream().map(this::mapPromotion).toList();
    }

    @Transactional(readOnly = true)
    public List<PromotionResponse> findAllPromotions() {
        return promotionRepo.findByActif(true).stream().map(this::mapPromotion).toList();
    }

    public PromotionResponse createPromotion(CreatePromotionRequest req) {
        Filiere filiere = filiereRepo.findById(req.getFiliereId())
            .orElseThrow(() -> NotesException.notFound("Filière"));
        Promotion p = Promotion.builder().nom(req.getNom())
            .anneeAcademique(req.getAnneeAcademique()).filiere(filiere).build();
        return mapPromotion(promotionRepo.save(p));
    }

    // ── Semestres ─────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<SemestreResponse> findSemestresByPromotion(UUID promotionId) {
        return semestreRepo.findByPromotionId(promotionId)
            .stream().map(this::mapSemestre).toList();
    }

    public SemestreResponse createSemestre(CreateSemestreRequest req) {
        Promotion promo = promotionRepo.findById(req.getPromotionId())
            .orElseThrow(() -> NotesException.notFound("Promotion"));
        Semestre s = Semestre.builder().numero(req.getNumero())
            .anneeAcademique(req.getAnneeAcademique())
            .dateDebut(req.getDateDebut()).dateFin(req.getDateFin())
            .promotion(promo).build();
        SemestreResponse response = mapSemestre(semestreRepo.save(s));

        // Notification aux enseignants
        notifierEnseignantsSemestreOuvert(s);

        return response;
    }

    public SemestreResponse cloturerSemestre(UUID id) {
        Semestre s = semestreRepo.findById(id)
            .orElseThrow(() -> NotesException.notFound("Semestre"));
        if (s.getStatut() == StatutSemestre.CLOTURE)
            throw NotesException.badRequest("Semestre déjà clôturé");
        s.setStatut(StatutSemestre.CLOTURE);
        SemestreResponse response = mapSemestre(semestreRepo.save(s));

        // Notification aux étudiants : résultats disponibles
        notifierEtudiantsResultats(s);

        return response;
    }

    public SemestreResponse rouvrirSemestre(UUID id) {
        Semestre s = semestreRepo.findById(id)
            .orElseThrow(() -> NotesException.notFound("Semestre"));
        s.setStatut(StatutSemestre.OUVERT);
        SemestreResponse response = mapSemestre(semestreRepo.save(s));

        // Notification aux enseignants
        notifierEnseignantsSemestreOuvert(s);

        return response;
    }

    private void notifierEnseignantsSemestreOuvert(Semestre semestre) {
        try {
            List<Matiere> matieres = matiereRepo.findBySemestreId(semestre.getId());
            matieres.stream()
                .filter(m -> m.getEnseignant() != null)
                .map(Matiere::getEnseignant)
                .distinct()
                .forEach(ens -> {
                    try {
                        emailService.notifySemesterOpened(
                            ens.getUtilisateur().getEmail(),
                            ens.getUtilisateur().getNomComplet(),
                            "Semestre " + semestre.getNumero() + " — " + semestre.getAnneeAcademique(),
                            semestre.getPromotion().getNom()
                        );
                    } catch (Exception e) {
                        log.warn("Erreur notification enseignant {}: {}", ens.getId(), e.getMessage());
                    }
                });
        } catch (Exception e) {
            log.warn("Erreur envoi notifications semestre ouvert: {}", e.getMessage());
        }
    }

    private void notifierEtudiantsResultats(Semestre semestre) {
        try {
            List<Etudiant> etudiants = etudiantRepo.findByPromotionId(semestre.getPromotion().getId());
            String semInfo = "Semestre " + semestre.getNumero() + " — " + semestre.getAnneeAcademique();
            String promoInfo = semestre.getPromotion().getNom();
            etudiants.forEach(e -> {
                try {
                    emailService.notifySemesterResultsAvailable(
                        e.getUtilisateur().getEmail(),
                        e.getUtilisateur().getNomComplet(),
                        semInfo, promoInfo
                    );
                } catch (Exception ex) {
                    log.warn("Erreur notification étudiant {}: {}", e.getId(), ex.getMessage());
                }
            });
        } catch (Exception e) {
            log.warn("Erreur envoi notifications résultats: {}", e.getMessage());
        }
    }

    // ── UE ────────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<UEResponse> findUEBySemestre(UUID semestreId) {
        return ueRepo.findBySemestreId(semestreId)
            .stream().map(this::mapUE).toList();
    }

    public UEResponse createUE(CreateUERequest req) {
        Semestre sem = semestreRepo.findById(req.getSemestreId())
            .orElseThrow(() -> NotesException.notFound("Semestre"));
        UniteEnseignement ue = UniteEnseignement.builder()
            .code(req.getCode()).intitule(req.getIntitule())
            .creditsEcts(req.getCreditsEcts()).semestre(sem).build();
        return mapUE(ueRepo.save(ue));
    }

    // ── Matières ──────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<MatiereResponse> findMatieresBySemestre(UUID semestreId) {
        return matiereRepo.findBySemestreId(semestreId)
            .stream().map(this::mapMatiere).toList();
    }

    @Transactional(readOnly = true)
    public List<MatiereResponse> findMatieresByEnseignant(UUID enseignantId) {
        return matiereRepo.findByEnseignantId(enseignantId)
            .stream().map(this::mapMatiere).toList();
    }

    public MatiereResponse createMatiere(CreateMatiereRequest req) {
        UniteEnseignement ue = ueRepo.findById(req.getUeId())
            .orElseThrow(() -> NotesException.notFound("UE"));
        Enseignant enseignant = null;
        if (req.getEnseignantId() != null)
            enseignant = enseignantRepo.findById(req.getEnseignantId())
                .orElseThrow(() -> NotesException.notFound("Enseignant"));
        Matiere m = Matiere.builder().code(req.getCode()).intitule(req.getIntitule())
            .coefficient(req.getCoefficient()).volumeHoraire(req.getVolumeHoraire())
            .ue(ue).enseignant(enseignant).build();
        MatiereResponse response = mapMatiere(matiereRepo.save(m));

        // Notification email à l'enseignant assigné
        if (enseignant != null) {
            try {
                Semestre sem = ue.getSemestre();
                String promoInfo = sem.getPromotion().getNom();
                String semInfo = "Semestre " + sem.getNumero() + " — " + sem.getAnneeAcademique();
                emailService.notifyTeacherAssignment(
                    enseignant.getUtilisateur().getEmail(),
                    enseignant.getUtilisateur().getNomComplet(),
                    req.getCode(), req.getIntitule(), semInfo, promoInfo
                );
            } catch (Exception e) {
                log.warn("Erreur envoi notification email à l'enseignant: {}", e.getMessage());
            }
        }

        return response;
    }

    public MatiereResponse updateMatiere(UUID id, CreateMatiereRequest req) {
        Matiere m = matiereRepo.findById(id)
            .orElseThrow(() -> NotesException.notFound("Matière"));
        m.setIntitule(req.getIntitule()); m.setCoefficient(req.getCoefficient());
        m.setVolumeHoraire(req.getVolumeHoraire());
        boolean enseignantChanged = false;
        if (req.getEnseignantId() != null && !req.getEnseignantId().equals(m.getEnseignant() != null ? m.getEnseignant().getId() : null)) {
            Enseignant newEns = enseignantRepo.findById(req.getEnseignantId()).orElse(null);
            m.setEnseignant(newEns);
            enseignantChanged = newEns != null;
        }
        MatiereResponse response = mapMatiere(matiereRepo.save(m));

        if (enseignantChanged && m.getEnseignant() != null) {
            try {
                Semestre sem = m.getUe().getSemestre();
                emailService.notifyTeacherAssignment(
                    m.getEnseignant().getUtilisateur().getEmail(),
                    m.getEnseignant().getUtilisateur().getNomComplet(),
                    m.getCode(), m.getIntitule(),
                    "Semestre " + sem.getNumero() + " — " + sem.getAnneeAcademique(),
                    sem.getPromotion().getNom()
                );
            } catch (Exception e) {
                log.warn("Erreur envoi notification email: {}", e.getMessage());
            }
        }

        return response;
    }

    // ── Inscription étudiants ─────────────────────────────────────────────
    public void inscrireEtudiant(UUID promotionId, UUID etudiantId) {
        Promotion promo = promotionRepo.findById(promotionId)
            .orElseThrow(() -> NotesException.notFound("Promotion"));
        Etudiant etudiant = etudiantRepo.findById(etudiantId)
            .orElseThrow(() -> NotesException.notFound("Étudiant"));
        if (!etudiant.getPromotions().contains(promo)) {
            etudiant.getPromotions().add(promo);
            etudiantRepo.save(etudiant);
        }
    }

    // ── Suppressions ──────────────────────────────────────────────────────────
    public void deleteFiliere(UUID id) {
        Filiere f = filiereRepo.findById(id)
            .orElseThrow(() -> NotesException.notFound("Filière"));
        f.setActif(false);
        filiereRepo.save(f);
    }

    public PromotionResponse updatePromotion(UUID id, CreatePromotionRequest req) {
        Promotion p = promotionRepo.findById(id)
            .orElseThrow(() -> NotesException.notFound("Promotion"));
        p.setNom(req.getNom());
        p.setAnneeAcademique(req.getAnneeAcademique());
        return mapPromotion(promotionRepo.save(p));
    }

    public void deletePromotion(UUID id) {
        Promotion p = promotionRepo.findById(id)
            .orElseThrow(() -> NotesException.notFound("Promotion"));
        p.setActif(false);
        promotionRepo.save(p);
    }

    public SemestreResponse updateSemestre(UUID id, CreateSemestreRequest req) {
        Semestre s = semestreRepo.findById(id)
            .orElseThrow(() -> NotesException.notFound("Semestre"));
        s.setNumero(req.getNumero());
        s.setAnneeAcademique(req.getAnneeAcademique());
        if (req.getDateDebut() != null) s.setDateDebut(req.getDateDebut());
        if (req.getDateFin() != null) s.setDateFin(req.getDateFin());
        return mapSemestre(semestreRepo.save(s));
    }

    public void deleteSemestre(UUID id) {
        Semestre s = semestreRepo.findById(id)
            .orElseThrow(() -> NotesException.notFound("Semestre"));
        semestreRepo.delete(s);
    }

    public UEResponse updateUE(UUID id, CreateUERequest req) {
        UniteEnseignement ue = ueRepo.findById(id)
            .orElseThrow(() -> NotesException.notFound("UE"));
        ue.setCode(req.getCode());
        ue.setIntitule(req.getIntitule());
        ue.setCreditsEcts(req.getCreditsEcts());
        return mapUE(ueRepo.save(ue));
    }

    public void deleteUE(UUID id) {
        UniteEnseignement ue = ueRepo.findById(id)
            .orElseThrow(() -> NotesException.notFound("UE"));
        ueRepo.delete(ue);
    }

    public void deleteMatiere(UUID id) {
        Matiere m = matiereRepo.findById(id)
            .orElseThrow(() -> NotesException.notFound("Matière"));
        matiereRepo.delete(m);
    }

    // ── Mappers ───────────────────────────────────────────────────────────
    public FiliereResponse mapFiliere(Filiere f) {
        return FiliereResponse.builder().id(f.getId()).nom(f.getNom())
            .code(f.getCode()).niveau(f.getNiveau()).duree(f.getDuree()).actif(f.isActif()).build();
    }

    public PromotionResponse mapPromotion(Promotion p) {
        return PromotionResponse.builder().id(p.getId()).nom(p.getNom())
            .anneeAcademique(p.getAnneeAcademique()).filiere(mapFiliere(p.getFiliere()))
            .actif(p.isActif()).nbEtudiants(p.getEtudiants().size()).build();
    }

    public SemestreResponse mapSemestre(Semestre s) {
        return SemestreResponse.builder().id(s.getId()).numero(s.getNumero())
            .anneeAcademique(s.getAnneeAcademique()).dateDebut(s.getDateDebut())
            .dateFin(s.getDateFin()).statut(s.getStatut())
            .promotionId(s.getPromotion().getId()).promotionNom(s.getPromotion().getNom()).build();
    }

    public UEResponse mapUE(UniteEnseignement ue) {
        return UEResponse.builder().id(ue.getId()).code(ue.getCode())
            .intitule(ue.getIntitule()).creditsEcts(ue.getCreditsEcts())
            .semestreId(ue.getSemestre().getId())
            .matieres(ue.getMatieres().stream().map(this::mapMatiere).toList()).build();
    }

    public MatiereResponse mapMatiere(Matiere m) {
        MatiereResponse.MatiereResponseBuilder b = MatiereResponse.builder()
            .id(m.getId()).code(m.getCode()).intitule(m.getIntitule())
            .coefficient(m.getCoefficient()).volumeHoraire(m.getVolumeHoraire())
            .ueId(m.getUe().getId()).ueIntitule(m.getUe().getIntitule());
        if (m.getEnseignant() != null) {
            b.enseignantId(m.getEnseignant().getId());
            b.enseignantNom(m.getEnseignant().getUtilisateur().getNomComplet());
        }
        return b.build();
    }
}
