package com.notes.controller;
import com.notes.service.ExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController @RequestMapping("/api/v1/export") @RequiredArgsConstructor
@Tag(name = "Export PDF & Excel")
public class ExportController {
    private final ExportService exportService;

    @GetMapping("/releve/{etudiantId}/semestre/{semestreId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary="Télécharger le relevé de notes PDF d'un étudiant")
    public ResponseEntity<byte[]> relevePdf(@PathVariable UUID etudiantId, @PathVariable UUID semestreId) {
        byte[] pdf = exportService.genererReleve(etudiantId, semestreId);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"releve-" + etudiantId + ".pdf\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }

    @GetMapping("/classement/promotion/{promotionId}/semestre/{semestreId}/excel")
    @PreAuthorize("hasAnyRole('ADMIN','ENSEIGNANT')")
    @Operation(summary="Exporter le classement en Excel")
    public ResponseEntity<byte[]> classementExcel(@PathVariable UUID promotionId, @PathVariable UUID semestreId) {
        byte[] excel = exportService.genererExcelClassement(promotionId, semestreId);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"classement-" + semestreId + ".xlsx\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(excel);
    }

    @GetMapping("/notes/matiere/{matiereId}/excel")
    @PreAuthorize("hasAnyRole('ADMIN','ENSEIGNANT')")
    @Operation(summary="Exporter les notes d'une matière en Excel")
    public ResponseEntity<byte[]> notesMatiere(@PathVariable UUID matiereId) {
        byte[] excel = exportService.exporterNotesMatiere(matiereId);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"notes-matiere-" + matiereId + ".xlsx\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(excel);
    }
}
