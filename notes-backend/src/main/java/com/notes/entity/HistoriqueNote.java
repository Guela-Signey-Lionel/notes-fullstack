package com.notes.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name = "historique_notes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HistoriqueNote {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "note_id", nullable = false) private Note note;
    @Column(name = "ancienne_valeur", precision = 5, scale = 2) private BigDecimal ancienneValeur;
    @Column(name = "nouvelle_valeur", precision = 5, scale = 2) private BigDecimal nouvelleValeur;
    @Column(name = "motif_correction", nullable = false, length = 500) private String motifCorrection;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "modifie_par", nullable = false) private Utilisateur modifiePar;
    @Column(name = "date_modification") private LocalDateTime dateModification;
    @PrePersist protected void onCreate() { dateModification = LocalDateTime.now(); }
}
