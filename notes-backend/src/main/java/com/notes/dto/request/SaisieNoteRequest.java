package com.notes.dto.request;
import com.notes.entity.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SaisieNoteRequest {
    @NotNull private UUID etudiantId;
    @NotNull private UUID matiereId;
    @DecimalMin("0.00") @DecimalMax("20.00") private BigDecimal valeur;
    @NotNull private TypeNote typeNote;
    @NotNull private StatutNoteEnum statut;
    @Size(max=500) private String commentaire;
}
