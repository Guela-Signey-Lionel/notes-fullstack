package com.notes.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.UUID;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateUERequest {
    @NotBlank @Size(max=50)  private String code;
    @NotBlank @Size(max=200) private String intitule;
    @Min(1) @Max(30) private int creditsEcts;
    @NotNull private UUID semestreId;
}
