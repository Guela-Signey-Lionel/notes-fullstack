package com.notes.controller;
import com.notes.dto.request.*;
import com.notes.dto.response.*;
import com.notes.service.NoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController @RequestMapping("/api/v1/notes") @RequiredArgsConstructor
@Tag(name = "Notes")
public class NoteController {
    private final NoteService noteService;
    private com.notes.entity.Utilisateur getUser(@org.springframework.security.core.annotation.AuthenticationPrincipal Object p) {
        return (com.notes.entity.Utilisateur) p;
    }

    @PostMapping @PreAuthorize("hasRole('ENSEIGNANT')")
    @Operation(summary="Saisir une note")
    public ResponseEntity<NoteResponse> saisir(@Valid @RequestBody SaisieNoteRequest req,
        @org.springframework.security.core.annotation.AuthenticationPrincipal com.notes.entity.Utilisateur user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(noteService.saisirNote(req, user.getId()));
    }

    @PostMapping("/batch") @PreAuthorize("hasRole('ENSEIGNANT')")
    @Operation(summary="Saisie groupée (toute une classe)")
    public ResponseEntity<List<NoteResponse>> batch(@Valid @RequestBody BatchNotesRequest req,
        @org.springframework.security.core.annotation.AuthenticationPrincipal com.notes.entity.Utilisateur user) {
        return ResponseEntity.ok(noteService.saisirBatch(req, user.getId()));
    }

    @PutMapping("/{id}/corriger") @PreAuthorize("hasAnyRole('ENSEIGNANT','ADMIN')")
    @Operation(summary="Corriger une note avec motif")
    public ResponseEntity<NoteResponse> corriger(@PathVariable UUID id,
        @Valid @RequestBody CorrectionNoteRequest req,
        @org.springframework.security.core.annotation.AuthenticationPrincipal com.notes.entity.Utilisateur user) {
        return ResponseEntity.ok(noteService.corrigerNote(id, req, user.getId()));
    }

    @PatchMapping("/matieres/{matiereId}/verrouiller") @PreAuthorize("hasAnyRole('ENSEIGNANT','ADMIN')")
    @Operation(summary="Verrouiller toutes les notes d'une matière")
    public ResponseEntity<Void> verrouiller(@PathVariable UUID matiereId,
        @org.springframework.security.core.annotation.AuthenticationPrincipal com.notes.entity.Utilisateur user) {
        noteService.verrouillerMatiere(matiereId, user.getId()); return ResponseEntity.noContent().build();
    }

    @PatchMapping("/matieres/{matiereId}/deverrouiller") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deverrouiller(@PathVariable UUID matiereId) {
        noteService.deverrouillerMatiere(matiereId); return ResponseEntity.noContent().build();
    }

    @GetMapping("/etudiant/{etudiantId}/semestre/{semestreId}") @PreAuthorize("isAuthenticated()")
    @Operation(summary="Notes d'un étudiant pour un semestre")
    public ResponseEntity<List<NoteResponse>> byEtudiantSemestre(@PathVariable UUID etudiantId, @PathVariable UUID semestreId) {
        return ResponseEntity.ok(noteService.findByEtudiantAndSemestre(etudiantId, semestreId));
    }

    @GetMapping("/matiere/{matiereId}") @PreAuthorize("hasAnyRole('ENSEIGNANT','ADMIN')")
    @Operation(summary="Notes d'une matière (vue enseignant)")
    public ResponseEntity<List<NoteResponse>> byMatiere(@PathVariable UUID matiereId) {
        return ResponseEntity.ok(noteService.findByMatiere(matiereId));
    }

    @PostMapping("/import/csv") @PreAuthorize("hasAnyRole('ENSEIGNANT','ADMIN')")
    @Operation(summary="Importer des notes depuis un fichier CSV")
    public ResponseEntity<CsvImportResponse> importCSV(
        @RequestParam("file") MultipartFile file,
        @RequestParam UUID matiereId,
        @org.springframework.security.core.annotation.AuthenticationPrincipal com.notes.entity.Utilisateur user) {
        return ResponseEntity.ok(noteService.importerCSV(file, matiereId, user.getId()));
    }
}
