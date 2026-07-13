package com.notes.controller;
import com.notes.dto.request.*;
import com.notes.dto.response.*;
import com.notes.service.ReferentielService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/v1") @RequiredArgsConstructor
@Tag(name = "Référentiel académique")
public class ReferentielController {
    private final ReferentielService service;

    // Filières
    @GetMapping("/filieres")
    @Operation(summary="Lister les filières", description="Retourne la liste de toutes les filières disponibles dans l'établissement.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FiliereResponse>> filieres() { return ResponseEntity.ok(service.findAllFilieres()); }

    @PostMapping("/filieres")
    @Operation(summary="Créer une filière", description="Ajoute une nouvelle filière (Licence, Master, Doctorat) avec son code, son nom, son niveau et sa durée. Réservé aux administrateurs.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FiliereResponse> createFiliere(@Valid @RequestBody CreateFiliereRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createFiliere(req));
    }

    @PutMapping("/filieres/{id}")
    @Operation(summary="Modifier une filière", description="Met à jour les informations d'une filière existante (nom, code, niveau, durée). Réservé aux administrateurs.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FiliereResponse> updateFiliere(@PathVariable UUID id, @Valid @RequestBody CreateFiliereRequest req) {
        return ResponseEntity.ok(service.updateFiliere(id, req));
    }

    // Promotions
    @GetMapping("/promotions")
    @Operation(summary="Lister les promotions", description="Retourne la liste des promotions. Peut être filtrée par filière via le paramètre optionnel 'filiereId'.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PromotionResponse>> promotions(@RequestParam(required=false) UUID filiereId) {
        return ResponseEntity.ok(filiereId != null ? service.findPromotionsByFiliere(filiereId) : service.findAllPromotions());
    }

    @PostMapping("/promotions")
    @Operation(summary="Créer une promotion", description="Ajoute une nouvelle promotion (promotion d'une filière pour une année académique donnée). Réservé aux administrateurs.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionResponse> createPromotion(@Valid @RequestBody CreatePromotionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createPromotion(req));
    }

    // Semestres
    @GetMapping("/semestres")
    @Operation(summary="Lister les semestres", description="Retourne la liste des semestres pour une promotion donnée. Le paramètre 'promotionId' est obligatoire.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SemestreResponse>> semestres(@RequestParam UUID promotionId) {
        return ResponseEntity.ok(service.findSemestresByPromotion(promotionId));
    }

    @PostMapping("/semestres")
    @Operation(summary="Créer un semestre", description="Ajoute un nouveau semestre dans une promotion avec son numéro, son année académique et ses dates de début/fin. Réservé aux administrateurs.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SemestreResponse> createSemestre(@Valid @RequestBody CreateSemestreRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createSemestre(req));
    }

    @PatchMapping("/semestres/{id}/cloturer")
    @Operation(summary="Clôturer un semestre", description="Ferme définitivement un semestre. Aucune nouvelle note ne pourra être saisie dans un semestre clôturé. Réservé aux administrateurs.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SemestreResponse> cloturer(@PathVariable UUID id) { return ResponseEntity.ok(service.cloturerSemestre(id)); }

    @PatchMapping("/semestres/{id}/rouvrir")
    @Operation(summary="Rouvrir un semestre", description="Réouvre un semestre précédemment clôturé pour permettre la saisie de notes. Réservé aux administrateurs.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SemestreResponse> rouvrir(@PathVariable UUID id) { return ResponseEntity.ok(service.rouvrirSemestre(id)); }

    // UE
    @GetMapping("/ue")
    @Operation(summary="Lister les unités d'enseignement", description="Retourne la liste des UE (Unités d'Enseignement) pour un semestre donné. Le paramètre 'semestreId' est obligatoire.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UEResponse>> ues(@RequestParam UUID semestreId) { return ResponseEntity.ok(service.findUEBySemestre(semestreId)); }

    @PostMapping("/ue")
    @Operation(summary="Créer une unité d'enseignement", description="Ajoute une nouvelle UE avec son code, son intitulé et ses crédits ECTS dans un semestre. Réservé aux administrateurs.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UEResponse> createUE(@Valid @RequestBody CreateUERequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createUE(req));
    }

    // Matières
    @GetMapping("/matieres")
    @Operation(summary="Lister les matières", description="Retourne la liste des matières, filtrée par semestre ('semestreId') ou par enseignant ('enseignantId'). Au moins un des deux paramètres doit être fourni.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MatiereResponse>> matieres(
        @RequestParam(required=false) UUID semestreId,
        @RequestParam(required=false) UUID enseignantId) {
        if (enseignantId != null) return ResponseEntity.ok(service.findMatieresByEnseignant(enseignantId));
        return ResponseEntity.ok(service.findMatieresBySemestre(semestreId));
    }

    @PostMapping("/matieres")
    @Operation(summary="Créer une matière", description="Ajoute une nouvelle matière avec son code, son intitulé, son coefficient, son volume horaire, l'UE de rattachement et l'enseignant responsable. Réservé aux administrateurs.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatiereResponse> createMatiere(@Valid @RequestBody CreateMatiereRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createMatiere(req));
    }

    @PutMapping("/matieres/{id}")
    @Operation(summary="Modifier une matière", description="Met à jour les informations d'une matière existante (code, intitulé, coefficient, volume horaire, UE, enseignant). Réservé aux administrateurs.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatiereResponse> updateMatiere(@PathVariable UUID id, @Valid @RequestBody CreateMatiereRequest req) {
        return ResponseEntity.ok(service.updateMatiere(id, req));
    }

    // Inscriptions
    @PostMapping("/promotions/{promotionId}/etudiants/{etudiantId}")
    @Operation(summary="Inscrire un étudiant à une promotion", description="Inscrit un étudiant existant à une promotion pour une année académique. Réservé aux administrateurs.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> inscrire(@PathVariable UUID promotionId, @PathVariable UUID etudiantId) {
        service.inscrireEtudiant(promotionId, etudiantId); return ResponseEntity.noContent().build();
    }
}
