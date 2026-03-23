package com.example.stronaQr.qr.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdminAuthService {
    private static final Duration TOKEN_TTL = Duration.ofHours(12);

    private final Map<String, Instant> activeTokens = new ConcurrentHashMap<>();

    @Value("${app.admin.password}")
    private String configuredAdminPassword;

    public String login(String password) {
        cleanupExpiredTokens();

        if (configuredAdminPassword == null || configuredAdminPassword.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Brak konfiguracji APP_ADMIN_PASSWORD");
        }

        if (password == null || !password.equals(configuredAdminPassword)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nieprawidlowe haslo admina");
        }

        String token = UUID.randomUUID().toString();
        activeTokens.put(token, Instant.now().plus(TOKEN_TTL));
        return token;
    }

    public void requireAdmin(String token) {
        cleanupExpiredTokens();

        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Brak tokenu admina");
        }

        Instant expiresAt = activeTokens.get(token);
        if (expiresAt == null || expiresAt.isBefore(Instant.now())) {
            activeTokens.remove(token);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sesja admina wygasla");
        }
    }

    public void logout(String token) {
        if (token != null && !token.isBlank()) {
            activeTokens.remove(token);
        }
    }

    private void cleanupExpiredTokens() {
        Instant now = Instant.now();
        activeTokens.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }
}
