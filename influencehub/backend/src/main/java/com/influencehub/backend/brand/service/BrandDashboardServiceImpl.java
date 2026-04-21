package com.influencehub.backend.brand.service;

import com.influencehub.backend.brand.dto.BrandDashboardResponse;
import com.influencehub.backend.brand.model.BrandProfile;
import com.influencehub.backend.brand.model.Campaign;
import com.influencehub.backend.brand.model.CollaborationRequest;
import com.influencehub.backend.brand.repository.BrandProfileRepository;
import com.influencehub.backend.brand.repository.CampaignRepository;
import com.influencehub.backend.brand.repository.CollaborationRequestRepository;
import com.influencehub.backend.model.User;
import com.influencehub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BrandDashboardServiceImpl implements BrandDashboardService {

    @Autowired private UserRepository userRepo;
    @Autowired private BrandProfileRepository brandProfileRepo;
    @Autowired private CampaignRepository campaignRepo;
    @Autowired private CollaborationRequestRepository requestRepo;

    // Strategy Pattern: inject whichever recommendation strategy is active
    @Autowired private RecommendationStrategy recommendationStrategy;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM d, yyyy");

    @Override
    public BrandDashboardResponse getDashboard(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        BrandProfile brand = brandProfileRepo.findByUser(user).orElseThrow(() -> new RuntimeException("Brand profile not found"));

        BrandDashboardResponse response = new BrandDashboardResponse();

        // ── Stats ──────────────────────────────────────────────────────────
        long activeCampaignCount = campaignRepo.countByBrandProfileAndStatus(brand, "active");
        long pendingRequests = requestRepo.countPendingByBrandProfileId(brand.getId());
        long acceptedCollabs = requestRepo.countAcceptedByBrandProfileId(brand.getId());
        long creatorsReached = requestRepo.countDistinctCreatorsByBrandProfileId(brand.getId());

        BrandDashboardResponse.Stats stats = new BrandDashboardResponse.Stats();
        stats.setActiveCampaigns(activeCampaignCount);
        stats.setPendingRequests(pendingRequests);
        stats.setAcceptedCollabs(acceptedCollabs);
        stats.setCreatorsReached(creatorsReached);
        response.setStats(stats);

        // ── Recommended Creators (Strategy Pattern) ────────────────────────
        response.setRecommendedCreators(recommendationStrategy.recommend(brand, 4));

        // ── Active Campaigns (latest 2) ────────────────────────────────────
        List<Campaign> actives = campaignRepo.findByBrandProfileAndStatus(brand, "active");
        List<BrandDashboardResponse.CampaignSummary> campaignSummaries = actives.stream()
                .limit(2).map(c -> {
                    BrandDashboardResponse.CampaignSummary cs = new BrandDashboardResponse.CampaignSummary();
                    cs.setId(c.getId());
                    cs.setTitle(c.getTitle());
                    cs.setStatus(c.getStatus());
                    cs.setTags(c.getContentTypes() != null ? Arrays.asList(c.getContentTypes().split(",")) : List.of());
                    // count requests for each campaign
                    long rCount = requestRepo.findByBrandProfileId(brand.getId(), PageRequest.of(0, Integer.MAX_VALUE)).stream()
                            .filter(r -> r.getCampaign().getId().equals(c.getId())).count();
                    cs.setRequestCount(rCount);
                    return cs;
                }).collect(Collectors.toList());
        response.setActiveCampaigns(campaignSummaries);

        // ── Recent Requests (latest 5) ─────────────────────────────────────
        List<CollaborationRequest> recentReqs = requestRepo.findTop5ByBrandProfileIdOrderByCreatedAtDesc(
                brand.getId(), PageRequest.of(0, 5));
        List<BrandDashboardResponse.RequestSummary> reqSummaries = recentReqs.stream().map(r -> {
            BrandDashboardResponse.RequestSummary rs = new BrandDashboardResponse.RequestSummary();
            rs.setId(r.getId());
            rs.setCreatorId(r.getInfluencerProfile().getId());
            rs.setCreatorName(r.getInfluencerProfile().getUser() != null
                    ? r.getInfluencerProfile().getUser().getName() : "Creator");
            rs.setCampaignTitle(r.getCampaign().getTitle());
            rs.setDate(r.getCreatedAt() != null ? r.getCreatedAt().format(DATE_FMT) : "");
            rs.setStatus(r.getStatus());
            return rs;
        }).collect(Collectors.toList());
        response.setRecentRequests(reqSummaries);

        // ── Trending Niches (distinct active campaign industries) ──────────
        List<String> industries = campaignRepo.findDistinctActiveIndustries();
        List<Map<String, Object>> niches = new ArrayList<>();
        for (int i = 0; i < industries.size(); i++) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("label", industries.get(i));
            m.put("value", 100 - (i * 15));  // simple descending weight
            niches.add(m);
        }
        response.setTrendingNiches(niches);

        return response;
    }
}
