package com.stableroomies.hostelservice.repository;

import com.stableroomies.hostelservice.model.Hostel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HostelRepository extends JpaRepository<Hostel, Long> {
}
