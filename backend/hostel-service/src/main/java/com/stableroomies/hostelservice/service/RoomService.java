package com.stableroomies.hostelservice.service;

import com.stableroomies.hostelservice.model.Room;
import com.stableroomies.hostelservice.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public List<Room> getRoomsByHostelId(Long hostelId) {
        return roomRepository.findByHostelId(hostelId);
    }

    public Optional<Room> getRoomById(Long id) {
        return roomRepository.findById(id);
    }

    public Room createRoom(Room room) {
        return roomRepository.save(room);
    }

    public Room updateRoom(Long id, Room room) {
        room.setId(id);
        return roomRepository.save(room);
    }

    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }

    // Dashboard Statistics
    public com.stableroomies.hostelservice.dto.HostelDashboardStats getDashboardStats() {
        Long total = roomRepository.count();
        Long available = roomRepository.countByStatus("AVAILABLE");
        Long occupied = total - available;
        
        Long twoSharing = roomRepository.countByRoomType("2-Sharing");
        Long threeSharing = roomRepository.countByRoomType("3-Sharing");
        Long fourSharing = roomRepository.countByRoomType("4-Sharing");
        
        return new com.stableroomies.hostelservice.dto.HostelDashboardStats(
            total, available, occupied, twoSharing, threeSharing, fourSharing
        );
    }
}
