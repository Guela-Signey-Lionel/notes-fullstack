package com.notes.dto.response;
import com.notes.entity.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class NoteResponse {
    private UUID id;
    private UUID etudiantId;
    private String etudiantNom;
    private String numeroEtudiant;
    private UUID matiereId;
    private String matiereIntitule;
    private BigDecimal valeur;
    private TypeNote typeNote;
    private StatutNoteEnum statut;
    private String commentaire;
    private boolean verrouille;
    private LocalDateTime dateSaisie;
    private LocalDateTime dateModification;
}
