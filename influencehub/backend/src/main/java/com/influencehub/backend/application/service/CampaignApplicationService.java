package com.influencehub.backend.application.service;

import java.util.Map;

public interface CampaignApplicationService {
    Map<String, Object> getBrandRequests(Long userId, Long campaignId, String status, int page);
    Map<String, Object> getInfluencerRequests(Long userId, String status, int page);
    void applyToCampaign(Long userId, Long campaignId, Map<String, Object> payload);
    void updateRequestStatus(Long requestId, String status, String rejectReason);
}
