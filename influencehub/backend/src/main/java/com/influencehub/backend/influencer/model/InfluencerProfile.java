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

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
