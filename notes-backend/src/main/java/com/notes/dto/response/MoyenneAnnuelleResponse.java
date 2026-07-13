package com.notes.dto.response;

import com.notes.entity.MentionEnum;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MoyenneAnnuelleResponse {
    private UUID etudiantId;
    private String etudiantNom;
    private String numeroEtudiant;
    private BigDecimal moyenneS1;
    private BigDecimal moyenneS2;
    private BigDecimal moyenneAnnuelle;
    private MentionEnum mention;
    private Integer rang;
    private int creditsObtenus;
    private boolean valide;
}
