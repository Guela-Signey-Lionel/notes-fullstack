package com.notes.dto.response;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class NoteDetailResponse {
    private UUID matiereId;
    private String matiereCode;
    private String matiereIntitule;
    private BigDecimal coefficient;
    private BigDecimal noteCC;
    private BigDecimal noteExamen;
    private BigDecimal notefinale;
}
