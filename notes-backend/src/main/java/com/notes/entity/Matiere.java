package com.notes.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity @Table(name = "matieres")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Matiere {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false, length = 50) private String code;
    @Column(nullable = false, length = 200) private String intitule;
    @Column(nullable = false, precision = 4, scale = 2) private BigDecimal coefficient;
    @Column(name = "volume_horaire") private Integer volumeHoraire;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "ue_id", nullable = false) private UniteEnseignement ue;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "enseignant_id") private Enseignant enseignant;
}
