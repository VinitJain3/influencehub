package com.influencehub.backend.campaign.service;

import com.influencehub.backend.campaign.model.Campaign;
import java.util.Map;

public interface CampaignService {
    Map<String, Object> getBrandCampaigns(Long userId, String status, int page);
    Map<String, Object> getPublicCampaigns(String search, String industry, String sort, int page);
    Campaign getCampaignById(Long id);
    Campaign createCampaign(Long userId, Map<String, Object> payload);
    Campaign updateCampaign(Long id, Map<String, Object> payload);
    void updateStatus(Long id, String status);
    void deleteCampaign(Long id);
    Campaign duplicateCampaign(Long id);
}
