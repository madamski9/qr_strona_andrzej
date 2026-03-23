package com.example.stronaQr.qr.repository;

import com.example.stronaQr.qr.entity.QrUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QrUserRepository extends JpaRepository<QrUser, String> {
    List<QrUser> findBySessionId(String sessionId);
}
