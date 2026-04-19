package com.influencehub.backend.influencer.service;

import java.util.Map;

public interface InfluencerProfileService {
    Map<String, Object> getCreators(Map<String, Object> filters, String sort, int page);
}
