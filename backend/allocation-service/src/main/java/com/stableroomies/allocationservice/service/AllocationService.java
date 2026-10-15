package com.stableroomies.allocationservice.service;

import com.stableroomies.allocationservice.dto.AllocationResponseDTO;
import com.stableroomies.allocationservice.dto.AllocationTriggerRequest;
import com.stableroomies.allocationservice.dto.AllocationTriggerResponse;
import com.stableroomies.allocationservice.model.Roommate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AllocationService {

    private static final Logger log = LoggerFactory.getLogger(AllocationService.class);

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.allocation.exchange:allocation.exchange}")
    private String exchange;

    @Value("${rabbitmq.allocation.routing-key:allocation.trigger}")
    private String routingKey;

    /**
     * Trigger asynchronous allocation process via RabbitMQ
     */
    public AllocationTriggerResponse triggerAllocationAsync(AllocationTriggerRequest request) {
        String jobId = UUID.randomUUID().toString();
        String strategy = request.getStrategy() != null ? request.getStrategy() : "graph_clustering";
        // Passed through as-is: a null year means "every year" to the algorithm
        // engine. Coercing null to 4 here restricted allocation to year-4
        // students and made the UI's "All years" option a no-op.
        Integer year = request.getYear();
        String runBy = request.getRunBy() != null ? request.getRunBy() : "admin";
        String notes = request.getNotes();

        Map<String, Object> message = new HashMap<>();
        message.put("jobId", jobId);
        message.put("strategy", strategy);
        message.put("year", year);
        message.put("runBy", runBy);
        message.put("notes", notes);
        message.put("timestamp", LocalDateTime.now().toString());

        log.info("Publishing allocation trigger message to RabbitMQ exchange '{}' with routingKey '{}': {}",
                exchange, routingKey, message);

        rabbitTemplate.convertAndSend(exchange, routingKey, message);

        return new AllocationTriggerResponse(
                jobId,
                "QUEUED",
                "Allocation task successfully submitted to RabbitMQ for asynchronous background processing.",
                strategy,
                year,
                runBy
        );
    }

    public String triggerAllocation() {
        AllocationTriggerResponse response = triggerAllocationAsync(new AllocationTriggerRequest());
        return "Allocation triggered asynchronously. Job ID: " + response.getJobId() + ", Status: " + response.getStatus();
    }

    public AllocationResponseDTO getAllocationByStudentId(Long studentId) {
        return AllocationResponseDTO.notStarted(studentId);
    }

    public List<Roommate> getRoommatesByStudentId(Long studentId) {
        return new ArrayList<>();
    }

    public AllocationResponseDTO createSampleAllocatedResponse(Long studentId) {
        AllocationResponseDTO response = new AllocationResponseDTO();
        response.setStudentId(studentId);
        response.setAllocationStatus("allocated");
        response.setMessage("Room has been allocated successfully!");
        response.setAllocatedAt(LocalDateTime.now());
        return response;
    }
}
