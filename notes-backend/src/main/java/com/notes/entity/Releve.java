package com.notes.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name = "releves")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Releve {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "numero_releve", nullable = false, unique = true) private String numeroReleve;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "etudiant_id", nullable = false) private Etudiant etudiant;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "semestre_id", nullable = false) private Semestre semestre;
    @Column(name = "pdf_url") private String pdfUrl;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "genere_par") private Utilisateur generePar;
    @Column(name = "date_generation") private LocalDateTime dateGeneration;
    @PrePersist protected void onCreate() { dateGeneration = LocalDateTime.now(); }
}
