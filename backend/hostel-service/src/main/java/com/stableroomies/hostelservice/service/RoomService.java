package com.stableroomies.hostelservice.service;

import com.stableroomies.hostelservice.dto.HostelDashboardStats;
import com.stableroomies.hostelservice.dto.RoomInventoryDTO;
import com.stableroomies.hostelservice.model.Hostel;
import com.stableroomies.hostelservice.model.Room;
import com.stableroomies.hostelservice.repository.HostelRepository;
import com.stableroomies.hostelservice.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HostelRepository hostelRepository;

    @Autowired
    @Lazy
    private RoomTypeConfigService roomTypeConfigService;

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
        Room saved = roomRepository.save(room);
        recalculateHostelStats(saved.getHostelId());
        return saved;
    }

    public Room updateRoom(Long id, Room room) {
        room.setId(id);
        Room saved = roomRepository.save(room);
        recalculateHostelStats(saved.getHostelId());
        return saved;
    }

    public void deleteRoom(Long id) {
        Optional<Room> r = roomRepository.findById(id);
        Long hostelId = r.map(Room::getHostelId).orElse(null);
        roomRepository.deleteById(id);
        if (hostelId != null) {
            recalculateHostelStats(hostelId);
        }
    }

    public void recalculateHostelStats(Long hostelId) {
        if (hostelId == null) return;
        try {
            Hostel hostel = hostelRepository.findById(hostelId).orElse(null);
            if (hostel == null) return;
            List<Room> allRooms = roomRepository.findByHostelId(hostelId);
            int totalRooms = allRooms.size();
            int totalCapacity = allRooms.stream()
                    .mapToInt(r -> r.getCapacity() != null ? r.getCapacity() : 0)
                    .sum();
            int totalOccupied = allRooms.stream()
                    .mapToInt(r -> r.getOccupiedCount() != null ? r.getOccupiedCount() : 0)
                    .sum();
            hostel.setTotalRooms(totalRooms);
            hostel.setTotalCapacity(totalCapacity);
            hostel.setAvailableCapacity(Math.max(0, totalCapacity - totalOccupied));
            hostelRepository.save(hostel);

            if (roomTypeConfigService != null) {
                roomTypeConfigService.syncWithInventory();
            }
        } catch (Exception ignored) {}
    }

    // Dashboard Statistics
    public HostelDashboardStats getDashboardStats() {
        Long total = roomRepository.count();
        Long available = roomRepository.countByStatus("AVAILABLE");
        Long occupied = total - available;
        
        Long twoSharing = roomRepository.countByRoomType("2-Sharing");
        Long threeSharing = roomRepository.countByRoomType("3-Sharing");
        Long fourSharing = roomRepository.countByRoomType("4-Sharing");
        
        return new HostelDashboardStats(
            total, available, occupied, twoSharing, threeSharing, fourSharing
        );
    }

    private boolean matchesType(Room room, String targetType) {
        if (room == null) return false;
        String rt = room.getRoomType() != null ? room.getRoomType().toUpperCase().replace("-", "_") : "";
        Integer cap = room.getCapacity();
        if ("INDIVIDUAL".equalsIgnoreCase(targetType)) {
            return rt.contains("1") || rt.contains("INDIVIDUAL") || rt.contains("SINGLE") || (cap != null && cap == 1);
        } else if ("2_SHARING".equalsIgnoreCase(targetType)) {
            return rt.contains("2") || (cap != null && cap == 2);
        } else if ("3_SHARING".equalsIgnoreCase(targetType)) {
            return rt.contains("3") || (cap != null && cap == 3);
        } else if ("4_SHARING".equalsIgnoreCase(targetType)) {
            return rt.contains("4") || (cap != null && cap == 4);
        }
        return false;
    }

    /**
     * Synchronize room inventory breakdown for a hostel.
     * Adjusts the number of rooms of each sharing type (Individual, 2/3/4 sharing)
     * and sets AC amenities to match the target inventory, then keeps hostel capacity
     * and room-type configs completely in sync.
     */
    @Transactional
    public List<Room> syncHostelRoomInventory(Long hostelId, RoomInventoryDTO inventory) {
        Hostel hostel = hostelRepository.findById(hostelId)
                .orElseThrow(() -> new RuntimeException("Hostel not found: " + hostelId));

        List<Room> existing = roomRepository.findByHostelId(hostelId);

        // Find highest room number to generate clean consecutive room numbers
        int maxNum = 100;
        for (Room r : existing) {
            try {
                String digits = r.getRoomNumber().replaceAll("\\D", "");
                if (!digits.isEmpty()) {
                    int n = Integer.parseInt(digits);
                    if (n > maxNum) maxNum = n;
                }
            } catch (Exception ignored) {}
        }
        int[] nextNumHolder = new int[]{ maxNum + 1 };

        // Adjust each sharing type
        syncType(hostelId, "INDIVIDUAL", 1, inventory.getIndividualRooms(), existing, nextNumHolder);
        syncType(hostelId, "2-SHARING", 2, inventory.getTwoSharingRooms(), existing, nextNumHolder);
        syncType(hostelId, "3-SHARING", 3, inventory.getThreeSharingRooms(), existing, nextNumHolder);
        syncType(hostelId, "4-SHARING", 4, inventory.getFourSharingRooms(), existing, nextNumHolder);

        // Re-query updated rooms for AC configuration
        List<Room> allUpdated = roomRepository.findByHostelId(hostelId);
        int targetAc = inventory.getAcRooms() != null ? inventory.getAcRooms() : 0;
        int currentAc = 0;

        for (Room r : allUpdated) {
            String amen = r.getAmenities() != null ? r.getAmenities() : "";
            boolean hasAc = amen.toUpperCase().contains("AC");
            if (currentAc < targetAc) {
                if (!hasAc) {
                    r.setAmenities("AC, " + (amen.isBlank() ? "Attached Bathroom, Beds, Study Table, Wardrobe" : amen));
                    roomRepository.save(r);
                }
                currentAc++;
            } else {
                if (hasAc) {
                    String cleaned = amen.replaceAll("(?i)\\bAC\\b,?\\s*", "").trim();
                    if (cleaned.startsWith(",")) cleaned = cleaned.substring(1).trim();
                    if (cleaned.isBlank()) cleaned = "Attached Bathroom, Beds, Study Table, Wardrobe";
                    r.setAmenities(cleaned);
                    roomRepository.save(r);
                }
            }
        }

        // Update Hostel total rooms and total capacity
        int totalRooms = inventory.calculateTotalRooms();
        int totalCapacity = inventory.calculateTotalCapacity();
        hostel.setTotalRooms(totalRooms);
        hostel.setTotalCapacity(totalCapacity);

        int totalOccupied = allUpdated.stream()
                .mapToInt(r -> r.getOccupiedCount() != null ? r.getOccupiedCount() : 0)
                .sum();
        hostel.setAvailableCapacity(Math.max(0, totalCapacity - totalOccupied));
        hostelRepository.save(hostel);

        // Sync system-wide room-type configs so student preferences reflect new availability
        if (roomTypeConfigService != null) {
            try {
                roomTypeConfigService.syncWithInventory();
            } catch (Exception ignored) {}
        }

        return roomRepository.findByHostelId(hostelId);
    }

    private void syncType(Long hostelId, String roomType, int capacity, int targetCount, List<Room> existing, int[] nextNumHolder) {
        String normalizedTarget = roomType.replace("-", "_");
        List<Room> matching = new ArrayList<>();
        for (Room r : existing) {
            if (matchesType(r, normalizedTarget)) {
                matching.add(r);
            }
        }

        int currentCount = matching.size();
        if (currentCount < targetCount) {
            // Need to create new rooms
            int toCreate = targetCount - currentCount;
            for (int i = 0; i < toCreate; i++) {
                int rNum = nextNumHolder[0]++;
                int floor = (rNum >= 100) ? (rNum / 100) : 1;
                Room newRoom = new Room(hostelId, String.valueOf(rNum), floor, "A", roomType, capacity);
                newRoom.setOccupiedCount(0);
                newRoom.setStatus("AVAILABLE");
                newRoom.setAmenities("Attached Bathroom, Beds, Study Table, Wardrobe");
                roomRepository.save(newRoom);
            }
        } else if (currentCount > targetCount) {
            // Need to remove unoccupied rooms
            int toRemove = currentCount - targetCount;
            int removed = 0;
            for (Room r : matching) {
                if (removed >= toRemove) break;
                if (r.getOccupiedCount() == null || r.getOccupiedCount() == 0) {
                    roomRepository.delete(r);
                    removed++;
                }
            }
        }
    }
}
