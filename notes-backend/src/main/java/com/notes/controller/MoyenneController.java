package com.notes.controller;
import com.notes.dto.response.*;
import com.notes.service.MoyenneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/v1/moyennes") @RequiredArgsConstructor
@Tag(name = "Moyennes & Classements")
public class MoyenneController {
    private final MoyenneService moyenneService;

    @GetMapping("/etudiant/{etudiantId}/semestre/{semestreId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary="Calculer la moyenne complète d'un étudiant pour un semestre")
    public ResponseEntity<MoyenneResponse> calculerMoyenne(
        @PathVariable UUID etudiantId, @PathVariable UUID semestreId) {
        return ResponseEntity.ok(moyenneService.calculerMoyenneEtudiant(etudiantId, semestreId));
    }

    @GetMapping("/classement/promotion/{promotionId}/semestre/{semestreId}")
    @PreAuthorize("hasAnyRole('ADMIN','ENSEIGNANT')")
    @Operation(summary="Classement complet d'une promotion pour un semestre")
    public ResponseEntity<ClassementResponse> classement(
        @PathVariable UUID promotionId, @PathVariable UUID semestreId) {
        return ResponseEntity.ok(moyenneService.calculerClassement(promotionId, semestreId));
    }

    @GetMapping("/classement/promotion/{promotionId}/annuel")
    @PreAuthorize("hasAnyRole('ADMIN','ENSEIGNANT')")
    @Operation(summary="Classement annuel d'une promotion (S1 + S2)")
    public ResponseEntity<ClassementAnnuelResponse> classementAnnuel(
        @PathVariable UUID promotionId,
        @RequestParam UUID semestre1Id,
        @RequestParam UUID semestre2Id) {
        return ResponseEntity.ok(moyenneService.calculerClassementAnnuel(promotionId, semestre1Id, semestre2Id));
    }

    @GetMapping("/etudiant/{etudiantId}/historique")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary="Historique des moyennes d'un étudiant (tous semestres)")
    public ResponseEntity<List<MoyenneResponse>> historique(@PathVariable UUID etudiantId) {
        return ResponseEntity.ok(moyenneService.getHistoriqueMoyennes(etudiantId));
    }

    @GetMapping("/stats/matiere/{matiereId}")
    @PreAuthorize("hasAnyRole('ADMIN','ENSEIGNANT')")
    @Operation(summary="Statistiques d'une matière (min, max, moy, écart-type, distribution)")
    public ResponseEntity<StatsResponse> statsMatiere(@PathVariable UUID matiereId) {
        return ResponseEntity.ok(moyenneService.getStatsByMatiere(matiereId));
    }
}
