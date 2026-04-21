package com.influencehub.backend.brand.service;

import com.influencehub.backend.brand.dto.CampaignRequest;
import com.influencehub.backend.brand.dto.CampaignResponse;
import com.influencehub.backend.brand.model.BrandProfile;
import com.influencehub.backend.brand.model.Campaign;
import com.influencehub.backend.brand.repository.BrandProfileRepository;
import com.influencehub.backend.brand.repository.CampaignRepository;
import com.influencehub.backend.brand.repository.CollaborationRequestRepository;
import com.influencehub.backend.influencer.repository.InfluencerProfileRepository;
import com.influencehub.backend.model.User;
import com.influencehub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CampaignServiceImpl implements CampaignService {

    @Autowired private CampaignRepository campaignRepo;
    @Autowired private BrandProfileRepository brandProfileRepo;
    @Autowired private UserRepository userRepository;
    @Autowired private CollaborationRequestRepository requestRepo;
    @Autowired private InfluencerProfileRepository influencerRepo;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("MMM d, yyyy");

    @Override
    public Map<String, Object> getBrandCampaigns(String email, String status, int page) {
        BrandProfile bp = getBrandByEmail(email);
        Page<Campaign> pagedResult;
        if (status != null && !status.isEmpty()) {
            pagedResult = campaignRepo.findByBrandProfileAndStatus(bp, status, PageRequest.of(page - 1, 10));
        } else {
            pagedResult = campaignRepo.findByBrandProfile(bp, PageRequest.of(page - 1, 10));
        }

        List<CampaignResponse> campaigns = pagedResult.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());
        return Map.of("campaigns", campaigns, "total", pagedResult.getTotalElements());
    }

    @Override
    public CampaignResponse getCampaignById(Long id, String currentUserEmail) {
        Campaign campaign = campaignRepo.findById(id).orElseThrow(() -> new RuntimeException("Campaign not found"));
        CampaignResponse res = mapToResponse(campaign);

        // Influencer specific checking for 'hasApplied'
        if (currentUserEmail != null) {
            Optional<User> user = userRepository.findByEmail(currentUserEmail);
            if (user.isPresent() && "influencer".equals(user.get().getRole())) {
                influencerRepo.findByUser(user.get()).ifPresent(inf -> {
                    res.setHasApplied(requestRepo.existsByCampaignAndInfluencerProfile(campaign, inf));
                });
            }
        }
        return res;
    }

    @Override
    public CampaignResponse createCampaign(String email, CampaignRequest request) {
        Campaign campaign = mapToEntity(request, new Campaign());
        campaign.setBrandProfile(getBrandByEmail(email));
        if (campaign.getStatus() == null) campaign.setStatus("active");
        campaignRepo.save(campaign);
        return mapToResponse(campaign);
    }

    @Override
    public CampaignResponse updateCampaign(Long id, String email, CampaignRequest request) {
        Campaign campaign = campaignRepo.findById(id).orElseThrow(() -> new RuntimeException("Campaign not found"));
        checkOwnership(campaign, email);
        campaign = mapToEntity(request, campaign);
        campaignRepo.save(campaign);
        return mapToResponse(campaign);
    }

    @Override
    public void updateStatus(Long id, String email, String status) {
        Campaign campaign = campaignRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        checkOwnership(campaign, email);
        campaign.setStatus(status);
        campaignRepo.save(campaign);
    }

    @Override
    public void deleteCampaign(Long id, String email) {
        Campaign campaign = campaignRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        checkOwnership(campaign, email);
        campaignRepo.delete(campaign);
    }

    @Override
    public CampaignResponse duplicateCampaign(Long id, String email) {
        Campaign existing = campaignRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        checkOwnership(existing, email);

        Campaign dub = new Campaign();
        dub.setTitle(existing.getTitle() + " (Copy)");
        dub.setProductName(existing.getProductName());
        dub.setIndustry(existing.getIndustry());
        dub.setDescription(existing.getDescription());
        dub.setContentTypes(existing.getContentTypes());
        dub.setPlatforms(existing.getPlatforms());
        dub.setMinFollowers(existing.getMinFollowers());
        dub.setMinEngagement(existing.getMinEngagement());
        dub.setLocation(existing.getLocation());
        dub.setCreatorCount(existing.getCreatorCount());
        dub.setDeliverables(existing.getDeliverables());
        dub.setUsageRights(existing.getUsageRights());
        dub.setBudgetMin(existing.getBudgetMin());
        dub.setBudgetMax(existing.getBudgetMax());
        dub.setIncentives(existing.getIncentives());
        dub.setStartDate(existing.getStartDate());
        dub.setDraftDeadline(existing.getDraftDeadline());
        dub.setGoLiveDate(existing.getGoLiveDate());
        dub.setMaxCreators(existing.getMaxCreators());
        dub.setAutoClose(existing.getAutoClose());
        dub.setVisibility(existing.getVisibility());
        dub.setBrandProfile(existing.getBrandProfile());
        dub.setStatus("draft");

        campaignRepo.save(dub);
        return mapToResponse(dub);
    }

    @Override
    public Map<String, Object> browseCampaigns(int page) {
        Page<Campaign> pagedResult = campaignRepo.findByStatusAndVisibility("active", "Public", PageRequest.of(page - 1, 10));
        List<CampaignResponse> campaigns = pagedResult.getContent().stream().map(this::mapToResponse).collect(Collectors.toList());
        return Map.of("campaigns", campaigns, "total", pagedResult.getTotalElements());
    }

    private BrandProfile getBrandByEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return brandProfileRepo.findByUser(user).orElseThrow(() -> new RuntimeException("Brand profile not found"));
    }

    private void checkOwnership(Campaign campaign, String email) {
        if (!campaign.getBrandProfile().getUser().getEmail().equals(email)) {
            throw new RuntimeException("Forbidden");
        }
    }

    private Campaign mapToEntity(CampaignRequest req, Campaign c) {
        c.setTitle(req.getTitle());
        c.setProductName(req.getProductName());
        c.setIndustry(req.getIndustry());
        c.setDescription(req.getDescription());
        c.setContentTypes(req.getContentTypes() != null ? String.join(",", req.getContentTypes()) : "");
        c.setPlatforms(req.getPlatforms() != null ? String.join(",", req.getPlatforms()) : "");
        c.setMinFollowers(req.getMinFollowers());
        c.setMinEngagement(req.getMinEngagement());
        c.setLocation(req.getLocation());
        c.setCreatorCount(req.getCreatorCount());
        c.setDeliverables(req.getDeliverables());
        c.setUsageRights(req.getUsageRights());
        c.setBudgetMin(req.getBudgetMin());
        c.setBudgetMax(req.getBudgetMax());
        c.setIncentives(req.getIncentives());
        
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        if (req.getStartDate() != null && !req.getStartDate().isEmpty()) c.setStartDate(LocalDate.parse(req.getStartDate(), fmt));
        if (req.getDraftDeadline() != null && !req.getDraftDeadline().isEmpty()) c.setDraftDeadline(LocalDate.parse(req.getDraftDeadline(), fmt));
        if (req.getGoLiveDate() != null && !req.getGoLiveDate().isEmpty()) c.setGoLiveDate(LocalDate.parse(req.getGoLiveDate(), fmt));

        c.setMaxCreators(req.getMaxCreators());
        c.setAutoClose(req.getAutoClose());
        c.setVisibility(req.getVisibility() != null ? req.getVisibility() : "Public");
        
        if (req.getStatus() != null) c.setStatus(req.getStatus());
        return c;
    }

    private CampaignResponse mapToResponse(Campaign c) {
        CampaignResponse res = new CampaignResponse();
        res.setId(c.getId());
        res.setTitle(c.getTitle());
        res.setProductName(c.getProductName());
        res.setIndustry(c.getIndustry());
        res.setDescription(c.getDescription());
        res.setContentTypes(c.getContentTypes() != null && !c.getContentTypes().isEmpty() ? Arrays.asList(c.getContentTypes().split(",")) : List.of());
        res.setPlatforms(c.getPlatforms() != null && !c.getPlatforms().isEmpty() ? Arrays.asList(c.getPlatforms().split(",")) : List.of());
        res.setMinFollowers(c.getMinFollowers());
        res.setMinEngagement(c.getMinEngagement());
        res.setLocation(c.getLocation());
        res.setCreatorCount(c.getCreatorCount());
        res.setDeliverables(c.getDeliverables());
        res.setUsageRights(c.getUsageRights());
        res.setBudgetMin(c.getBudgetMin());
        res.setBudgetMax(c.getBudgetMax());
        
        if (c.getBudgetMin() != null && c.getBudgetMax() != null) {
            res.setBudget("₹" + c.getBudgetMin() + " – ₹" + c.getBudgetMax());
        }

        res.setIncentives(c.getIncentives());
        res.setStartDate(c.getStartDate() != null ? c.getStartDate().toString() : null);
        res.setDraftDeadline(c.getDraftDeadline() != null ? c.getDraftDeadline().toString() : null);
        res.setGoLiveDate(c.getGoLiveDate() != null ? c.getGoLiveDate().toString() : null);
        res.setDeadline(res.getGoLiveDate());

        res.setMaxCreators(c.getMaxCreators());
        res.setAutoClose(c.getAutoClose());
        res.setVisibility(c.getVisibility());
        res.setStatus(c.getStatus());

        if (c.getCreatedAt() != null) res.setPostedDate(c.getCreatedAt().format(FMT));
        
        res.setTags(res.getContentTypes());
        res.setCategory(c.getIndustry());

        // Count Requests
        res.setRequestCount(requestRepo.findByBrandProfileIdAndCampaignId(c.getBrandProfile().getId(), c.getId(), PageRequest.of(0, 1)).getTotalElements());
        res.setAcceptedCount(requestRepo.findByBrandProfileIdAndCampaignIdAndStatus(c.getBrandProfile().getId(), c.getId(), "accepted", PageRequest.of(0, 1)).getTotalElements());

        // Brand details for influencer browse
        if (c.getBrandProfile() != null) {
            res.setBrandName(c.getBrandProfile().getBrandName());
            res.setBrandLocation(c.getBrandProfile().getLocation());
            res.setBrandCampaignCount(String.valueOf(campaignRepo.countByBrandProfile(c.getBrandProfile())));
            res.setVerified(c.getBrandProfile().getVerified());
        }

        return res;
    }
}
