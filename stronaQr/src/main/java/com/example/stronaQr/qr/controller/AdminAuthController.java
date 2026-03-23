package com.example.stronaQr.qr.controller;

import com.example.stronaQr.qr.service.AdminAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/qr/admin")
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
@RequiredArgsConstructor
public class AdminAuthController {
    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        String token = adminAuthService.login(password);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader(value = "X-Admin-Token", required = false) String adminToken) {
        adminAuthService.logout(adminToken);
        return ResponseEntity.ok().build();
    }
}
