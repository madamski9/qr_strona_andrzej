package com.example.stronaQr.qr.repository;

import com.example.stronaQr.qr.entity.QrResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QrResponseRepository extends JpaRepository<QrResponse, String> {
    List<QrResponse> findBySessionIdAndUserId(String sessionId, String userId);
    List<QrResponse> findBySessionId(String sessionId);
}
