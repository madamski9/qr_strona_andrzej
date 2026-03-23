package com.example.stronaQr.qr.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "qr_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrUser {
    @Id
    private String userId;
    
    @Column(name = "session_id", nullable = false)
    private String sessionId;
    
    @Column(nullable = false)
    private String nickname;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (userId == null) {
            userId = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
    }
}
