package com.notes.dto.response;
import lombok.*;
import java.util.UUID;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PromotionResponse {
    private UUID id;
    private String nom;
    private String anneeAcademique;
    private FiliereResponse filiere;
    private boolean actif;
    private int nbEtudiants;
}
