package com.example.stronaQr.qr.dto;

import com.example.stronaQr.qr.entity.QrResponse;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private String userId;
    private String nickname;
    private String response;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    public static UserResponseDto fromEntity(QrResponse response) {
        return UserResponseDto.builder()
                .userId(response.getUserId())
                .nickname(response.getNickname())
                .response(response.getResponse())
                .createdAt(response.getCreatedAt())
                .build();
    }
}
