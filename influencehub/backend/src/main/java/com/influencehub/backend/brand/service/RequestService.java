package com.influencehub.backend.brand.service;

import com.influencehub.backend.brand.dto.RequestResponse;
import com.influencehub.backend.brand.dto.RequestStatusUpdate;

import java.util.Map;

public interface RequestService {
    Map<String, Object> getBrandRequests(String email, String status, Long campaignId, int page);
    RequestResponse updateRequestStatus(Long requestId, RequestStatusUpdate update);

    // Influencer side
    Map<String, Object> getInfluencerRequests(String email, String status, int page);
    RequestResponse submitRequest(String email, Long campaignId, String message, String proposedRate);
}
