package com.notes.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.*;

@Entity @Table(name = "etudiants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Etudiant {
    @Id private UUID id;
    @OneToOne(fetch = FetchType.LAZY) @MapsId @JoinColumn(name = "id")
    private Utilisateur utilisateur;
    @Column(name = "numero_etudiant", nullable = false, unique = true) private String numeroEtudiant;
    @Column(name = "date_naissance") private LocalDate dateNaissance;
    @Column(length = 20) private String telephone;
    @Column(columnDefinition = "TEXT") private String adresse;
    @Column(name = "photo_url") private String photoUrl;
    @ManyToMany @JoinTable(name = "inscriptions_promotions",
        joinColumns = @JoinColumn(name = "etudiant_id"),
        inverseJoinColumns = @JoinColumn(name = "promotion_id"))
    @Builder.Default private List<Promotion> promotions = new ArrayList<>();
}
