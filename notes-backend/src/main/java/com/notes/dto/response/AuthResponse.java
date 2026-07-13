package com.notes.dto.response;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    @Builder.Default private String type = "Bearer";
    private UtilisateurResponse utilisateur;
}
