package com.crowdinfra.user.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserProfileResponse {
    private String id;
    private String email;
    private String phone;
    private String name;
    private String role;
    private String location;
    private String profileImageUrl;
    private boolean isEmailVerified;
    private boolean isActive;
    private Integer age;
    private String bio;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
