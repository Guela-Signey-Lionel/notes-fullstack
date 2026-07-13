package com.notes.dto.response;
import lombok.*;
import java.util.List;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CsvImportResponse {
    private int totalLignes;
    private int importees;
    private int erreurs;
    private List<String> rapportErreurs;
}
