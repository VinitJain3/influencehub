package com.influencehub.backend.brand.service;

import com.influencehub.backend.brand.dto.RequestResponse;
import com.influencehub.backend.brand.dto.RequestStatusUpdate;
import com.influencehub.backend.brand.model.BrandProfile;
import com.influencehub.backend.brand.model.Campaign;
import com.influencehub.backend.brand.model.CollaborationRequest;
import com.influencehub.backend.brand.repository.BrandProfileRepository;
import com.influencehub.backend.brand.repository.CampaignRepository;
import com.influencehub.backend.brand.repository.CollaborationRequestRepository;
import com.influencehub.backend.influencer.model.InfluencerProfile;
import com.influencehub.backend.influencer.repository.InfluencerProfileRepository;
import com.influencehub.backend.model.User;
import com.influencehub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RequestServiceImpl implements RequestService {

    @Autowired private CollaborationRequestRepository requestRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private BrandProfileRepository brandRepo;
    @Autowired private InfluencerProfileRepository infRepo;
    @Autowired private CampaignRepository campaignRepo;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("MMM d, yyyy");

    @Override
    public Map<String, Object> getBrandRequests(String email, String status, Long campaignId, int page) {
        BrandProfile brand = getBrandByEmail(email);
        Page<CollaborationRequest> pagedResult;
        PageRequest pr = PageRequest.of(page - 1, 10);

        if (campaignId != null && status != null && !status.isEmpty() && !status.equals("all")) {
            pagedResult = requestRepo.findByBrandProfileIdAndCampaignIdAndStatus(brand.getId(), campaignId, status, pr);
        } else if (campaignId != null) {
            pagedResult = requestRepo.findByBrandProfileIdAndCampaignId(brand.getId(), campaignId, pr);
        } else if (status != null && !status.isEmpty() && !status.equals("all")) {
            pagedResult = requestRepo.findByBrandProfileIdAndStatus(brand.getId(), status, pr);
        } else {
            pagedResult = requestRepo.findByBrandProfileId(brand.getId(), pr);
        }

        List<RequestResponse> requests = pagedResult.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());
        return Map.of("requests", requests, "total", pagedResult.getTotalElements());
    }

    @Override
    public RequestResponse updateRequestStatus(Long requestId, RequestStatusUpdate update) {
        CollaborationRequest request = requestRepo.findById(requestId).orElseThrow(() -> new RuntimeException("Not found"));
        request.setStatus(update.getStatus());
        if (update.getReason() != null) request.setRejectReason(update.getReason());
        requestRepo.save(request);
        return mapToResponse(request);
    }

    @Override
    public Map<String, Object> getInfluencerRequests(String email, String status, int page) {
        InfluencerProfile inf = getInfByEmail(email);
        Page<CollaborationRequest> pagedResult;
        PageRequest pr = PageRequest.of(page - 1, 10);

        if (status != null && !status.isEmpty() && !status.equals("all")) {
            pagedResult = requestRepo.findByInfluencerProfileAndStatus(inf, status, pr);
        } else {
            pagedResult = requestRepo.findByInfluencerProfile(inf, pr);
        }

        List<RequestResponse> requests = pagedResult.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());
        return Map.of("requests", requests, "total", pagedResult.getTotalElements());
    }

    @Override
    public RequestResponse submitRequest(String email, Long campaignId, String message, String proposedRate) {
        InfluencerProfile inf = getInfByEmail(email);
        Campaign campaign = campaignRepo.findById(campaignId).orElseThrow(() -> new RuntimeException("Campaign not found"));

        if (requestRepo.existsByCampaignAndInfluencerProfile(campaign, inf)) {
            throw new RuntimeException("Already applied");
        }

        CollaborationRequest req = new CollaborationRequest();
        req.setInfluencerProfile(inf);
        req.setCampaign(campaign);
        req.setMessage(message);
        req.setProposedRate(proposedRate);
        req.setStatus("pending");

        requestRepo.save(req);
        return mapToResponse(req);
    }

    private BrandProfile getBrandByEmail(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return brandRepo.findByUser(user).orElseThrow(() -> new RuntimeException("Brand profile not found"));
    }

    private InfluencerProfile getInfByEmail(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return infRepo.findByUser(user).orElseThrow(() -> new RuntimeException("Influencer profile not found"));
    }

    private RequestResponse mapToResponse(CollaborationRequest r) {
        RequestResponse rr = new RequestResponse();
        rr.setId(r.getId());
        rr.setCreatorId(r.getInfluencerProfile().getId());
        rr.setCreatorName(r.getInfluencerProfile().getUser() != null ? r.getInfluencerProfile().getUser().getName() : "Creator");
        rr.setCreatorNiche(r.getInfluencerProfile().getNiche());
        rr.setCampaignTitle(r.getCampaign().getTitle());
        rr.setCampaignId(r.getCampaign().getId());
        rr.setMessage(r.getMessage());
        rr.setProposedRate(r.getProposedRate());
        rr.setDate(r.getCreatedAt() != null ? r.getCreatedAt().format(FMT) : null);
        rr.setStatus(r.getStatus());
        return rr;
    }
}
