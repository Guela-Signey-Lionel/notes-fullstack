package com.notes.dto.response;
import lombok.*;
import java.util.Map;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class StatsResponse {
    private String intitule;
    private long totalEtudiants;
    private double moyenne;
    private double min;
    private double max;
    private double ecartType;
    private double tauxReussite;
    private Map<String, Long> distributionMentions;
    private Map<String, Long> distributionParTranche;
}
