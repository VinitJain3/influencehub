package com.influencehub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.HashMap;
import java.util.Map;

@Data
@AllArgsConstructor
public class LoginResponse {
    private Map<String, String> user;
    private String token;
    private String role;

    public static LoginResponse of(String name, String email, String token, String role) {
        return of(name, email, token, role, null);
    }

    /** Use this overload for brands — passes companyName separately so frontend can display it */
    public static LoginResponse of(String name, String email, String token, String role, String companyName) {
        Map<String, String> userMap = new HashMap<>();
        userMap.put("name", name != null ? name : "");
        userMap.put("email", email);
        if (companyName != null && !companyName.isBlank()) {
            userMap.put("companyName", companyName);
        }
        return new LoginResponse(userMap, token, role);
    }
}
