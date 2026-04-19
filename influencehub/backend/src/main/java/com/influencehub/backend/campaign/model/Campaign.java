package com.influencehub.backend.campaign.model;

import com.influencehub.backend.brand.model.BrandProfile;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "campaigns")
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "brand_profile_id")
    private BrandProfile brandProfile;

    private String title;
    private String productName;
    private String industry;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String contentTypes; // comma-separated

    @Column(columnDefinition = "TEXT")
    private String platforms; // comma-separated

    private String minFollowers;
    private String minEngagement;
    private String location;
    private Integer creatorCount;

    @Column(columnDefinition = "TEXT")
    private String deliverables;

    private String usageRights;
    private Double budgetMin;
    private Double budgetMax;

    @Column(columnDefinition = "TEXT")
    private String incentives;

    private LocalDate startDate;
    private LocalDate draftDeadline;
    private LocalDate goLiveDate;
    private Integer maxCreators;
    private String autoClose;
    private String visibility = "Public";
    private String status = "active"; // active, paused, closed, draft

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
