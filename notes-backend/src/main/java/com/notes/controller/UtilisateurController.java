package com.notes.controller;
import com.notes.dto.request.CreateUtilisateurRequest;
import com.notes.dto.request.UpdateUtilisateurRequest;
import com.notes.dto.response.*;
import com.notes.entity.RoleUtilisateur;
import com.notes.service.UtilisateurService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController @RequestMapping("/api/v1/utilisateurs") @RequiredArgsConstructor
@Tag(name = "Utilisateurs")
public class UtilisateurController {
    private final UtilisateurService service;

    @GetMapping
    @Operation(summary="Lister les utilisateurs par rôle", description="Retourne la liste des utilisateurs filtrée par rôle (ADMIN, ENSEIGNANT, ETUDIANT). Par défaut, retourne les étudiants si aucun rôle n'est spécifié. Réservé aux administrateurs.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UtilisateurResponse>> findAll(@RequestParam(required=false) RoleUtilisateur role) {
        return ResponseEntity.ok(service.findByRole(role != null ? role : RoleUtilisateur.ETUDIANT));
    }

    @GetMapping("/etudiants")
    @Operation(summary="Liste paginée des étudiants", description="Retourne une liste paginée d'étudiants avec recherche par nom, prénom ou email. Paramètres : 'page' (défaut: 0), 'size' (défaut: 20), 'search' (optionnel).")
    @PreAuthorize("hasAnyRole('ADMIN','ENSEIGNANT')")
    public ResponseEntity<PageResponse<UtilisateurResponse>> etudiants(
        @RequestParam(defaultValue="0") int page,
        @RequestParam(defaultValue="20") int size,
        @RequestParam(required=false) String search) {
        return ResponseEntity.ok(service.findEtudiants(page, size, search));
    }

    @GetMapping("/enseignants")
    @Operation(summary="Liste des enseignants", description="Retourne la liste de tous les enseignants enregistrés dans le système. Accessible à tout utilisateur authentifié.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UtilisateurResponse>> enseignants() {
        return ResponseEntity.ok(service.findByRole(RoleUtilisateur.ENSEIGNANT));
    }

    @PostMapping
    @Operation(summary="Créer un compte", description="Crée un nouvel utilisateur (étudiant, enseignant ou administrateur) avec les informations personnelles et le rôle approprié. Réservé aux administrateurs.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UtilisateurResponse> create(@Valid @RequestBody CreateUtilisateurRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @PatchMapping("/{id}/toggle-actif")
    @Operation(summary="Activer / désactiver un compte", description="Active ou désactive le compte d'un utilisateur. Un compte désactivé ne peut plus se connecter au système. Réservé aux administrateurs.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> toggle(@PathVariable UUID id) { service.toggleActif(id); return ResponseEntity.noContent().build(); }

    @PutMapping("/profil")
    @Operation(summary="Modifier mon profil", description="Permet à l'utilisateur connecté de modifier ses propres informations (nom, prénom, email, mot de passe, téléphone, adresse). Seuls les champs fournis sont modifiés.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UtilisateurResponse> updateProfil(
        @Valid @RequestBody UpdateUtilisateurRequest req,
        @AuthenticationPrincipal com.notes.entity.Utilisateur user) {
        return ResponseEntity.ok(service.updateProfile(user.getId(), req));
    }

    @PutMapping("/{id}")
    @Operation(summary="Modifier un utilisateur (admin)", description="Permet à un administrateur de modifier les informations de n'importe quel utilisateur. Réservé aux administrateurs.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UtilisateurResponse> updateByAdmin(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateUtilisateurRequest req) {
        return ResponseEntity.ok(service.updateProfileByAdmin(id, req));
    }

    @PostMapping("/photo")
    @Operation(summary="Uploader la photo de profil", description="Enregistre la photo de l'utilisateur connecté (base64) dans la base de données.")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UtilisateurResponse> uploadPhoto(
        @RequestBody Map<String, String> body,
        @AuthenticationPrincipal com.notes.entity.Utilisateur user) {
        return ResponseEntity.ok(service.uploadPhoto(user.getId(), body.get("photo")));
    }

    @PostMapping("/etudiants/import-csv")
    @Operation(summary="Importer des étudiants en masse via CSV", description="Importe plusieurs étudiants à partir d'un fichier CSV et les inscrit automatiquement à la promotion spécifiée. Le fichier doit contenir les colonnes : nom, prénom, email. Réservé aux administrateurs.")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> importCSV(@RequestParam("file") MultipartFile file,
        @RequestParam UUID promotionId) {
        service.importerEtudiantsCSV(file, promotionId); return ResponseEntity.noContent().build();
    }
}
