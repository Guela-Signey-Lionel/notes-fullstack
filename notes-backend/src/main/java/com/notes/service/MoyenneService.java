package com.notes.service;

import com.notes.dto.response.*;
import com.notes.entity.*;
import com.notes.exception.NotesException;
import com.notes.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

import lombok.extern.slf4j.Slf4j;

@Service @RequiredArgsConstructor @Transactional @Slf4j
public class MoyenneService {

    private final NoteRepository noteRepo;
    private final MatiereRepository matiereRepo;
    private final SemestreRepository semestreRepo;
    private final EtudiantRepository etudiantRepo;
    private final UniteEnseignementRepository ueRepo;
    private final MoyenneCalculeeRepository moyenneRepo;

    @Value("${app.bareme.passable:10.0}")   private double seuilPassable;
    @Value("${app.bareme.assez-bien:12.0}") private double seuilAssezBien;
    @Value("${app.bareme.bien:14.0}")       private double seuilBien;
    @Value("${app.bareme.tres-bien:16.0}")  private double seuilTresBien;

    // ── Calcul moyenne étudiant/semestre ──────────────────────────────────
    public MoyenneResponse calculerMoyenneEtudiant(UUID etudiantId, UUID semestreId) {
        log.debug("Calcul moyenne étudiant={} semestre={}", etudiantId, semestreId);
        Etudiant etudiant = etudiantRepo.findById(etudiantId)
            .orElseThrow(() -> NotesException.notFound("Étudiant"));
        Semestre semestre = semestreRepo.findById(semestreId)
            .orElseThrow(() -> NotesException.notFound("Semestre"));

        List<UniteEnseignement> ues = ueRepo.findBySemestreId(semestreId);
        List<Note> notes = noteRepo.findByEtudiantAndSemestre(etudiantId, semestreId);

        // Map notes par matiereId
        Map<UUID, List<Note>> notesByMatiere = notes.stream()
            .collect(Collectors.groupingBy(n -> n.getMatiere().getId()));

        List<MoyenneUEResponse> moyennesUE = new ArrayList<>();
        BigDecimal sommePondereeUE = BigDecimal.ZERO;
        BigDecimal sommeCredits    = BigDecimal.ZERO;
        int creditsObtenus = 0;

        for (UniteEnseignement ue : ues) {
            List<Matiere> matieres = matiereRepo.findByUeId(ue.getId());
            BigDecimal sommePondereeMatiere = BigDecimal.ZERO;
            BigDecimal sommeCoeff = BigDecimal.ZERO;
            List<NoteDetailResponse> noteDetails = new ArrayList<>();

            for (Matiere matiere : matieres) {
                List<Note> notesMatiere = notesByMatiere.getOrDefault(matiere.getId(), List.of());
                BigDecimal noteFin = calculerNotefinale(notesMatiere, matiere);
                NoteDetailResponse detail = buildNoteDetail(matiere, notesMatiere, noteFin);
                noteDetails.add(detail);

                if (noteFin != null) {
                    sommePondereeMatiere = sommePondereeMatiere.add(noteFin.multiply(matiere.getCoefficient()));
                    sommeCoeff = sommeCoeff.add(matiere.getCoefficient());
                }
            }

            BigDecimal moyUE = sommeCoeff.compareTo(BigDecimal.ZERO) > 0
                ? sommePondereeMatiere.divide(sommeCoeff, 2, RoundingMode.HALF_UP)
                : null;

            boolean ueValidee = moyUE != null && moyUE.compareTo(BigDecimal.TEN) >= 0;
            if (ueValidee) creditsObtenus += ue.getCreditsEcts();

            moyennesUE.add(MoyenneUEResponse.builder()
                .ueId(ue.getId()).ueCode(ue.getCode()).ueIntitule(ue.getIntitule())
                .creditsEcts(ue.getCreditsEcts()).moyenneUE(moyUE)
                .validee(ueValidee).notes(noteDetails).build());

            if (moyUE != null) {
                BigDecimal creditsUE = BigDecimal.valueOf(ue.getCreditsEcts());
                sommePondereeUE = sommePondereeUE.add(moyUE.multiply(creditsUE));
                sommeCredits    = sommeCredits.add(creditsUE);
            }
        }

        BigDecimal moyenneSem = sommeCredits.compareTo(BigDecimal.ZERO) > 0
            ? sommePondereeUE.divide(sommeCredits, 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO;

        MentionEnum mention  = calculerMention(moyenneSem.doubleValue());
        boolean valide       = moyenneSem.compareTo(BigDecimal.TEN) >= 0;

        // Sauvegarder dans le cache
        sauvegarderMoyenne(etudiant, semestre, moyenneSem, mention, creditsObtenus, valide);

        // Calculer le rang avec gestion d'erreur
        Integer rang = null;
        try {
            rang = calculerRang(etudiantId, semestreId, moyenneSem);
        } catch (Exception e) {
            log.warn("Erreur calcul rang étudiant {}: {}", etudiantId, e.getMessage());
        }

        log.debug("Moyenne: étudiant={} moyenne={} mention={} rang={}",
            etudiantId, moyenneSem, mention, rang);

        return MoyenneResponse.builder()
            .etudiantId(etudiantId)
            .etudiantNom(etudiant.getUtilisateur().getNomComplet())
            .numeroEtudiant(etudiant.getNumeroEtudiant())
            .semestreId(semestreId)
            .semestreNumero(semestre.getNumero())
            .moyenne(moyenneSem).mention(mention).rang(rang)
            .creditsObtenus(creditsObtenus).valide(valide)
            .moyennesUE(moyennesUE).build();
    }

    // ── Classement promotion/semestre ─────────────────────────────────────
    public ClassementResponse calculerClassement(UUID promotionId, UUID semestreId) {
        log.info("Calcul classement promotion={} semestre={}", promotionId, semestreId);
        Semestre semestre = semestreRepo.findById(semestreId)
            .orElseThrow(() -> NotesException.notFound("Semestre"));
        List<Etudiant> etudiants = etudiantRepo.findByPromotionId(promotionId);

        // Calculer pour chaque étudiant
        List<MoyenneResponse> classement = etudiants.stream()
            .map(e -> calculerMoyenneEtudiant(e.getId(), semestreId))
            .sorted(Comparator.comparing(MoyenneResponse::getMoyenne,
                Comparator.nullsLast(Comparator.reverseOrder())))
            .collect(Collectors.toList());

        // Assigner les rangs
        for (int i = 0; i < classement.size(); i++) {
            classement.get(i).setRang(i + 1);
        }

        return ClassementResponse.builder()
            .totalEtudiants(classement.size())
            .semestreNom("Semestre " + semestre.getNumero() + " — " + semestre.getAnneeAcademique())
            .promotionNom(semestre.getPromotion().getNom())
            .classement(classement).build();
    }

    // ── Classement annuel (moyenne S1 + S2) ─────────────────────────────
    public ClassementAnnuelResponse calculerClassementAnnuel(UUID promotionId, UUID semestre1Id, UUID semestre2Id) {
        log.info("Calcul classement annuel promotion={} sem1={} sem2={}", promotionId, semestre1Id, semestre2Id);
        Semestre sem1 = semestreRepo.findById(semestre1Id)
            .orElseThrow(() -> NotesException.notFound("Semestre 1"));
        Semestre sem2 = semestreRepo.findById(semestre2Id)
            .orElseThrow(() -> NotesException.notFound("Semestre 2"));
        List<Etudiant> etudiants = etudiantRepo.findByPromotionId(promotionId);

        List<MoyenneAnnuelleResponse> classement = new ArrayList<>();
        for (Etudiant e : etudiants) {
            MoyenneResponse m1 = null;
            try { m1 = calculerMoyenneEtudiant(e.getId(), semestre1Id); } catch (Exception ex) { log.warn("Erreur moy S1 {}: {}", e.getId(), ex.getMessage()); }
            MoyenneResponse m2 = null;
            try { m2 = calculerMoyenneEtudiant(e.getId(), semestre2Id); } catch (Exception ex) { log.warn("Erreur moy S2 {}: {}", e.getId(), ex.getMessage()); }

            BigDecimal moyS1 = m1 != null ? m1.getMoyenne() : BigDecimal.ZERO;
            BigDecimal moyS2 = m2 != null ? m2.getMoyenne() : BigDecimal.ZERO;
            BigDecimal moyAnnuelle = (moyS1.add(moyS2)).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            int credits = (m1 != null ? m1.getCreditsObtenus() : 0) + (m2 != null ? m2.getCreditsObtenus() : 0);
            MentionEnum mention = calculerMention(moyAnnuelle.doubleValue());
            boolean valide = moyAnnuelle.compareTo(BigDecimal.TEN) >= 0;

            classement.add(MoyenneAnnuelleResponse.builder()
                .etudiantId(e.getId())
                .etudiantNom(e.getUtilisateur().getNomComplet())
                .numeroEtudiant(e.getNumeroEtudiant())
                .moyenneS1(moyS1).moyenneS2(moyS2)
                .moyenneAnnuelle(moyAnnuelle).mention(mention)
                .creditsObtenus(credits).valide(valide).build());
        }

        classement.sort(Comparator.comparing(MoyenneAnnuelleResponse::getMoyenneAnnuelle,
            Comparator.nullsLast(Comparator.reverseOrder())));
        for (int i = 0; i < classement.size(); i++) {
            classement.get(i).setRang(i + 1);
        }

        return ClassementAnnuelResponse.builder()
            .totalEtudiants(classement.size())
            .anneeAcademique(sem1.getAnneeAcademique())
            .promotionNom(sem1.getPromotion().getNom())
            .semestre1Info("Semestre " + sem1.getNumero())
            .semestre2Info("Semestre " + sem2.getNumero())
            .classement(classement).build();
    }

    // ── Historique moyennes étudiant ──────────────────────────────────────
    @Transactional(readOnly = true)
    public List<MoyenneResponse> getHistoriqueMoyennes(UUID etudiantId) {
        Etudiant etudiant = etudiantRepo.findById(etudiantId)
            .orElseThrow(() -> NotesException.notFound("Étudiant"));
        return moyenneRepo.findByEtudiantIdOrderBySemestreNumeroAsc(etudiantId)
            .stream().map(mc -> MoyenneResponse.builder()
                .etudiantId(etudiantId)
                .etudiantNom(etudiant.getUtilisateur().getNomComplet())
                .numeroEtudiant(etudiant.getNumeroEtudiant())
                .semestreId(mc.getSemestre().getId())
                .semestreNumero(mc.getSemestre().getNumero())
                .moyenne(mc.getMoyenne()).mention(mc.getMention())
                .rang(mc.getRang()).creditsObtenus(mc.getCreditsObtenus())
                .valide(mc.isValide()).build())
            .toList();
    }

    // ── Statistiques matière ──────────────────────────────────────────────
    @Transactional(readOnly = true)
    public StatsResponse getStatsByMatiere(UUID matiereId) {
        Matiere matiere = matiereRepo.findById(matiereId)
            .orElseThrow(() -> NotesException.notFound("Matière"));
        List<Note> notes = noteRepo.findByMatiereId(matiereId)
            .stream().filter(n -> n.getStatut() == StatutNoteEnum.PRESENT
                && n.getValeur() != null).toList();

        if (notes.isEmpty()) return StatsResponse.builder().intitule(matiere.getIntitule())
            .totalEtudiants(0).build();

        DoubleSummaryStatistics stats = notes.stream()
            .mapToDouble(n -> n.getValeur().doubleValue()).summaryStatistics();
        double mean = stats.getAverage();
        double variance = notes.stream()
            .mapToDouble(n -> Math.pow(n.getValeur().doubleValue() - mean, 2))
            .average().orElse(0);

        long reussites = notes.stream()
            .filter(n -> n.getValeur().doubleValue() >= seuilPassable).count();

        Map<String, Long> distribMentions = new LinkedHashMap<>();
        distribMentions.put("TRES_BIEN", notes.stream().filter(n -> n.getValeur().doubleValue() >= seuilTresBien).count());
        distribMentions.put("BIEN",      notes.stream().filter(n -> n.getValeur().doubleValue() >= seuilBien && n.getValeur().doubleValue() < seuilTresBien).count());
        distribMentions.put("ASSEZ_BIEN",notes.stream().filter(n -> n.getValeur().doubleValue() >= seuilAssezBien && n.getValeur().doubleValue() < seuilBien).count());
        distribMentions.put("PASSABLE",  notes.stream().filter(n -> n.getValeur().doubleValue() >= seuilPassable && n.getValeur().doubleValue() < seuilAssezBien).count());
        distribMentions.put("AJOURNE",   notes.stream().filter(n -> n.getValeur().doubleValue() < seuilPassable).count());

        Map<String, Long> distribTranche = new LinkedHashMap<>();
        distribTranche.put("0-5",   notes.stream().filter(n->n.getValeur().doubleValue()<5).count());
        distribTranche.put("5-10",  notes.stream().filter(n->n.getValeur().doubleValue()>=5&&n.getValeur().doubleValue()<10).count());
        distribTranche.put("10-15", notes.stream().filter(n->n.getValeur().doubleValue()>=10&&n.getValeur().doubleValue()<15).count());
        distribTranche.put("15-20", notes.stream().filter(n->n.getValeur().doubleValue()>=15).count());

        return StatsResponse.builder()
            .intitule(matiere.getIntitule())
            .totalEtudiants(notes.size())
            .moyenne(Math.round(mean * 100.0) / 100.0)
            .min(stats.getMin()).max(stats.getMax())
            .ecartType(Math.round(Math.sqrt(variance) * 100.0) / 100.0)
            .tauxReussite(Math.round((double) reussites / notes.size() * 10000) / 100.0)
            .distributionMentions(distribMentions)
            .distributionParTranche(distribTranche).build();
    }

    // ── Helpers privés ────────────────────────────────────────────────────
    private BigDecimal calculerNotefinale(List<Note> notes, Matiere matiere) {
        if (notes.isEmpty()) return null;
        Optional<Note> cc  = notes.stream().filter(n -> n.getTypeNote() == TypeNote.CC).findFirst();
        Optional<Note> exam= notes.stream().filter(n -> n.getTypeNote() == TypeNote.EXAMEN).findFirst();
        Optional<Note> uniq= notes.stream().filter(n -> n.getTypeNote() == TypeNote.UNIQUE).findFirst();

        if (cc.isPresent() && exam.isPresent() && cc.get().getValeur() != null && exam.get().getValeur() != null) {
            return cc.get().getValeur().multiply(BigDecimal.valueOf(0.4))
                .add(exam.get().getValeur().multiply(BigDecimal.valueOf(0.6)))
                .setScale(2, RoundingMode.HALF_UP);
        }
        if (uniq.isPresent() && uniq.get().getValeur() != null) return uniq.get().getValeur();
        return null;
    }

    private NoteDetailResponse buildNoteDetail(Matiere m, List<Note> notes, BigDecimal noteFin) {
        Optional<Note> cc   = notes.stream().filter(n -> n.getTypeNote() == TypeNote.CC).findFirst();
        Optional<Note> exam = notes.stream().filter(n -> n.getTypeNote() == TypeNote.EXAMEN).findFirst();
        return NoteDetailResponse.builder()
            .matiereId(m.getId()).matiereCode(m.getCode()).matiereIntitule(m.getIntitule())
            .coefficient(m.getCoefficient())
            .noteCC(cc.map(Note::getValeur).orElse(null))
            .noteExamen(exam.map(Note::getValeur).orElse(null))
            .notefinale(noteFin).build();
    }

    private MentionEnum calculerMention(double moyenne) {
        if (moyenne >= seuilTresBien)  return MentionEnum.TRES_BIEN;
        if (moyenne >= seuilBien)      return MentionEnum.BIEN;
        if (moyenne >= seuilAssezBien) return MentionEnum.ASSEZ_BIEN;
        if (moyenne >= seuilPassable)  return MentionEnum.PASSABLE;
        return MentionEnum.AJOURNE;
    }

    private void sauvegarderMoyenne(Etudiant e, Semestre s, BigDecimal moy,
                                     MentionEnum mention, int credits, boolean valide) {
        MoyenneCalculee mc = moyenneRepo.findByEtudiantIdAndSemestreId(e.getId(), s.getId())
            .orElse(MoyenneCalculee.builder().etudiant(e).semestre(s).build());
        mc.setMoyenne(moy); mc.setMention(mention);
        mc.setCreditsObtenus(credits); mc.setValide(valide);
        moyenneRepo.save(mc);
    }

    private Integer calculerRang(UUID etudiantId, UUID semestreId, BigDecimal moyenne) {
        List<MoyenneCalculee> all = moyenneRepo.findBySemestreIdOrderByMoyenneDesc(semestreId);
        if (all.isEmpty()) return 1;
        long meilleures = all.stream()
            .filter(mc -> mc.getMoyenne() != null && mc.getMoyenne().compareTo(moyenne) > 0)
            .count();
        return (int) meilleures + 1;
    }
}
