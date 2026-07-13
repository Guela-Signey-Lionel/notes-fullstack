package com.notes.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name = "moyennes_calculees")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MoyenneCalculee {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "etudiant_id", nullable = false) private Etudiant etudiant;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "semestre_id", nullable = false) private Semestre semestre;
    @Column(precision = 5, scale = 2) private BigDecimal moyenne;
    @Enumerated(EnumType.STRING) @Column(length = 20) private MentionEnum mention;
    private Integer rang;
    @Column(name = "credits_obtenus") @Builder.Default private int creditsObtenus = 0;
    @Builder.Default private boolean valide = false;
    @Column(name = "date_calcul") private LocalDateTime dateCalcul;
    @PrePersist @PreUpdate protected void onSave() { dateCalcul = LocalDateTime.now(); }
}
