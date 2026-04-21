package com.influencehub.backend.brand.service;

import com.influencehub.backend.brand.dto.CampaignRequest;
import com.influencehub.backend.brand.dto.CampaignResponse;

import java.util.Map;

public interface CampaignService {
    Map<String, Object> getBrandCampaigns(String email, String status, int page);
    CampaignResponse getCampaignById(Long id, String currentUserEmail);
    CampaignResponse createCampaign(String email, CampaignRequest request);
    CampaignResponse updateCampaign(Long id, String email, CampaignRequest request);
    void updateStatus(Long id, String email, String status);
    void deleteCampaign(Long id, String email);
    CampaignResponse duplicateCampaign(Long id, String email);
    Map<String, Object> browseCampaigns(int page);
}
