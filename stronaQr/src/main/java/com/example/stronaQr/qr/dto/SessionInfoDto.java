package com.example.stronaQr.qr.dto;

import com.example.stronaQr.qr.entity.QrSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionInfoDto {
    private String sessionId;
    private String status;

    public static SessionInfoDto fromEntity(QrSession session) {
        return SessionInfoDto.builder()
                .sessionId(session.getSessionId())
                .status(session.getStatus().toString())
                .build();
    }
}
