package com.influencehub.backend.influencer.service;

import com.influencehub.backend.influencer.dto.InfluencerDashboardResponse;

public interface InfluencerDashboardService {
    InfluencerDashboardResponse getDashboard(String email);
}
