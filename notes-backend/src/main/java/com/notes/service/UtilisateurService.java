package com.notes.service;

import com.notes.dto.request.CreateUtilisateurRequest;
import com.notes.dto.response.UtilisateurResponse;
import com.notes.entity.*;
import com.notes.exception.NotesException;
import com.notes.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service @RequiredArgsConstructor @Transactional
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepo;
    private final EtudiantRepository etudiantRepo;
    private final EnseignantRepository enseignantRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<UtilisateurResponse> findByRole(RoleUtilisateur role) {
        return utilisateurRepo.findByRoleAndActif(role, true)
            .stream().map(authService::mapUser).toList();
    }

    @Transactional(readOnly = true)
    public com.notes.dto.response.PageResponse<UtilisateurResponse> findEtudiants(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("utilisateur.nom"));
        var result = (search != null && !search.isBlank())
            ? etudiantRepo.rechercher(search.trim(), pageable)
            : etudiantRepo.findAll(pageable);
        return com.notes.dto.response.PageResponse.of(result.map(e -> authService.mapUser(e.getUtilisateur())));
    }

    public UtilisateurResponse create(CreateUtilisateurRequest req) {
        if (utilisateurRepo.existsByEmail(req.getEmail()))
            throw NotesException.conflict("Email déjà utilisé");

        Utilisateur u = utilisateurRepo.save(Utilisateur.builder()
            .nom(req.getNom()).prenom(req.getPrenom()).email(req.getEmail())
            .motDePasse(passwordEncoder.encode(req.getMotDePasse()))
            .role(req.getRole()).build());

        if (req.getRole() == RoleUtilisateur.ETUDIANT) {
            if (req.getNumeroEtudiant() == null || req.getNumeroEtudiant().isBlank())
                throw NotesException.badRequest("Numéro étudiant obligatoire");
            if (etudiantRepo.existsByNumeroEtudiant(req.getNumeroEtudiant()))
                throw NotesException.conflict("Numéro étudiant déjà utilisé");
            etudiantRepo.save(Etudiant.builder().utilisateur(u)
                .numeroEtudiant(req.getNumeroEtudiant()).build());
        } else if (req.getRole() == RoleUtilisateur.ENSEIGNANT) {
            enseignantRepo.save(Enseignant.builder().utilisateur(u)
                .specialite(req.getSpecialite()).grade(req.getGrade()).build());
        }
        return authService.mapUser(u);
    }

    public void toggleActif(UUID id) {
        Utilisateur u = utilisateurRepo.findById(id)
            .orElseThrow(() -> NotesException.notFound("Utilisateur"));
        u.setActif(!u.isActif());
        utilisateurRepo.save(u);
    }

    public UtilisateurResponse uploadPhoto(UUID userId, String photoBase64) {
        Utilisateur u = utilisateurRepo.findById(userId)
            .orElseThrow(() -> NotesException.notFound("Utilisateur"));
        u.setPhoto(photoBase64);
        return authService.mapUser(utilisateurRepo.save(u));
    }

    public void importerEtudiantsCSV(org.springframework.web.multipart.MultipartFile file, UUID promotionId) {
        // Import CSV simplifié - format: nom;prenom;email;numeroEtudiant
        try (var reader = new com.opencsv.CSVReader(new java.io.InputStreamReader(file.getInputStream()))) {
            String[] line; reader.skip(1);
            var repo = utilisateurRepo;
            while ((line = reader.readNext()) != null) {
                if (line.length < 4) continue;
                try {
                    var req = CreateUtilisateurRequest.builder()
                        .nom(line[0].trim()).prenom(line[1].trim())
                        .email(line[2].trim()).motDePasse("PKFokam@2024")
                        .role(RoleUtilisateur.ETUDIANT).numeroEtudiant(line[3].trim()).build();
                    create(req);
                } catch (Exception ignored) {}
            }
        } catch (Exception e) {
            throw NotesException.badRequest("Erreur lecture CSV: " + e.getMessage());
        }
    }
}
