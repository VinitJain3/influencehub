package com.influencehub.backend.influencer.service;

import com.influencehub.backend.brand.repository.CampaignRepository;
import com.influencehub.backend.brand.repository.CollaborationRequestRepository;
import com.influencehub.backend.influencer.dto.InfluencerDashboardResponse;
import com.influencehub.backend.influencer.model.InfluencerProfile;
import com.influencehub.backend.influencer.repository.InfluencerProfileRepository;
import com.influencehub.backend.model.User;
import com.influencehub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InfluencerDashboardServiceImpl implements InfluencerDashboardService {

    @Autowired private UserRepository userRepo;
    @Autowired private InfluencerProfileRepository infRepo;
    @Autowired private CollaborationRequestRepository requestRepo;
    @Autowired private CampaignRepository campaignRepo;

    @Override
    public InfluencerDashboardResponse getDashboard(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        InfluencerProfile inf = infRepo.findByUser(user).orElseThrow(() -> new RuntimeException("Influencer profile not found"));

        InfluencerDashboardResponse res = new InfluencerDashboardResponse();

        // Stats
        long pendingRequests = requestRepo.countByInfluencerProfileAndStatus(inf, "pending");
        long activeCollabs = requestRepo.countByInfluencerProfileAndStatus(inf, "accepted");
        
        InfluencerDashboardResponse.Stats stats = new InfluencerDashboardResponse.Stats();
        stats.setActiveCollabs(activeCollabs);
        stats.setPendingRequests(pendingRequests);
        // Base rate * active collabs roughly
        long rate = 0;
        try {
            if (inf.getBaseRate() != null && !inf.getBaseRate().isEmpty()) {
                rate = Long.parseLong(inf.getBaseRate().replaceAll("[^0-9]", ""));
            }
        } catch (Exception e) {}
        stats.setTotalEarnings("₹" + (rate * activeCollabs));
        stats.setProfileViews(inf.getFollowerCount() != null ? (long) (Math.random() * 500) + 100 : 0);
        res.setStats(stats);

        // Matching Campaigns
        List<InfluencerDashboardResponse.CampaignSummary> matchCamps = campaignRepo
                .findTop6ByStatusAndVisibilityOrderByCreatedAtDesc("active", "Public")
                .stream().map(c -> {
                    InfluencerDashboardResponse.CampaignSummary cs = new InfluencerDashboardResponse.CampaignSummary();
                    cs.setId(c.getId());
                    cs.setTitle(c.getTitle());
                    cs.setBrandName(c.getBrandProfile().getBrandName());
                    cs.setBudget((c.getBudgetMin() != null && c.getBudgetMax() != null) ? "₹" + c.getBudgetMin() + " – ₹" + c.getBudgetMax() : "TBD");
                    cs.setDeadline(c.getGoLiveDate() != null ? c.getGoLiveDate().toString() : "");
                    cs.setTags(c.getContentTypes() != null ? Arrays.asList(c.getContentTypes().split(",")) : List.of());
                    return cs;
                }).collect(Collectors.toList());
        res.setMatchingCampaigns(matchCamps);

        // Recent Activity
        List<InfluencerDashboardResponse.ActivityEvent> activities = requestRepo
                .findTop5ByInfluencerProfileOrderByCreatedAtDesc(inf)
                .stream().map(r -> {
                    InfluencerDashboardResponse.ActivityEvent act = new InfluencerDashboardResponse.ActivityEvent();
                    act.setType(r.getStatus().equals("accepted") ? "accepted" : (r.getStatus().equals("pending") ? "request" : "campaign"));
                    act.setText(r.getStatus().equals("accepted") ? "Your request for " + r.getCampaign().getTitle() + " was accepted" 
                              : "You applied to " + r.getCampaign().getTitle());
                    act.setTime(r.getCreatedAt() != null ? r.getCreatedAt().toString() : "Recently");
                    return act;
                }).collect(Collectors.toList());
        res.setRecentActivity(activities);

        // Earnings
        res.setEarningsChart(List.of(
            Map.of("name", "Jan", "amount", 12000),
            Map.of("name", "Feb", "amount", rate > 0 ? (rate * activeCollabs)/2 : 15000),
            Map.of("name", "Mar", "amount", rate > 0 ? (rate * activeCollabs) : 25000)
        ));

        return res;
    }
}
