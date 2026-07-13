package com.notes.dto.request;
import com.notes.entity.RoleUtilisateur;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.UUID;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateUtilisateurRequest {
    @NotBlank @Size(max=100) private String nom;
    @NotBlank @Size(max=100) private String prenom;
    @NotBlank @Email private String email;
    @NotBlank @Size(min=8) private String motDePasse;
    @NotNull private RoleUtilisateur role;
    private String specialite;
    private String grade;
    private String numeroEtudiant; // si rôle ETUDIANT
    private UUID promotionId;      // si rôle ETUDIANT (optionnel)
}
