package com.influencehub.backend.influencer.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class InfluencerDashboardResponse {
    private Stats stats;
    private List<CampaignSummary> matchingCampaigns;
    private List<ActivityEvent> recentActivity;
    private List<Map<String, Object>> earningsChart;

    @Data
    public static class Stats {
        private long activeCollabs;
        private long pendingRequests;
        private String totalEarnings;
        private long profileViews;
    }

    @Data
    public static class CampaignSummary {
        private Long id;
        private String title;
        private String brandName;
        private String budget;
        private String deadline;
        private List<String> tags;
    }

    @Data
    public static class ActivityEvent {
        private String type;   // accepted | request | campaign
        private String text;
        private String time;
    }
}
