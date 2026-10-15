package com.stableroomies.hostelservice.controller;

import com.stableroomies.hostelservice.dto.RoomInventoryDTO;
import com.stableroomies.hostelservice.model.Room;
import com.stableroomies.hostelservice.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
// No @CrossOrigin here on purpose: the gateway is the single CORS authority for
// /api/*. A second Access-Control-Allow-Origin from this service makes the
// response carry two values, which browsers reject outright.
public class RoomController {

    @Autowired
    private RoomService roomService;

    @GetMapping
    public List<Room> getAllRooms() {
        return roomService.getAllRooms();
    }

    @GetMapping("/hostel/{hostelId}")
    public List<Room> getRoomsByHostelId(@PathVariable Long hostelId) {
        return roomService.getRoomsByHostelId(hostelId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        return roomService.getRoomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        // 201, matching every other create endpoint (see HostelController).
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(room));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room room) {
        return ResponseEntity.ok(roomService.updateRoom(id, room));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/hostel/{hostelId}/sync-inventory")
    public ResponseEntity<List<Room>> syncHostelInventory(
            @PathVariable Long hostelId,
            @RequestBody RoomInventoryDTO inventory) {
        return ResponseEntity.ok(roomService.syncHostelRoomInventory(hostelId, inventory));
    }
}
