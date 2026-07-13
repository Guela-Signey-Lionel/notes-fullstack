package com.notes.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateMatiereRequest {
    @NotBlank @Size(max=50)  private String code;
    @NotBlank @Size(max=200) private String intitule;
    @NotNull @DecimalMin("0.1") @DecimalMax("10.0") private BigDecimal coefficient;
    private Integer volumeHoraire;
    @NotNull private UUID ueId;
    private UUID enseignantId;
}
