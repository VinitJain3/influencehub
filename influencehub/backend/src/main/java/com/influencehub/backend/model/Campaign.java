package com.influencehub.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "brand_id")
    private User brand;

    private String title;
    private String productName;
    private String industry;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String contentTypes; // Comma-separated
    private String platforms;    // Comma-separated
    
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
    private String visibility;
    
    private String status; // active, paused, closed, draft
    
    private LocalDateTime postedDate;

    @PrePersist
    protected void onCreate() {
        postedDate = LocalDateTime.now();
        if (status == null) status = "active";
    }
}
