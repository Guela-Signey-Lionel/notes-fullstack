package com.notes.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateSemestreRequest {
    @Min(1) @Max(10) private int numero;
    @NotBlank private String anneeAcademique;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    @NotNull private UUID promotionId;
}
