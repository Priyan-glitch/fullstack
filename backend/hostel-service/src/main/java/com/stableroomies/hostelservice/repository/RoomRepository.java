package com.stableroomies.hostelservice.repository;

import com.stableroomies.hostelservice.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHostelId(Long hostelId);
    
    Long countByStatus(String status);
    
    Long countByRoomType(String roomType);
}
