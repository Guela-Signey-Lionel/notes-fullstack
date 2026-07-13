package com.notes.entity;
import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity @Table(name = "promotions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Promotion {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false, length = 200) private String nom;
    @Column(name = "annee_academique", nullable = false, length = 20) private String anneeAcademique;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "filiere_id", nullable = false) private Filiere filiere;
    @Column(nullable = false) @Builder.Default private boolean actif = true;
    @ManyToMany(mappedBy = "promotions") @Builder.Default private List<Etudiant> etudiants = new ArrayList<>();
    @OneToMany(mappedBy = "promotion", cascade = CascadeType.ALL) @Builder.Default private List<Semestre> semestres = new ArrayList<>();
}
