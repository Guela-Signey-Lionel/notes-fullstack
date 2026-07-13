package com.notes.dto.response;
import com.notes.entity.NiveauFiliere;
import lombok.*;
import java.util.UUID;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FiliereResponse {
    private UUID id;
    private String nom;
    private String code;
    private NiveauFiliere niveau;
    private int duree;
    private boolean actif;
}
