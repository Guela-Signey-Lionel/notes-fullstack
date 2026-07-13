package com.notes.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.*;
import java.util.function.Function;

@Service @Slf4j
public class JwtService {
    @Value("${app.jwt.secret}") private String secret;
    @Value("${app.jwt.access-token-expiration}") private long accessExp;
    @Value("${app.jwt.refresh-token-expiration}") private long refreshExp;

    private SecretKey key() { return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)); }

    public String generateAccessToken(UserDetails u) {
        Map<String,Object> claims = new HashMap<>();
        if (u instanceof com.notes.entity.Utilisateur ut) { claims.put("role", ut.getRole().name()); claims.put("nom", ut.getNomComplet()); }
        return build(claims, u, accessExp);
    }
    public String generateRefreshToken(UserDetails u) { return build(new HashMap<>(), u, refreshExp); }

    private String build(Map<String,Object> extra, UserDetails u, long exp) {
        return Jwts.builder().claims(extra).subject(u.getUsername())
            .issuedAt(new Date()).expiration(new Date(System.currentTimeMillis()+exp))
            .signWith(key()).compact();
    }
    public boolean isValid(String token, UserDetails u) { return extractUsername(token).equals(u.getUsername()) && !isExpired(token); }
    public String extractUsername(String token) { return extractClaim(token, Claims::getSubject); }
    private boolean isExpired(String token) { return extractClaim(token, Claims::getExpiration).before(new Date()); }
    public <T> T extractClaim(String token, Function<Claims,T> fn) {
        return fn.apply(Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload());
    }
}
