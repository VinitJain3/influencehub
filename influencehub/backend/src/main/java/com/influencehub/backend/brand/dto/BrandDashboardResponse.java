package com.influencehub.backend.brand.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class BrandDashboardResponse {
    private Stats stats;
    private List<CreatorSummary> recommendedCreators;
    private List<CampaignSummary> activeCampaigns;
    private List<RequestSummary> recentRequests;
    private List<Map<String, Object>> trendingNiches;

    @Data
    public static class Stats {
        private long activeCampaigns;
        private long creatorsReached;
        private long pendingRequests;
        private long acceptedCollabs;
    }

    @Data
    public static class CreatorSummary {
        private Long id;
        private String name;
        private String handle;
        private String niche;
    }

    @Data
    public static class CampaignSummary {
        private Long id;
        private String title;
        private String status;
        private List<String> tags;
        private long requestCount;
    }

    @Data
    public static class RequestSummary {
        private Long id;
        private String creatorName;
        private Long creatorId;
        private String campaignTitle;
        private String date;
        private String status;
    }
}
