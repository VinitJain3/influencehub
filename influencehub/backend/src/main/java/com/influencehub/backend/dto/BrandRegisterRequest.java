package com.influencehub.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class BrandRegisterRequest {

    // Account Info (Step 1)
    private String name;
    private String email;
    private String password;
    private String confirmPassword;

    // Company Details (Step 2)
    private String companyName;
    private String industry;
    private String budget;
    private String website;
    private String description;

    // Preferences (Step 3)
    private List<String> contentTypes;
    private String influencerSize;
    private List<String> platforms;
}
