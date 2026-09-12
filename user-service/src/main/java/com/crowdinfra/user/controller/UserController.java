package com.crowdinfra.user.controller;

import com.crowdinfra.user.dto.UserProfileResponse;
import com.crowdinfra.user.mapper.UserMapper;
import com.crowdinfra.user.model.User;
import com.crowdinfra.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/users")
@Tag(name = "User Profile", description = "Endpoints for managing user profiles")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(@RequestHeader("X-User-Id") String userId) {
        log.info("Fetching profile for user: {}", userId);
        return userRepository.findById(userId)
                .map(user -> ResponseEntity.ok(UserMapper.toProfileResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable String id) {
        log.info("Fetching profile by ID: {}", id);
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(UserMapper.toProfileResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(@RequestHeader("X-User-Id") String userId, @RequestBody User request) {
        log.info("Updating profile for user: {}", userId);
        return userRepository.findById(userId).map(user -> {
            if (request.getName() != null) user.setName(request.getName());
            if (request.getAge() != null) user.setAge(request.getAge());
            if (request.getBio() != null) user.setBio(request.getBio());
            if (request.getLocation() != null) user.setLocation(request.getLocation());
            return ResponseEntity.ok(UserMapper.toProfileResponse(userRepository.save(user)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<UserProfileResponse> uploadAvatar(@RequestHeader("X-User-Id") String userId, @RequestParam("file") MultipartFile file) {
        log.info("Uploading avatar for user: {}", userId);
        // Stub for MinIO/Cloudinary upload
        String dummyUrl = "http://localhost:9000/avatars/" + file.getOriginalFilename();
        
        return userRepository.findById(userId).map(user -> {
            user.setProfileImageUrl(dummyUrl);
            return ResponseEntity.ok(UserMapper.toProfileResponse(userRepository.save(user)));
        }).orElse(ResponseEntity.notFound().build());
    }
}
