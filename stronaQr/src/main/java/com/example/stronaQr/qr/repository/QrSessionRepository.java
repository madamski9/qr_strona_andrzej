package com.example.stronaQr.qr.repository;

import com.example.stronaQr.qr.entity.QrSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QrSessionRepository extends JpaRepository<QrSession, String> {
}
