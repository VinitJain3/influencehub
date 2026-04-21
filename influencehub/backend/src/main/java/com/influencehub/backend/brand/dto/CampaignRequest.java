package com.influencehub.backend.brand.dto;

import lombok.Data;
import java.util.List;

@Data
public class CampaignRequest {
    // Basics
    public String title;
    public String productName;
    public String industry;
    public String description;

    // Requirements
    public List<String> contentTypes;
    public List<String> platforms;
    public String minFollowers;
    public String minEngagement;
    public String location;

    // Deliverables
    public Integer creatorCount;
    public String deliverables;
    public String usageRights;

    // Compensation
    public String budgetMin;
    public String budgetMax;
    public String incentives;
    public String startDate;
    public String draftDeadline;
    public String goLiveDate;

    // Settings
    public Integer maxCreators;
    public String autoClose;
    public String visibility;

    // Status
    public String status; // draft | active
}
