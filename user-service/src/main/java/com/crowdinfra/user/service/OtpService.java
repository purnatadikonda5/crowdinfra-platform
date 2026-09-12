package com.crowdinfra.user.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Random;

@Service
public class OtpService {

    private final StringRedisTemplate redisTemplate;

    public OtpService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String generate(String phone) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        redisTemplate.opsForValue().set("otp:" + phone, otp, Duration.ofMinutes(5));
        System.out.println("Generated OTP for " + phone + ": " + otp); // Placeholder for SMS
        return otp;
    }

    public boolean verify(String phone, String otp) {
        String key = "otp:" + phone;
        String storedOtp = redisTemplate.opsForValue().get(key);
        if (storedOtp != null && storedOtp.equals(otp)) {
            redisTemplate.delete(key);
            return true;
        }
        return false;
    }
}
