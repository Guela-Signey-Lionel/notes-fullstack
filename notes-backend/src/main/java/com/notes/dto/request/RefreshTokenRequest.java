package com.notes.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor
public class RefreshTokenRequest { @NotBlank private String refreshToken; }
