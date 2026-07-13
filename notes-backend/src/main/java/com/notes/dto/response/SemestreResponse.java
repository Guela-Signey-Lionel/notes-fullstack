package com.notes.dto.response;
import com.notes.entity.StatutSemestre;
import lombok.*;
import java.time.LocalDate;
import java.util.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class SemestreResponse {
    private UUID id;
    private int numero;
    private String anneeAcademique;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private StatutSemestre statut;
    private UUID promotionId;
    private String promotionNom;
}
