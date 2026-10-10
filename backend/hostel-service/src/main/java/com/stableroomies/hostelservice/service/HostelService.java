package com.stableroomies.hostelservice.service;

import com.stableroomies.hostelservice.model.Hostel;
import com.stableroomies.hostelservice.repository.HostelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class HostelService {

    @Autowired
    private HostelRepository hostelRepository;

    public List<Hostel> getAllHostels() {
        return hostelRepository.findAll();
    }

    public Optional<Hostel> getHostelById(Long id) {
        return hostelRepository.findById(id);
    }

    public Hostel createHostel(Hostel hostel) {
        return hostelRepository.save(hostel);
    }

    public Hostel updateHostel(Long id, Hostel hostel) {
        hostel.setId(id);
        return hostelRepository.save(hostel);
    }

    public void deleteHostel(Long id) {
        hostelRepository.deleteById(id);
    }
}
