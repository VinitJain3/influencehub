package com.influencehub.backend.campaign.service;

import com.influencehub.backend.brand.model.BrandProfile;
import com.influencehub.backend.brand.repository.BrandProfileRepository;
import com.influencehub.backend.campaign.model.Campaign;
import com.influencehub.backend.campaign.repository.CampaignRepository;
import com.influencehub.backend.application.repository.CampaignApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CampaignServiceImpl implements CampaignService {

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private BrandProfileRepository brandProfileRepository;

    @Autowired
    private CampaignApplicationRepository applicationRepository;

    @Override
    public Map<String, Object> getBrandCampaigns(Long userId, String status, int page) {
        BrandProfile brand = brandProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Brand profile not found"));

        Pageable pageable = PageRequest.of(page - 1, 10, Sort.by("createdAt").descending());
        Page<Campaign> campaignPage;

        if (status == null || status.isEmpty() || status.equalsIgnoreCase("all")) {
            campaignPage = campaignRepository.findByBrandProfileId(brand.getId(), pageable);
        } else {
            campaignPage = campaignRepository.findByBrandProfileIdAndStatus(brand.getId(), status, pageable);
        }

        List<Map<String, Object>> campaigns = campaignPage.getContent().stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("title", c.getTitle());
            map.put("category", c.getIndustry());
            map.put("status", c.getStatus());
            map.put("budget", c.getBudgetMax() != null ? "₹" + c.getBudgetMax() : "N/A");
            map.put("postedDate", c.getCreatedAt().toLocalDate().toString());
            map.put("requestCount", applicationRepository.countByCampaignId(c.getId()));
            map.put("acceptedCount", applicationRepository.countByCampaignIdAndStatus(c.getId(), "accepted"));
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("campaigns", campaigns);
        response.put("total", campaignPage.getTotalElements());
        return response;
    }

    @Override
    public Map<String, Object> getPublicCampaigns(String search, String industry, String sortStr, int page) {
        Sort sort = Sort.by("createdAt").descending(); // default newest
        if ("relevance".equalsIgnoreCase(sortStr)) {
            sort = Sort.by("createdAt").descending(); // simple fallback
        } else if ("budget_desc".equalsIgnoreCase(sortStr)) {
            sort = Sort.by("budgetMax").descending();
        } else if ("budget_asc".equalsIgnoreCase(sortStr)) {
            sort = Sort.by("budgetMin").ascending();
        } else if ("deadline".equalsIgnoreCase(sortStr)) {
            sort = Sort.by("draftDeadline").ascending();
        }

        Pageable pageable = PageRequest.of(page - 1, 10, sort);
        Page<Campaign> campaignPage = campaignRepository.findPublicCampaigns(
                (search != null && !search.isEmpty()) ? search : null,
                (industry != null && !industry.isEmpty()) ? industry : null,
                pageable);

        List<Map<String, Object>> campaigns = campaignPage.getContent().stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("title", c.getTitle());
            map.put("brandName", c.getBrandProfile().getBrandName());
            map.put("description", c.getDescription());
            map.put("budget", "₹" + c.getBudgetMin() + " - " + c.getBudgetMax());
            map.put("deadline", c.getDraftDeadline() != null ? c.getDraftDeadline().toString() : "N/A");
            map.put("contentTypes", c.getContentTypes() != null ? List.of(c.getContentTypes().split(",")) : List.of());
            map.put("platforms", c.getPlatforms() != null ? List.of(c.getPlatforms().split(",")) : List.of());
            map.put("requestCount", applicationRepository.countByCampaignId(c.getId()));
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("campaigns", campaigns);
        response.put("total", campaignPage.getTotalElements());
        return response;
    }

    @Override
    public Campaign getCampaignById(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
    }

    @Override
    public Campaign createCampaign(Long userId, Map<String, Object> payload) {
        BrandProfile brand = brandProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Brand profile not found"));

        Campaign campaign = new Campaign();
        campaign.setBrandProfile(brand);
        mapPayloadToCampaign(payload, campaign);
        return campaignRepository.save(campaign);
    }

    @Override
    public Campaign updateCampaign(Long id, Map<String, Object> payload) {
        Campaign campaign = getCampaignById(id);
        mapPayloadToCampaign(payload, campaign);
        return campaignRepository.save(campaign);
    }

    @Override
    public void updateStatus(Long id, String status) {
        Campaign campaign = getCampaignById(id);
        campaign.setStatus(status);
        campaignRepository.save(campaign);
    }

    @Override
    public void deleteCampaign(Long id) {
        campaignRepository.deleteById(id);
    }

    @Override
    public Campaign duplicateCampaign(Long id) {
        Campaign original = getCampaignById(id);
        Campaign duplicate = new Campaign();
        duplicate.setBrandProfile(original.getBrandProfile());
        duplicate.setTitle("Copy of " + original.getTitle());
        duplicate.setProductName(original.getProductName());
        duplicate.setIndustry(original.getIndustry());
        duplicate.setDescription(original.getDescription());
        duplicate.setContentTypes(original.getContentTypes());
        duplicate.setPlatforms(original.getPlatforms());
        duplicate.setMinFollowers(original.getMinFollowers());
        duplicate.setMinEngagement(original.getMinEngagement());
        duplicate.setLocation(original.getLocation());
        duplicate.setCreatorCount(original.getCreatorCount());
        duplicate.setDeliverables(original.getDeliverables());
        duplicate.setUsageRights(original.getUsageRights());
        duplicate.setBudgetMin(original.getBudgetMin());
        duplicate.setBudgetMax(original.getBudgetMax());
        duplicate.setIncentives(original.getIncentives());
        duplicate.setStartDate(original.getStartDate());
        duplicate.setDraftDeadline(original.getDraftDeadline());
        duplicate.setGoLiveDate(original.getGoLiveDate());
        duplicate.setMaxCreators(original.getMaxCreators());
        duplicate.setAutoClose(original.getAutoClose());
        duplicate.setVisibility(original.getVisibility());
        duplicate.setStatus("draft");
        return campaignRepository.save(duplicate);
    }

    private void mapPayloadToCampaign(Map<String, Object> payload, Campaign campaign) {
        if(payload.containsKey("title")) campaign.setTitle((String) payload.get("title"));
        if(payload.containsKey("productName")) campaign.setProductName((String) payload.get("productName"));
        if(payload.containsKey("industry")) campaign.setIndustry((String) payload.get("industry"));
        if(payload.containsKey("description")) campaign.setDescription((String) payload.get("description"));
        if(payload.containsKey("contentTypes")) {
            List<String> types = (List<String>) payload.get("contentTypes");
            campaign.setContentTypes(types != null ? String.join(",", types) : "");
        }
        if(payload.containsKey("platforms")) {
            List<String> platforms = (List<String>) payload.get("platforms");
            campaign.setPlatforms(platforms != null ? String.join(",", platforms) : "");
        }
        if(payload.containsKey("minFollowers")) campaign.setMinFollowers((String) payload.get("minFollowers"));
        if(payload.containsKey("minEngagement")) campaign.setMinEngagement((String) payload.get("minEngagement"));
        if(payload.containsKey("location")) campaign.setLocation((String) payload.get("location"));
        if(payload.containsKey("creatorCount")) campaign.setCreatorCount(Integer.parseInt(payload.get("creatorCount").toString()));
        if(payload.containsKey("deliverables")) campaign.setDeliverables((String) payload.get("deliverables"));
        if(payload.containsKey("usageRights")) campaign.setUsageRights((String) payload.get("usageRights"));
        if(payload.containsKey("budgetMin")) campaign.setBudgetMin(Double.parseDouble(payload.get("budgetMin").toString()));
        if(payload.containsKey("budgetMax")) campaign.setBudgetMax(Double.parseDouble(payload.get("budgetMax").toString()));
        if(payload.containsKey("incentives")) campaign.setIncentives((String) payload.get("incentives"));
        
        if(payload.containsKey("startDate") && payload.get("startDate") != null && !((String)payload.get("startDate")).isEmpty()) {
            campaign.setStartDate(LocalDate.parse((String) payload.get("startDate")));
        }
        if(payload.containsKey("draftDeadline") && payload.get("draftDeadline") != null && !((String)payload.get("draftDeadline")).isEmpty()) {
            campaign.setDraftDeadline(LocalDate.parse((String) payload.get("draftDeadline")));
        }
        if(payload.containsKey("goLiveDate") && payload.get("goLiveDate") != null && !((String)payload.get("goLiveDate")).isEmpty()) {
            campaign.setGoLiveDate(LocalDate.parse((String) payload.get("goLiveDate")));
        }
        
        if(payload.containsKey("maxCreators") && payload.get("maxCreators") != null && !payload.get("maxCreators").toString().isEmpty()){
            campaign.setMaxCreators(Integer.parseInt(payload.get("maxCreators").toString()));
        }
        if(payload.containsKey("autoClose")) campaign.setAutoClose((String) payload.get("autoClose"));
        if(payload.containsKey("visibility")) campaign.setVisibility((String) payload.get("visibility"));
        if(payload.containsKey("status")) campaign.setStatus((String) payload.get("status"));
    }
}
