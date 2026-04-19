package com.influencehub.backend.application.model;

import com.influencehub.backend.campaign.model.Campaign;
import com.influencehub.backend.influencer.model.InfluencerProfile;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "campaign_applications")
public class CampaignApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "influencer_profile_id")
    private InfluencerProfile influencerProfile;

    @Column(columnDefinition = "TEXT")
    private String message;

    private Double proposedRate;
    private String status = "pending"; // pending, accepted, rejected

    @Column(columnDefinition = "TEXT")
    private String rejectReason;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
