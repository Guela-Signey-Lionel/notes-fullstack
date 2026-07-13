package com.notes.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.*;

@Entity @Table(name = "semestres")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Semestre {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false) private int numero;
    @Column(name = "annee_academique", nullable = false, length = 20) private String anneeAcademique;
    @Column(name = "date_debut") private LocalDate dateDebut;
    @Column(name = "date_fin") private LocalDate dateFin;
    @Enumerated(EnumType.STRING) @Column(length = 20)
    @Builder.Default private StatutSemestre statut = StatutSemestre.OUVERT;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "promotion_id", nullable = false) private Promotion promotion;
    @OneToMany(mappedBy = "semestre", cascade = CascadeType.ALL) @Builder.Default private List<UniteEnseignement> ues = new ArrayList<>();
}
