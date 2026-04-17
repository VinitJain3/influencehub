package com.influencehub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Map;

@Data
@AllArgsConstructor
public class LoginResponse {
    private Map<String, String> user;
    private String token;
    private String role;

    public static LoginResponse of(String name, String email, String token, String role) {
        return new LoginResponse(
                Map.of("name", name != null ? name : "", "email", email),
                token,
                role
        );
    }
}
