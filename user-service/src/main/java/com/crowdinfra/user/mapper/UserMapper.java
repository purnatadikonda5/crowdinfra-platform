package com.crowdinfra.user.mapper;

import com.crowdinfra.user.dto.UserProfileResponse;
import com.crowdinfra.user.model.User;

public class UserMapper {

    public static UserProfileResponse toProfileResponse(User user) {
        if (user == null) {
            return null;
        }
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .name(user.getName())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .location(user.getLocation())
                .profileImageUrl(user.getProfileImageUrl())
                .isEmailVerified(user.isEmailVerified())
                .isActive(user.isActive())
                .age(user.getAge())
                .bio(user.getBio())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
