package com.crowdinfra.user.service;

import com.crowdinfra.user.dto.AuthResponse;
import com.crowdinfra.user.dto.LoginRequest;
import com.crowdinfra.user.dto.SignupRequest;
import com.crowdinfra.user.model.User;
import com.crowdinfra.user.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final StringRedisTemplate redisTemplate;

    public AuthService(UserRepository userRepository, JwtService jwtService, OtpService otpService, StringRedisTemplate redisTemplate) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.redisTemplate = redisTemplate;
    }

    public User signup(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }
        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new RuntimeException("Phone already in use");
        }

        String hash = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt());

        com.crowdinfra.user.model.Role assignedRole = request.getRole() != null ? request.getRole() : com.crowdinfra.user.model.Role.CITIZEN;

        User user = User.builder()
                .email(request.getEmail())
                .phone(request.getPhone())
                .name(request.getName())
                .passwordHash(hash)
                .role(assignedRole)
                .isEmailVerified(false)
                .createdAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);
        otpService.generate(user.getPhone());
        return user;
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!BCrypt.checkpw(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String roleName = user.getRole() != null ? user.getRole().name() : "CITIZEN";
        String accessToken = jwtService.generateAccessToken(user.getId(), roleName);
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        String refreshHash = BCrypt.hashpw(refreshToken, BCrypt.gensalt());
        user.setRefreshTokenHash(refreshHash);
        userRepository.save(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse refresh(String refreshToken) {
        String userId = jwtService.extractUserId(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!BCrypt.checkpw(refreshToken, user.getRefreshTokenHash())) {
            throw new RuntimeException("Invalid refresh token");
        }

        String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getRole().name());
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse oauthGoogle(String googleToken) {
        // Stub implementation
        // Usually, we would verify the googleToken using GoogleIdTokenVerifier
        String dummyEmail = "googleuser@example.com";
        String dummyName = "Google User";
        String socialId = "stub-social-id";

        Optional<User> optionalUser = userRepository.findBySocialIdAndSocialProvider(socialId, "google");
        User user;
        if (optionalUser.isPresent()) {
            user = optionalUser.get();
        } else {
            user = User.builder()
                    .email(dummyEmail)
                    .name(dummyName)
                    .socialProvider("google")
                    .socialId(socialId)
                    .isEmailVerified(true)
                    .build();
            user = userRepository.save(user);
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getRole() != null ? user.getRole().name() : "CITIZEN");
        String refreshToken = jwtService.generateRefreshToken(user.getId());

        user.setRefreshTokenHash(BCrypt.hashpw(refreshToken, BCrypt.gensalt()));
        userRepository.save(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .role(user.getRole() != null ? user.getRole().name() : "CITIZEN")
                .build();
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String resetToken = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set("pwd_reset:" + resetToken, user.getId(), Duration.ofMinutes(15));
        
        System.out.println("Password reset link: http://localhost:3000/reset-password?token=" + resetToken); // Placeholder
    }

    public void resetPassword(String token, String newPassword) {
        String userId = redisTemplate.opsForValue().get("pwd_reset:" + token);
        if (userId == null) {
            throw new RuntimeException("Invalid or expired reset token");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPasswordHash(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        userRepository.save(user);
        redisTemplate.delete("pwd_reset:" + token);
    }
}
