package com.influencehub.backend.model;

import com.influencehub.backend.brand.model.Campaign;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class CollaborationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "campaign_id")
    private Campaign campaign; // optional – brand may not link a specific campaign

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @ManyToOne
    @JoinColumn(name = "brand_id")
    private User brand;

    @Column(columnDefinition = "TEXT")
    private String message; // legacy field

    @Column(columnDefinition = "TEXT")
    private String description; // optional brand description when no campaign is selected

    private String status; // PENDING, ACCEPTED, REJECTED, COMPLETED

    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }
}
