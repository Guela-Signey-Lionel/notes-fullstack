package com.notes.dto.request;
import com.notes.entity.NiveauFiliere;
import jakarta.validation.constraints.*;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateFiliereRequest {
    @NotBlank @Size(max=200) private String nom;
    @NotBlank @Size(max=50)  private String code;
    @NotNull private NiveauFiliere niveau;
    @Min(1) @Max(10) private int duree;
}
