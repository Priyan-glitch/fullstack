package com.stableroomies.hostelservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories("com.stableroomies.hostelservice.repository")
public class HostelServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(HostelServiceApplication.class, args);
    }
}
