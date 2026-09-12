package com.crowdinfra.user.dto;

import com.crowdinfra.user.model.Role;
import lombok.Data;

@Data
public class SignupRequest {
    private String email;
    private String phone;
    private String name;
    private String password;
    private Role role;
}
