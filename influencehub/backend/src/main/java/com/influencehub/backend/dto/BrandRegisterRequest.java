package com.influencehub.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class BrandRegisterRequest {
    // Account
    public String name;
    public String email;
    public String password;

    // Company
    public String companyName;
    public String industry;
    public String budget;
    public String website;
    public String description;

    // Preferences
    public List<String> contentTypes;
    public String influencerSize;
    public List<String> platforms;
}
