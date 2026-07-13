package com.notes.security;
import com.notes.entity.RefreshToken;
import com.notes.repository.RefreshTokenRepository;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SecurityException;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component @RequiredArgsConstructor @Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final RefreshTokenRepository refreshTokenRepo;

    @Value("${app.jwt.refresh-token-expiration}")
    private long refreshTokenExpMs;

    @Override protected void doFilterInternal(@NonNull HttpServletRequest req, @NonNull HttpServletResponse res, @NonNull FilterChain chain) throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) { chain.doFilter(req, res); return; }

        String jwt = header.substring(7);
        String email = null;

        try {
            email = jwtService.extractUsername(jwt);
        } catch (ExpiredJwtException e) {
            // Token expiré → tentative d'auto-refresh si Refresh-Token fourni
            email = e.getClaims().getSubject();
            if (email != null) {
                String refreshHeader = req.getHeader("Refresh-Token");
                if (refreshHeader != null && !refreshHeader.isBlank()) {
                    autoRefresh(req, res, email, refreshHeader);
                }
            }
            // Si l'auto-refresh a fonctionné, on saute la validation normale
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                chain.doFilter(req, res);
                return;
            }
        } catch (SecurityException e) {
            log.warn("Signature JWT invalide: {}", e.getMessage());
        } catch (Exception e) {
            log.warn("JWT invalide: {}", e.getMessage());
        }

        // Validation normale du JWT (token non expiré)
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails ud = userDetailsService.loadUserByUsername(email);
                if (jwtService.isValid(jwt, ud)) {
                    var auth = new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception ex) {
                log.warn("Validation JWT échouée: {}", ex.getMessage());
            }
        }

        chain.doFilter(req, res);
    }

    private void autoRefresh(HttpServletRequest req, HttpServletResponse res, String email, String refreshHeader) {
        try {
            var rtOpt = refreshTokenRepo.findByToken(refreshHeader);
            if (rtOpt.isEmpty()) {
                log.warn("Refresh token introuvable pour {}", email);
                return;
            }

            RefreshToken rt = rtOpt.get();

            // Vérifier que le refresh token appartient bien à l'utilisateur
            String rtOwnerEmail = rt.getUtilisateur().getEmail();
            if (!rtOwnerEmail.equals(email)) {
                log.warn("Incohérence utilisateur refresh token: token pour {} mais utilisateur {}", email, rtOwnerEmail);
                return;
            }

            if (rt.isRevoque() || rt.isExpire()) {
                log.warn("Refresh token expiré ou révoqué pour {}", email);
                return;
            }

            // Rotation : révoquer l'ancien refresh token
            rt.setRevoque(true);

            UserDetails ud = userDetailsService.loadUserByUsername(email);

            String newAccess = jwtService.generateAccessToken(ud);
            String newRefresh = jwtService.generateRefreshToken(ud);

            refreshTokenRepo.save(RefreshToken.builder()
                .token(newRefresh)
                .utilisateur(rt.getUtilisateur())
                .expiration(java.time.LocalDateTime.now().plusSeconds(refreshTokenExpMs / 1000))
                .build());

            res.setHeader("X-New-Access-Token", newAccess);
            res.setHeader("X-New-Refresh-Token", newRefresh);

            var auth = new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
            SecurityContextHolder.getContext().setAuthentication(auth);

            log.info("Auto-refresh réussi pour {}", email);
        } catch (Exception e) {
            log.warn("Auto-refresh échoué pour {}: {}", email, e.getMessage());
        }
    }
}
