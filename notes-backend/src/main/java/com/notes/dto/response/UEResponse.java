package com.notes.dto.response;
import lombok.*;
import java.util.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UEResponse {
    private UUID id;
    private String code;
    private String intitule;
    private int creditsEcts;
    private UUID semestreId;
    private List<MatiereResponse> matieres;
}
