package com.notes.entity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity @Table(name = "enseignants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Enseignant {
    @Id private UUID id;
    @OneToOne(fetch = FetchType.LAZY) @MapsId @JoinColumn(name = "id")
    private Utilisateur utilisateur;
    @Column(length = 200) private String specialite;
    @Column(length = 100) private String grade;
}
