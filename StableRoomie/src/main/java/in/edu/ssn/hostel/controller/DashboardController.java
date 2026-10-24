package in.edu.ssn.hostel.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @GetMapping("/admin/dashboard")
    public String adminDashboard(@AuthenticationPrincipal OAuth2User principal) {
        return "admin";
    }

    @GetMapping("/student/dashboard")
    public String studentDashboard(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) {
            return "redirect:/login";
        }
        
        // Every successfully authenticated Google user can use the student flow.
        // The admin email, when configured, is still routed to the admin page.
        return "student";
    }
} 
