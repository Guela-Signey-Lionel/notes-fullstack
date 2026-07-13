package com.notes.dto.response;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MatiereResponse {
    private UUID id;
    private String code;
    private String intitule;
    private BigDecimal coefficient;
    private Integer volumeHoraire;
    private UUID ueId;
    private String ueIntitule;
    private UUID enseignantId;
    private String enseignantNom;
}
