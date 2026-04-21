package com.influencehub.backend.brand.service;

import com.influencehub.backend.brand.model.BrandProfile;
import com.influencehub.backend.brand.dto.BrandDashboardResponse;

import java.util.List;

/**
 * Strategy Pattern: Defines the contract for creator recommendation strategies.
 * Different implementations can use different algorithms (by niche, by followers, ML-based, etc.)
 */
public interface RecommendationStrategy {
    List<BrandDashboardResponse.CreatorSummary> recommend(BrandProfile brandProfile, int limit);
}
