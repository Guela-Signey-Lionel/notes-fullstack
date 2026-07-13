package com.notes.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name = "refresh_tokens")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RefreshToken {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false, unique = true, length = 512) private String token;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "utilisateur_id", nullable = false) private Utilisateur utilisateur;
    @Column(nullable = false) private LocalDateTime expiration;
    @Column(nullable = false) @Builder.Default private boolean revoque = false;
    @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
    public boolean isExpire() { return LocalDateTime.now().isAfter(expiration); }
}
