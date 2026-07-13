package com.notes.dto.response;
import com.notes.entity.MentionEnum;
import lombok.*;
import java.math.BigDecimal;
import java.util.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MoyenneResponse {
    private UUID etudiantId;
    private String etudiantNom;
    private String numeroEtudiant;
    private UUID semestreId;
    private int semestreNumero;
    private BigDecimal moyenne;
    private MentionEnum mention;
    private Integer rang;
    private int creditsObtenus;
    private boolean valide;
    private List<MoyenneUEResponse> moyennesUE;
}
