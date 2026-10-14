package com.stableroomies.hostelservice.controller;

import com.stableroomies.hostelservice.model.RoomTypeConfig;
import com.stableroomies.hostelservice.service.RoomTypeConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints for room-type availability management.
 *
 * Public (student):
 *   GET  /api/room-type-config/available   – list of enabled room-type/AC combos
 *
 * Admin:
 *   GET  /api/room-type-config             – all configs
 *   PUT  /api/room-type-config/{id}        – update a single config (counts + flag)
 *   POST /api/room-type-config/{id}/toggle – flip the available flag
 *   PUT  /api/room-type-config/bulk        – bulk update from admin UI
 */
@RestController
@RequestMapping("/api/room-type-config")
@CrossOrigin(origins = "*")
public class RoomTypeConfigController {

    @Autowired
    private RoomTypeConfigService service;

    // ── Student-facing ──────────────────────────────────────────────────────

    @GetMapping("/available")
    public List<RoomTypeConfig> getAvailable() {
        return service.getAvailable();
    }

    // ── Admin-facing ────────────────────────────────────────────────────────

    @GetMapping
    public List<RoomTypeConfig> getAll() {
        return service.getAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomTypeConfig> update(
            @PathVariable Long id,
            @RequestBody RoomTypeConfig patch) {
        return ResponseEntity.ok(service.update(id, patch));
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<RoomTypeConfig> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggleAvailability(id));
    }

    @PutMapping("/bulk")
    public ResponseEntity<List<RoomTypeConfig>> bulkUpdate(
            @RequestBody List<RoomTypeConfig> updates) {
        return ResponseEntity.ok(service.updateAll(updates));
    }

    @PostMapping("/sync")
    public ResponseEntity<List<RoomTypeConfig>> syncInventory() {
        return ResponseEntity.ok(service.syncWithInventory());
    }
}
