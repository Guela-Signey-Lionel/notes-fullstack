package com.notes.dto.response;
import lombok.*;
import java.util.List;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ClassementResponse {
    private int totalEtudiants;
    private String semestreNom;
    private String promotionNom;
    private List<MoyenneResponse> classement;
}
