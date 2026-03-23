package com.example.stronaQr.qr.controller;

import com.example.stronaQr.qr.dto.SessionInfoDto;
import com.example.stronaQr.qr.dto.UserResponseDto;
import com.example.stronaQr.qr.service.QrSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qr")
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
@RequiredArgsConstructor
public class QrController {
    private final QrSessionService qrSessionService;

    @PostMapping("/sessions")
    public ResponseEntity<SessionInfoDto> createSession(@RequestBody Map<String, String> request) {
        String sessionId = request.get("sessionId");
        SessionInfoDto sessionInfo = qrSessionService.createOrGetSession(sessionId);
        return ResponseEntity.ok(sessionInfo);
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<SessionInfoDto> getSessionInfo(@PathVariable String sessionId) {
        SessionInfoDto sessionInfo = qrSessionService.getSessionInfo(sessionId);
        return ResponseEntity.ok(sessionInfo);
    }

    @PutMapping("/sessions/{sessionId}/question")
    public ResponseEntity<SessionInfoDto> updateSessionQuestion(
            @PathVariable String sessionId,
            @RequestBody Map<String, String> request
    ) {
        String question = request.get("question");
        SessionInfoDto sessionInfo = qrSessionService.updateSessionQuestion(sessionId, question);
        return ResponseEntity.ok(sessionInfo);
    }

    @PostMapping("/sessions/{sessionId}/login")
    public ResponseEntity<Map<String, String>> submitNickname(
            @PathVariable String sessionId,
            @RequestBody Map<String, String> request
    ) {
        String nickname = request.get("nickname");
        String userId = qrSessionService.submitNickname(sessionId, nickname);
        return ResponseEntity.ok(Map.of("userId", userId));
    }

    @PostMapping("/sessions/{sessionId}/response")
    public ResponseEntity<UserResponseDto> submitResponse(
            @PathVariable String sessionId,
            @RequestBody Map<String, String> request
    ) {
        String userId = request.get("userId");
        String response = request.get("response");
        UserResponseDto responseDto = qrSessionService.submitResponse(sessionId, userId, response);
        return ResponseEntity.ok(responseDto);
    }

    @GetMapping("/sessions/{sessionId}/user/{userId}")
    public ResponseEntity<List<UserResponseDto>> getUserResponses(
            @PathVariable String sessionId,
            @PathVariable String userId
    ) {
        List<UserResponseDto> responses = qrSessionService.getUserResponses(sessionId, userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/sessions/{sessionId}/responses")
    public ResponseEntity<List<UserResponseDto>> getSessionResponses(@PathVariable String sessionId) {
        List<UserResponseDto> responses = qrSessionService.getSessionResponses(sessionId);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/sessions/{sessionId}/reset")
    public ResponseEntity<Void> resetSession(@PathVariable String sessionId) {
        qrSessionService.resetSession(sessionId);
        return ResponseEntity.ok().build();
    }
}
