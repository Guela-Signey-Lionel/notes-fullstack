package com.notes.service;

import com.notes.dto.request.*;
import com.notes.dto.response.*;
import com.notes.entity.*;
import com.notes.exception.NotesException;
import com.notes.repository.*;
import com.notes.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service @RequiredArgsConstructor @Transactional
public class AuthService {

    private final UtilisateurRepository utilisateurRepo;
    private final RefreshTokenRepository refreshTokenRepo;
    private final EtudiantRepository etudiantRepo;
    private final EnseignantRepository enseignantRepo;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.jwt.refresh-token-expiration}") private long refreshExp;

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getMotDePasse()));
        Utilisateur u = utilisateurRepo.findByEmail(req.getEmail())
            .orElseThrow(() -> NotesException.notFound("Utilisateur"));
        if (!u.isActif()) throw NotesException.forbidden("Compte désactivé");

        refreshTokenRepo.deleteByUtilisateur(u);
        String access  = jwtService.generateAccessToken(u);
        String refresh = jwtService.generateRefreshToken(u);

        refreshTokenRepo.save(RefreshToken.builder().token(refresh).utilisateur(u)
            .expiration(LocalDateTime.now().plusSeconds(refreshExp/1000)).build());

        return AuthResponse.builder().accessToken(access).refreshToken(refresh)
            .utilisateur(mapUser(u)).build();
    }

    public AuthResponse refresh(RefreshTokenRequest req) {
        RefreshToken rt = refreshTokenRepo.findByToken(req.getRefreshToken())
            .orElseThrow(() -> NotesException.badRequest("Refresh token invalide"));
        if (rt.isRevoque() || rt.isExpire()) throw NotesException.badRequest("Token expiré ou révoqué");
        rt.setRevoque(true);
        Utilisateur u = rt.getUtilisateur();
        String access  = jwtService.generateAccessToken(u);
        String refresh = jwtService.generateRefreshToken(u);
        refreshTokenRepo.save(RefreshToken.builder().token(refresh).utilisateur(u)
            .expiration(LocalDateTime.now().plusSeconds(refreshExp/1000)).build());
        return AuthResponse.builder().accessToken(access).refreshToken(refresh)
            .utilisateur(mapUser(u)).build();
    }

    public void logout(String email) {
        utilisateurRepo.findByEmail(email).ifPresent(refreshTokenRepo::deleteByUtilisateur);
    }

    public UtilisateurResponse mapUser(Utilisateur u) {
        UtilisateurResponse.UtilisateurResponseBuilder b = UtilisateurResponse.builder()
            .id(u.getId()).nom(u.getNom()).prenom(u.getPrenom())
            .email(u.getEmail()).role(u.getRole()).actif(u.isActif())
            .photoUrl(u.getPhoto());
        if (u.getRole() == RoleUtilisateur.ENSEIGNANT) {
            enseignantRepo.findById(u.getId()).ifPresent(e -> { b.specialite(e.getSpecialite()); b.grade(e.getGrade()); });
        }
        if (u.getRole() == RoleUtilisateur.ETUDIANT) {
            etudiantRepo.findById(u.getId()).ifPresent(e -> {
                b.numeroEtudiant(e.getNumeroEtudiant());
                // Récupérer la première promotion active de l'étudiant
                e.getPromotions().stream()
                    .filter(Promotion::isActif)
                    .findFirst()
                    .ifPresent(p -> {
                        b.filiereNom(p.getFiliere().getNom());
                        b.promotionNom(p.getNom());
                        b.promotionAnnee(p.getAnneeAcademique());
                    });
            });
        }
        return b.build();
    }
}
