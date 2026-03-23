package com.example.stronaQr.qr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "qr_responses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrResponse {
    @Id
    private String responseId;
    
    @Column(name = "session_id", nullable = false)
    private String sessionId;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "nickname", nullable = false)
    private String nickname;
    
    @Column(columnDefinition = "TEXT")
    private String response;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (responseId == null) {
            responseId = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
    }
}
