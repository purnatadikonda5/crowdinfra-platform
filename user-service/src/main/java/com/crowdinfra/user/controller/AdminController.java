package com.crowdinfra.user.controller;

import com.crowdinfra.user.model.Role;
import com.crowdinfra.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Operations", description = "Endpoints for admin operations like suspending users")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PatchMapping("/users/{id}/suspend")
    public ResponseEntity<?> suspendUser(@RequestHeader("X-User-Role") String userRole, @PathVariable String id) {
        log.info("Received suspend user request for user ID: {} by admin", id);
        
        if (!"ADMIN".equalsIgnoreCase(userRole)) {
            log.warn("Unauthorized attempt to suspend user {} by role {}", id, userRole);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Admin access required");
        }

        return userRepository.findById(id).map(user -> {
            user.setActive(false);
            userRepository.save(user);
            log.info("User {} suspended successfully", id);
            return ResponseEntity.ok("User " + id + " suspended successfully");
        }).orElse(ResponseEntity.notFound().build());
    }
}
