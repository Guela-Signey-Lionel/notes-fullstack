package com.notes.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.UUID;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreatePromotionRequest {
    @NotBlank private String nom;
    @NotBlank private String anneeAcademique;
    @NotNull  private UUID filiereId;
}
