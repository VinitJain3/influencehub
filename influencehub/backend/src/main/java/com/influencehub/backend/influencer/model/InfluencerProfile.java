package com.influencehub.backend.influencer.model;

import com.influencehub.backend.model.User;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "influencer_profiles")
public class InfluencerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String handle;
    private String primaryPlatform;
    private String followerCount;
    private String niche;
    private String location;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String otherPlatforms; // comma-separated

    private String baseRate;
    private String portfolioUrl;
    private String engagementRate;
    private Boolean verified = false;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
