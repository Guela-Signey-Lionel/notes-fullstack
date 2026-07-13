package com.notes.dto.response;
import com.notes.entity.RoleUtilisateur;
import lombok.*;
import java.util.UUID;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UtilisateurResponse {
    private UUID id;
    private String nom;
    private String prenom;
    private String email;
    private RoleUtilisateur role;
    private boolean actif;
    private String specialite;
    private String grade;
    private String numeroEtudiant;
    private String photoUrl;
    private String filiereNom;
    private String promotionNom;
    private String promotionAnnee;
}
