package com.influencehub.backend.brand.dto;

import lombok.Data;
import java.util.List;

@Data
public class CampaignResponse {
    private Long id;
    private String title;
    private String productName;
    private String industry;
    private String description;

    // Multi-value fields returned as lists
    private List<String> contentTypes;
    private List<String> platforms;
    private String minFollowers;
    private String minEngagement;
    private String location;

    private Integer creatorCount;
    private String deliverables;
    private String usageRights;

    private String budgetMin;
    private String budgetMax;
    private String budget;       // formatted "₹X – ₹Y" for list views
    private String incentives;
    private String startDate;
    private String draftDeadline;
    private String goLiveDate;
    private String deadline;     // alias for goLiveDate used in browse view

    private Integer maxCreators;
    private String autoClose;
    private String visibility;

    private String status;
    private String postedDate;
    private long requestCount;
    private long acceptedCount;

    // Campaign detail extras (brand info for influencer browse)
    private String brandName;
    private String brandLocation;
    private String brandCampaignCount;
    private Boolean verified;

    // Whether the current influencer has already applied (for campaign detail page)
    private boolean hasApplied;

    // Tags (contentTypes displayed in list view)
    private List<String> tags;
    private String category;     // mapped from industry
}
