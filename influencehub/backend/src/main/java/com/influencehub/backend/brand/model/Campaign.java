package com.influencehub.backend.brand.model;

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

    private String title;
    private String productName;
    private String industry;

    @Column(length = 2000)
    private String description;

    // Requirements
    private String contentTypes;   // comma-separated
    private String platforms;      // comma-separated
    private String minFollowers;
    private String minEngagement;
    private String location;

    // Deliverables
    private Integer creatorCount;
    private String deliverables;
    private String usageRights;

    // Compensation
    private String budgetMin;
    private String budgetMax;
    private String incentives;
    private LocalDate startDate;
    private LocalDate draftDeadline;
    private LocalDate goLiveDate;

    // Settings
    private Integer maxCreators;
    private String autoClose;
    private String visibility;   // Public | Private

    // Status: draft | active | paused | closed
    private String status;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_profile_id")
    private BrandProfile brandProfile;
}
