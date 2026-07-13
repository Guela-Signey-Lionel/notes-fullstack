package com.notes.entity;
import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity @Table(name = "unites_enseignement")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UniteEnseignement {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false, length = 50) private String code;
    @Column(nullable = false, length = 200) private String intitule;
    @Column(name = "credits_ects", nullable = false) @Builder.Default private int creditsEcts = 3;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "semestre_id", nullable = false) private Semestre semestre;
    @OneToMany(mappedBy = "ue", cascade = CascadeType.ALL) @Builder.Default private List<Matiere> matieres = new ArrayList<>();
}
