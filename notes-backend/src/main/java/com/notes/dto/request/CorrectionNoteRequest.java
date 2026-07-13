package com.notes.dto.request;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CorrectionNoteRequest {
    @DecimalMin("0.00") @DecimalMax("20.00") private BigDecimal nouvelleValeur;
    @NotBlank @Size(max=500) private String motifCorrection;
}
