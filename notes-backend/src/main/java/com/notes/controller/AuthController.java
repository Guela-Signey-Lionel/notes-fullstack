package com.notes.controller;
import com.notes.dto.request.*;
import com.notes.dto.response.*;
import com.notes.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/auth") @RequiredArgsConstructor
@Tag(name = "Authentification")
public class AuthController {
    private final AuthService authService;
    @PostMapping("/login") @Operation(summary="Connexion JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req)); }
    @PostMapping("/refresh") @Operation(summary="Renouvellement du token")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest req) {
        return ResponseEntity.ok(authService.refresh(req)); }
    @PostMapping("/logout") @Operation(summary="Déconnexion")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserDetails user) {
        if (user == null) { return ResponseEntity.status(401).build(); }
        authService.logout(user.getUsername());
        return ResponseEntity.noContent().build(); }
}
