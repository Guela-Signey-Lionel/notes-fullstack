package com.notes.entity;
import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity @Table(name = "filieres")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Filiere {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false, length = 200) private String nom;
    @Column(nullable = false, unique = true, length = 50) private String code;
    @Enumerated(EnumType.STRING) @Column(length = 20)
    @Builder.Default private NiveauFiliere niveau = NiveauFiliere.LICENCE;
    @Column(nullable = false) @Builder.Default private int duree = 3;
    @Column(nullable = false) @Builder.Default private boolean actif = true;
    @OneToMany(mappedBy = "filiere", cascade = CascadeType.ALL)
    @Builder.Default private List<Promotion> promotions = new ArrayList<>();
}
