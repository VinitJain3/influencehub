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
    private String followerCount;
    private String niche;
    private String location;

    @Column(length = 500)
    private String bio;

    private String primaryPlatform;
    private String otherPlatforms; // stored as comma-separated

    private String baseRate;
    private String portfolioUrl;
    private String engagementRate;
    private String postsPerMonth;
    private String avgReach;

    @Column(columnDefinition = "LONGTEXT")
    private String coverPhoto;

    @Column(columnDefinition = "LONGTEXT")
    private String portfolioImages; // JSON array of base64 data URLs

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
