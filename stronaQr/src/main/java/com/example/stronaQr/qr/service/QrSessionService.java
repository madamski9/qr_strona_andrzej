package com.example.stronaQr.qr.service;

import com.example.stronaQr.qr.dto.SessionInfoDto;
import com.example.stronaQr.qr.dto.UserResponseDto;
import com.example.stronaQr.qr.entity.QrResponse;
import com.example.stronaQr.qr.entity.QrSession;
import com.example.stronaQr.qr.entity.QrUser;
import com.example.stronaQr.qr.repository.QrResponseRepository;
import com.example.stronaQr.qr.repository.QrSessionRepository;
import com.example.stronaQr.qr.repository.QrUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QrSessionService {
    private final QrSessionRepository sessionRepository;
    private final QrUserRepository userRepository;
    private final QrResponseRepository responseRepository;

    public SessionInfoDto createOrGetSession(String sessionId) {
        QrSession session = sessionRepository.findById(sessionId)
                .orElseGet(() -> {
                    QrSession newSession = QrSession.builder()
                            .sessionId(sessionId)
                            .build();
                    return sessionRepository.save(newSession);
                });
        return SessionInfoDto.fromEntity(session);
    }

    public SessionInfoDto getSessionInfo(String sessionId) {
        QrSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found: " + sessionId));
        return SessionInfoDto.fromEntity(session);
    }

    public String submitNickname(String sessionId, String nickname) {
        createOrGetSession(sessionId);

        QrUser user = QrUser.builder()
                .sessionId(sessionId)
                .nickname(nickname)
                .userId(UUID.randomUUID().toString())
                .build();

        QrUser savedUser = userRepository.save(user);
        return savedUser.getUserId();
    }

    public UserResponseDto submitResponse(String sessionId, String userId, String responseText) {
        QrUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        QrResponse response = QrResponse.builder()
                .sessionId(sessionId)
                .userId(userId)
                .nickname(user.getNickname())
                .response(responseText)
                .build();

        QrResponse savedResponse = responseRepository.save(response);
        return UserResponseDto.fromEntity(savedResponse);
    }

    public List<UserResponseDto> getUserResponses(String sessionId, String userId) {
        return responseRepository.findBySessionIdAndUserId(sessionId, userId)
                .stream()
                .map(UserResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<UserResponseDto> getSessionResponses(String sessionId) {
        return responseRepository.findBySessionId(sessionId)
                .stream()
                .map(UserResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public void resetSession(String sessionId) {
        List<QrUser> users = userRepository.findBySessionId(sessionId);
        List<QrResponse> responses = responseRepository.findBySessionId(sessionId);
        
        responseRepository.deleteAll(responses);
        userRepository.deleteAll(users);
        
        QrSession session = sessionRepository.findById(sessionId)
                .orElse(null);
        if (session != null) {
            session.setStatus(QrSession.SessionStatus.CLOSED);
            sessionRepository.save(session);
        }
    }
}
