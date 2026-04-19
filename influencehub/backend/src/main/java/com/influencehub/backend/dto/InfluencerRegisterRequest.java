package com.influencehub.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class InfluencerRegisterRequest {
    // Account
    public String name;
    public String email;
    public String password;

    // Profile
    public String handle;
    public String primaryPlatform;
    public String followerCount;
    public String niche;
    public String location;
    public String bio;

    // Professional
    public List<String> otherPlatforms;
    public String baseRate;
    public String portfolioUrl;
    public String engagementRate;
}
