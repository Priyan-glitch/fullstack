package com.stableroomies.hostelservice.service;

import com.stableroomies.hostelservice.model.Room;
import com.stableroomies.hostelservice.model.RoomTypeConfig;
import com.stableroomies.hostelservice.repository.RoomRepository;
import com.stableroomies.hostelservice.repository.RoomTypeConfigRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomTypeConfigService {

    @Autowired
    private RoomTypeConfigRepository repository;

    @Autowired
    private RoomRepository roomRepository;

    // All valid combinations
    private static final String[] ROOM_TYPES = { "INDIVIDUAL", "2_SHARING", "3_SHARING", "4_SHARING" };
    private static final String[] AC_TYPES   = { "AC", "NON_AC" };

    /**
     * Seed the table and sync initial counts from room inventory.
     */
    @PostConstruct
    public void seedIfEmpty() {
        for (String roomType : ROOM_TYPES) {
            for (String acType : AC_TYPES) {
                repository.findByRoomTypeAndAcType(roomType, acType)
                        .orElseGet(() -> repository.save(new RoomTypeConfig(roomType, acType)));
            }
        }
        syncWithInventory();
    }

    private boolean matchesRoomType(Room room, String configRoomType) {
        if (configRoomType == null || room == null) return false;
        String rt = room.getRoomType() != null ? room.getRoomType().toUpperCase().replace("-", "_") : "";
        Integer cap = room.getCapacity();
        if ("INDIVIDUAL".equals(configRoomType)) {
            return rt.contains("1") || rt.contains("INDIVIDUAL") || rt.contains("SINGLE") || (cap != null && cap == 1);
        } else if ("2_SHARING".equals(configRoomType)) {
            return rt.contains("2") || (cap != null && cap == 2);
        } else if ("3_SHARING".equals(configRoomType)) {
            return rt.contains("3") || (cap != null && cap == 3);
        } else if ("4_SHARING".equals(configRoomType)) {
            return rt.contains("4") || (cap != null && cap == 4);
        }
        return false;
    }

    private static final java.util.regex.Pattern AC_PATTERN =
            java.util.regex.Pattern.compile("\\b(AC|A/C|AIR[\\s-]CONDITION(ING|ER)?)\\b", java.util.regex.Pattern.CASE_INSENSITIVE);

    private boolean matchesAcType(Room room, String configAcType) {
        if (room == null) return false;
        String amenities = room.getAmenities() != null ? room.getAmenities() : "";
        boolean hasAc = AC_PATTERN.matcher(amenities).find();
        return "AC".equalsIgnoreCase(configAcType) ? hasAc : !hasAc;
    }

    /**
     * Automatically syncs total and available rooms with the live Room repository.
     * If rooms exist and have open beds, it enables them; if 0 available rooms, disables them.
     */
    public List<RoomTypeConfig> syncWithInventory() {
        List<Room> allRooms = roomRepository.findAll();

        for (String roomType : ROOM_TYPES) {
            for (String acType : AC_TYPES) {
                int total = 0;
                int available = 0;

                for (Room room : allRooms) {
                    if (matchesRoomType(room, roomType) && matchesAcType(room, acType)) {
                        total++;
                        boolean isAvail = "AVAILABLE".equalsIgnoreCase(room.getStatus()) &&
                                (room.getCapacity() == null || room.getOccupiedCount() == null || room.getOccupiedCount() < room.getCapacity());
                        if (isAvail) {
                            available++;
                        }
                    }
                }

                RoomTypeConfig config = repository.findByRoomTypeAndAcType(roomType, acType)
                        .orElseGet(() -> new RoomTypeConfig(roomType, acType));

                config.setTotalRooms(total);
                config.setAvailableRooms(available);

                // Auto-enable if rooms exist and beds are available
                if (total > 0) {
                    config.setAvailable(available > 0);
                }

                repository.save(config);
            }
        }
        return repository.findAll();
    }

    /** Returns ALL configs (admin view). */
    public List<RoomTypeConfig> getAll() {
        return repository.findAll();
    }

    /** Returns only the available (enabled + vacant) configs (student view). */
    public List<RoomTypeConfig> getAvailable() {
        return repository.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getAvailable()) && (c.getTotalRooms() == 0 || c.getAvailableRooms() > 0))
                .toList();
    }

    /** Bulk-update from the admin UI payload. */
    public List<RoomTypeConfig> updateAll(List<RoomTypeConfig> updates) {
        for (RoomTypeConfig update : updates) {
            repository.findById(update.getId()).ifPresent(existing -> {
                existing.setAvailable(update.getAvailable());
                existing.setTotalRooms(update.getTotalRooms());
                existing.setAvailableRooms(update.getAvailableRooms());
                repository.save(existing);
            });
        }
        return repository.findAll();
    }

    /** Toggle a single entry. */
    public RoomTypeConfig toggleAvailability(Long id) {
        RoomTypeConfig config = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("RoomTypeConfig not found: " + id));
        config.setAvailable(!config.getAvailable());
        return repository.save(config);
    }

    /** Patch a single entry's counts and availability flag. */
    public RoomTypeConfig update(Long id, RoomTypeConfig patch) {
        RoomTypeConfig existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("RoomTypeConfig not found: " + id));
        if (patch.getAvailable() != null)      existing.setAvailable(patch.getAvailable());
        if (patch.getTotalRooms() != null)     existing.setTotalRooms(patch.getTotalRooms());
        if (patch.getAvailableRooms() != null) existing.setAvailableRooms(patch.getAvailableRooms());
        return repository.save(existing);
    }
}
