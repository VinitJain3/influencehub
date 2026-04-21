package com.influencehub.backend.brand.service;

import com.influencehub.backend.brand.dto.BrandDashboardResponse;
import com.influencehub.backend.brand.model.BrandProfile;
import com.influencehub.backend.influencer.model.InfluencerProfile;
import com.influencehub.backend.influencer.repository.InfluencerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Concrete Strategy: Recommends creators with the highest follower counts.
 * A brand-niche-aware variant could be plugged in by implementing a different strategy.
 */
@Component
public class BasicRecommendationStrategy implements RecommendationStrategy {

    @Autowired
    private InfluencerProfileRepository influencerRepo;

    @Override
    public List<BrandDashboardResponse.CreatorSummary> recommend(BrandProfile brandProfile, int limit) {
        List<InfluencerProfile> top = influencerRepo.findTop4ByOrderByFollowerCountDesc();
        return top.stream().limit(limit).map(p -> {
            BrandDashboardResponse.CreatorSummary cs = new BrandDashboardResponse.CreatorSummary();
            cs.setId(p.getId());
            cs.setName(p.getUser() != null ? p.getUser().getName() : "Creator");
            cs.setHandle(p.getHandle() != null ? p.getHandle() : "");
            cs.setNiche(p.getNiche());
            return cs;
        }).collect(Collectors.toList());
    }
}
