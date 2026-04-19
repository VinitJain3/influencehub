package com.influencehub.backend.application.service;

import com.influencehub.backend.application.model.CampaignApplication;
import com.influencehub.backend.application.repository.CampaignApplicationRepository;
import com.influencehub.backend.brand.model.BrandProfile;
import com.influencehub.backend.brand.repository.BrandProfileRepository;
import com.influencehub.backend.campaign.model.Campaign;
import com.influencehub.backend.campaign.repository.CampaignRepository;
import com.influencehub.backend.influencer.model.InfluencerProfile;
import com.influencehub.backend.influencer.repository.InfluencerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CampaignApplicationServiceImpl implements CampaignApplicationService {

    @Autowired
    private CampaignApplicationRepository applicationRepository;

    @Autowired
    private BrandProfileRepository brandProfileRepository;

    @Autowired
    private InfluencerProfileRepository influencerProfileRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Override
    public Map<String, Object> getBrandRequests(Long userId, Long campaignId, String status, int page) {
        BrandProfile brand = brandProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Brand profile not found"));

        Pageable pageable = PageRequest.of(page - 1, 10, Sort.by("createdAt").descending());
        Page<CampaignApplication> appPage;

        if (campaignId != null) {
            appPage = applicationRepository.findByCampaignId(campaignId, pageable);
            // Ignore status for now if campaignId present to simplify frontend
        } else if (status == null || status.isEmpty() || status.equalsIgnoreCase("all")) {
            appPage = applicationRepository.findByCampaignBrandProfileId(brand.getId(), pageable);
        } else {
            appPage = applicationRepository.findByCampaignBrandProfileIdAndStatus(brand.getId(), status, pageable);
        }

        List<Map<String, Object>> requests = appPage.getContent().stream().map(app -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", app.getId());
            map.put("creatorId", app.getInfluencerProfile().getId());
            map.put("creatorName", app.getInfluencerProfile().getUser().getName());
            map.put("creatorNiche", app.getInfluencerProfile().getNiche());
            map.put("campaignTitle", app.getCampaign().getTitle());
            map.put("message", app.getMessage());
            map.put("proposedRate", app.getProposedRate());
            map.put("date", app.getCreatedAt().toLocalDate().toString());
            map.put("status", app.getStatus());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("requests", requests);
        response.put("total", appPage.getTotalElements());
        return response;
    }

    @Override
    public Map<String, Object> getInfluencerRequests(Long userId, String status, int page) {
        InfluencerProfile profile = influencerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Influencer profile not found"));

        Pageable pageable = PageRequest.of(page - 1, 10, Sort.by("createdAt").descending());
        Page<CampaignApplication> appPage;

        if (status == null || status.isEmpty() || status.equalsIgnoreCase("all")) {
            appPage = applicationRepository.findByInfluencerProfileId(profile.getId(), pageable);
        } else {
            appPage = applicationRepository.findByInfluencerProfileIdAndStatus(profile.getId(), status, pageable);
        }

        // Just returning a minimal set mimicking frontend requirements
        List<Map<String, Object>> requests = appPage.getContent().stream().map(app -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", app.getId());
            map.put("campaignId", app.getCampaign().getId());
            map.put("campaignTitle", app.getCampaign().getTitle());
            map.put("brandName", app.getCampaign().getBrandProfile().getBrandName());
            map.put("status", app.getStatus());
            map.put("date", app.getCreatedAt().toLocalDate().toString());
            map.put("proposedRate", app.getProposedRate());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("requests", requests);
        response.put("total", appPage.getTotalElements());
        return response;
    }

    @Override
    public void applyToCampaign(Long userId, Long campaignId, Map<String, Object> payload) {
        InfluencerProfile profile = influencerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Influencer profile not found"));

        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        if(applicationRepository.existsByCampaignIdAndInfluencerProfileId(campaignId, profile.getId())){
            throw new RuntimeException("Already applied to this campaign");
        }

        CampaignApplication app = new CampaignApplication();
        app.setCampaign(campaign);
        app.setInfluencerProfile(profile);
        app.setMessage((String) payload.get("message"));
        if(payload.containsKey("proposedRate") && payload.get("proposedRate") != null) {
            app.setProposedRate(Double.parseDouble(payload.get("proposedRate").toString()));
        }

        applicationRepository.save(app);
    }

    @Override
    public void updateRequestStatus(Long requestId, String status, String rejectReason) {
        CampaignApplication app = applicationRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        app.setStatus(status);
        if("rejected".equalsIgnoreCase(status)) {
            app.setRejectReason(rejectReason);
        }
        applicationRepository.save(app);
    }
}
