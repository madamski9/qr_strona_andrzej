package com.example.stronaQr.global.controller;

import java.sql.Connection;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${app.cors.allowed-origin:http://localhost:4200}")
public class DbHealthController {

	private final DataSource dataSource;

	@Value("${spring.datasource.url}")
	private String datasourceUrl;

	public DbHealthController(DataSource dataSource) {
		this.dataSource = dataSource;
	}

	@GetMapping("/db-health")
	public ResponseEntity<Map<String, String>> dbHealth() {
		try (Connection ignored = dataSource.getConnection()) {
			return ResponseEntity.ok(Map.of(
					"status", "UP",
					"database", "CONNECTED",
					"datasource", datasourceUrl));
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
					"status", "DOWN",
					"database", "DISCONNECTED",
					"error", ex.getMessage()));
		}
	}
}
