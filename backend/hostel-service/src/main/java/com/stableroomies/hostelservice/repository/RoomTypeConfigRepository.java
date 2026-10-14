package com.stableroomies.hostelservice.repository;

import com.stableroomies.hostelservice.model.RoomTypeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomTypeConfigRepository extends JpaRepository<RoomTypeConfig, Long> {

    Optional<RoomTypeConfig> findByRoomTypeAndAcType(String roomType, String acType);

    List<RoomTypeConfig> findAllByAvailableTrue();
}
