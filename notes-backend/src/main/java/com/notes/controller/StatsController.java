package com.notes.controller;

import com.notes.dto.response.*;
import com.notes.entity.*;
import com.notes.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController @RequestMapping("/api/v1/stats") @RequiredArgsConstructor
public class StatsController {

    private final FiliereRepository filiereRepo;
    private final PromotionRepository promotionRepo;
    private final EtudiantRepository etudiantRepo;
    private final SemestreRepository semestreRepo;
    private final NoteRepository noteRepo;
    private final MatiereRepository matiereRepo;
    private final MoyenneCalculeeRepository moyenneRepo;

    @GetMapping("/globales")
    @PreAuthorize("hasAnyRole('ADMIN','ENSEIGNANT')")
    public ResponseEntity<Map<String, Object>> statsGlobales() {
        Map<String, Object> stats = new LinkedHashMap<>();

        // 1. Étudiants par filière
        List<Map<String, Object>> parFiliere = new ArrayList<>();
        List<Filiere> filieres = filiereRepo.findByActif(true);
        for (Filiere f : filieres) {
            List<Promotion> promos = promotionRepo.findByFiliereIdAndActif(f.getId(), true);
            long total = 0;
            for (Promotion p : promos) {
                total += etudiantRepo.findByPromotionId(p.getId()).size();
            }
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("filiere", f.getNom() + " (" + f.getCode() + ")");
            item.put("total", total);
            parFiliere.add(item);
        }
        stats.put("etudiantsParFiliere", parFiliere);

        // 2. Étudiants par promotion
        List<Map<String, Object>> parPromotion = new ArrayList<>();
        List<Promotion> promos = promotionRepo.findByActif(true);
        for (Promotion p : promos) {
            List<Etudiant> etudiants = etudiantRepo.findByPromotionId(p.getId());
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("promotion", p.getNom());
            item.put("annee", p.getAnneeAcademique());
            item.put("filiere", p.getFiliere().getNom());
            item.put("total", etudiants.size());
            parPromotion.add(item);
        }
        stats.put("etudiantsParPromotion", parPromotion);

        // 3. Taux de réussite/échec par promotion (dernier semestre clôturé de chaque promo)
        List<Map<String, Object>> tauxParPromotion = new ArrayList<>();
        for (Promotion p : promos) {
            List<Semestre> semestres = semestreRepo.findByPromotionIdAndStatut(p.getId(), StatutSemestre.CLOTURE);
            if (semestres.isEmpty()) continue;
            Semestre dernier = semestres.get(semestres.size() - 1);
            List<Etudiant> etudiants = etudiantRepo.findByPromotionId(p.getId());
            int total = etudiants.size();
            int reussite = 0;
            int echec = 0;
            for (Etudiant e : etudiants) {
                var moyenne = moyenneRepo.findByEtudiantIdAndSemestreId(e.getId(), dernier.getId());
                if (moyenne.isPresent() && moyenne.get().isValide()) {
                    reussite++;
                } else {
                    echec++;
                }
            }
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("promotion", p.getNom());
            item.put("annee", p.getAnneeAcademique());
            item.put("filiere", p.getFiliere().getNom());
            item.put("total", total);
            item.put("reussite", reussite);
            item.put("echec", echec);
            item.put("tauxReussite", total > 0 ? Math.round((double) reussite / total * 10000) / 100.0 : 0);
            item.put("tauxEchec", total > 0 ? Math.round((double) echec / total * 10000) / 100.0 : 0);
            tauxParPromotion.add(item);
        }
        stats.put("tauxParPromotion", tauxParPromotion);

        // 4. Par année académique
        Map<String, Map<String, Object>> parAnnee = new LinkedHashMap<>();
        for (Promotion p : promos) {
            String annee = p.getAnneeAcademique();
            parAnnee.putIfAbsent(annee, new LinkedHashMap<>());
            Map<String, Object> anData = parAnnee.get(annee);
            anData.putIfAbsent("annee", annee);
            anData.put("totalPromotions", ((Number) anData.getOrDefault("totalPromotions", 0)).intValue() + 1);
        }
        stats.put("parAnneeAcademique", new ArrayList<>(parAnnee.values()));

        // 5. Totaux globaux
        Map<String, Object> totaux = new LinkedHashMap<>();
        totaux.put("totalFilieres", filieres.size());
        totaux.put("totalPromotions", promos.size());
        long totalEtudiants = 0;
        for (Promotion p : promos) {
            totalEtudiants += etudiantRepo.findByPromotionId(p.getId()).size();
        }
        totaux.put("totalEtudiants", totalEtudiants);
        stats.put("totaux", totaux);

        return ResponseEntity.ok(stats);
    }
}
