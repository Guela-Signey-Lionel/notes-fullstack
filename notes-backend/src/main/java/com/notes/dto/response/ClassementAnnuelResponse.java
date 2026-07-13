package com.notes.dto.response;

import lombok.*;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ClassementAnnuelResponse {
    private int totalEtudiants;
    private String anneeAcademique;
    private String promotionNom;
    private String semestre1Info;
    private String semestre2Info;
    private List<MoyenneAnnuelleResponse> classement;
}
