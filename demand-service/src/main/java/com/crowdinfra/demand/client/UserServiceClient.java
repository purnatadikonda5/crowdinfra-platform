package com.crowdinfra.demand.client;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;

@HttpExchange("/api/users")
public interface UserServiceClient {

    @GetExchange("/{id}")
    UserDto getUserById(@PathVariable("id") String id);

    // Simple record to hold the user data fetched from user-service
    record UserDto(String id, String username, String email, String role) {}
}
