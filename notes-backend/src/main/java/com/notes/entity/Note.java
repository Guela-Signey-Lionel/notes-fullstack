package com.notes.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name = "notes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Note {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "etudiant_id", nullable = false) private Etudiant etudiant;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "matiere_id", nullable = false) private Matiere matiere;
    @Column(precision = 5, scale = 2) private BigDecimal valeur;
    @Enumerated(EnumType.STRING) @Column(name = "type_note", length = 20)
    @Builder.Default private TypeNote typeNote = TypeNote.UNIQUE;
    @Enumerated(EnumType.STRING) @Column(length = 20)
    @Builder.Default private StatutNoteEnum statut = StatutNoteEnum.PRESENT;
    @Column(length = 500) private String commentaire;
    @Column(nullable = false) @Builder.Default private boolean verrouille = false;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "saisie_par") private Enseignant saisiePar;
    @Column(name = "date_saisie") private LocalDateTime dateSaisie;
    @Column(name = "date_modification") private LocalDateTime dateModification;
    @PrePersist protected void onCreate() { dateSaisie = dateModification = LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate() { dateModification = LocalDateTime.now(); }
}
