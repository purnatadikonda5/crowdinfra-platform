package com.crowdinfra.user.controller;

import com.crowdinfra.user.dto.AuthResponse;
import com.crowdinfra.user.dto.LoginRequest;
import com.crowdinfra.user.dto.SignupRequest;
import com.crowdinfra.user.model.User;
import com.crowdinfra.user.service.AuthService;
import com.crowdinfra.user.service.OtpService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Endpoints for user authentication and OTP")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    public AuthController(AuthService authService, OtpService otpService) {
        this.authService = authService;
        this.otpService = otpService;
    }

    @PostMapping(value = "/signup", consumes = { org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<User> signup(@ModelAttribute SignupRequest request) {
        log.info("Received signup request for email: {}", request.getEmail());
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        log.info("Received login request for email: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        
        ResponseCookie cookie = ResponseCookie.from("token", response.getAccessToken())
                .httpOnly(true)
                .secure(false) // set false in dev
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(7))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        log.info("Received logout request");
        ResponseCookie cookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String, String> request) {
        log.info("Received token refresh request");
        return ResponseEntity.ok(authService.refresh(request.get("refreshToken")));
    }

    @PostMapping("/oauth/google")
    public ResponseEntity<AuthResponse> oauthGoogle(@RequestBody Map<String, String> request) {
        log.info("Received Google OAuth login request");
        AuthResponse response = authService.oauthGoogle(request.get("token"));
        
        ResponseCookie cookie = ResponseCookie.from("token", response.getAccessToken())
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofDays(7))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        log.info("Sending OTP to phone: {}", phone);
        otpService.generate(phone);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody Map<String, String> request) {
        log.info("Received forgot password request for email: {}", request.get("email"));
        authService.forgotPassword(request.get("email"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody Map<String, String> request) {
        log.info("Received reset password request");
        authService.resetPassword(request.get("token"), request.get("newPassword"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        log.info("Verifying OTP for phone: {}", phone);
        boolean isValid = otpService.verify(phone, request.get("otp"));
        return ResponseEntity.ok(Map.of("verified", isValid));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        log.error("Auth error: ", e);
        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
}
