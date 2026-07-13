package com.notes.dto.request;

import com.notes.entity.RoleUtilisateur;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateUtilisateurRequest {
    @Size(max = 100)
    private String nom;

    @Size(max = 100)
    private String prenom;

    @Email
    private String email;

    @Size(min = 8)
    private String motDePasse;

    private String specialite;
    private String grade;
    private String numeroEtudiant;

    private String telephone;
    private String adresse;
}
