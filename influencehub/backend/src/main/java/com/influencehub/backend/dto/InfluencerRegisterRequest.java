package com.influencehub.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class InfluencerRegisterRequest {

    // Account Info (Step 1)
    private String name;
    private String email;
    private String password;
    private String confirmPassword;

    // Creator Profile (Step 2)
    private String handle;
    private String followerCount;
    private String niche;
    private String location;
    private String bio;

    // Professional Details (Step 3)
    private String primaryPlatform;
    private List<String> otherPlatforms;
    private String baseRate;
    private String portfolioUrl;
    private String engagementRate;
}
