package com.notes.dto.response;
import lombok.*;
import java.math.BigDecimal;
import java.util.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MoyenneUEResponse {
    private UUID ueId;
    private String ueCode;
    private String ueIntitule;
    private int creditsEcts;
    private BigDecimal moyenneUE;
    private boolean validee;
    private List<NoteDetailResponse> notes;
}
