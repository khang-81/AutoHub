package com.tobeto.rentACar.core.services;

import com.tobeto.rentACar.services.dtos.user.response.GetUserByNameResponse;
import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;


@Service
public class JwtService {

    @Value("${jwt.key}")
    private String SECRET;

    @Value("${jwt.expiration}")
    private long EXPIRATION;

    /**
     * BUGFIX #1: Từ chối các default value yếu đã từng commit lên Git, đảm bảo mọi môi trường
     * đều cấu hình JWT_KEY riêng. Nếu thiếu hoặc trùng secret cũ → fail-fast.
     */
    private static final String[] FORBIDDEN_DEFAULT_SECRETS = {
            "QXV0b0h1YkBSZW50QUNhciNTZWNyZXRLZXkhMjAyNCQ=",
            "Y2hhbmdlbWU=", // legacy dev-secret fallback
    };

    @PostConstruct
    void assertSecureSecret() {
        if (SECRET == null || SECRET.isBlank()) {
            throw new IllegalStateException(
                    "Thiếu biến môi trường JWT_KEY. Hãy set JWT_KEY trong .env hoặc docker-compose.");
        }
        for (String forbidden : FORBIDDEN_DEFAULT_SECRETS) {
            if (forbidden.equals(SECRET)) {
                throw new IllegalStateException(
                        "JWT_KEY đang dùng giá trị mặc định công khai trên Git. Hãy đổi secret mới (Base64 ≥ 32 bytes random).");
            }
        }
        // Base64 → raw ≥ 32 bytes (256-bit) cho HS256.
        try {
            byte[] raw = Decoders.BASE64.decode(SECRET);
            if (raw.length < 32) {
                throw new IllegalStateException(
                        "JWT_KEY quá yếu (cần ≥ 32 bytes raw sau Base64 decode, hiện " + raw.length + ").");
            }
        } catch (Exception e) {
            throw new IllegalStateException("JWT_KEY không phải chuỗi Base64 hợp lệ: " + e.getMessage(), e);
        }
    }

    public String generateToken(String email, GetUserByNameResponse userResponse) {
        return generateToken(email, userResponse, 0);
    }

    public String generateToken(String email, GetUserByNameResponse userResponse, int tokenVersion) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", userResponse.getId());
        claims.put("tv", tokenVersion);
        return createToken(claims, email, userResponse.getId(), tokenVersion);
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        String username = extractUser(token);
        Date expirationDate = extractExpiration(token);
        return userDetails.getUsername().equals(username) && !expirationDate.before(new Date());
    }
    /** Extracts userId and throws {@link BusinessException} if the claim is absent. Use instead of
     * {@link #extractUserId} + manual null-check / unboxing to avoid NullPointerException. */
    public int requireUserId(String token) {
        Integer id = extractUserId(token);
        if (id == null) {
            throw new BusinessException("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        }
        return id;
    }

    public Integer extractUserId(String token) {
        Claims claims = Jwts
                .parser()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        Object raw = claims.get("id");
        if (raw == null) {
            return null;
        }
        if (raw instanceof Number) {
            return ((Number) raw).intValue();
        }
        if (raw instanceof String) {
            try {
                return Integer.parseInt(((String) raw).trim());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return claims.get("id", Integer.class);
    }

    /** null khi JWT cũ không có claim "tv" (token phát hành trước khi triển khai token-version). */
    public Integer extractTokenVersion(String token) {
        Claims claims = Jwts
                .parser()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        Object raw = claims.get("tv");
        if (raw == null) {
            return null;
        }
        if (raw instanceof Number) {
            return ((Number) raw).intValue();
        }
        if (raw instanceof String) {
            try {
                return Integer.parseInt(((String) raw).trim());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }
    private Date extractExpiration(String token) {
        Claims claims = Jwts
                .parser()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getExpiration();
    }
    public String extractUser(String token) {
        Claims claims = Jwts
                .parser()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }


    private String createToken(Map<String, Object> claims, String userName, int id, int tokenVersion) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userName)
                .claim("id", id)
                .claim("tv", tokenVersion)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}