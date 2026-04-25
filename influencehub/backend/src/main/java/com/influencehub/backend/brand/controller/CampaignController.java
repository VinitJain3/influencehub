package com.influencehub.backend.brand.controller;

import com.influencehub.backend.config.JwtUtil;
import com.influencehub.backend.brand.model.Campaign;
import com.influencehub.backend.brand.model.BrandProfile;
import com.influencehub.backend.model.User;
import com.influencehub.backend.brand.repository.BrandProfileRepository;
import com.influencehub.backend.brand.repository.CampaignRepository;
import com.influencehub.backend.repository.UserRepository;
import com.influencehub.backend.repository.CollaborationRequestRepository;
import com.influencehub.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class CampaignController {

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CollaborationRequestRepository requestRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private BrandProfileRepository brandProfileRepository;

    /** Resolves a brand user's display name: BrandProfile.brandName first, fallback to user.getName() */
    private String resolveBrandName(User brand) {
        if (brand == null) return "--";
        return brandProfileRepository.findByUserId(brand.getId())
                .map(bp -> bp.getBrandName() != null && !bp.getBrandName().isBlank() ? bp.getBrandName() : brand.getName())
                .orElse(brand.getName());
    }

    private User getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (jwtUtil.validateToken(token)) {
            String email = jwtUtil.extractUsername(token);
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }

    @GetMapping("/campaigns")
    public ResponseEntity<?> getAllCampaigns(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String budget,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Long brandId,
            @RequestParam(defaultValue = "1") int page) {

        List<Campaign> campaigns = campaignRepository.findAll();

        // Filter by brandId if provided (for influencer "View Brand's Campaigns" feature)
        if (brandId != null) {
            campaigns = campaigns.stream()
                    .filter(c -> c.getBrand() != null && c.getBrand().getId().equals(brandId))
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> responseList = campaigns.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("title", c.getTitle());
            map.put("description", c.getDescription());
            if (c.getBrand() != null) {
                // Use brand company name, not the owner's personal name
                map.put("brandName", resolveBrandName(c.getBrand()));
                map.put("brandId", c.getBrand().getId());
            }
            map.put("verified", true);
            map.put("contentTypes", c.getContentTypes());
            map.put("platforms", c.getPlatforms());
            map.put("budget", c.getBudgetMax() != null ? String.format("%.0f", c.getBudgetMax()) : "--");
            map.put("deadline", c.getDraftDeadline() != null ? c.getDraftDeadline().toString() : "--");
            map.put("requestCount", requestRepository.countByCampaign(c));
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("campaigns", responseList);
        response.put("total", responseList.size());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/campaigns")
    public ResponseEntity<?> createCampaign(@RequestBody Campaign campaign, @RequestHeader("Authorization") String authHeader) {
        User user = getCurrentUser(authHeader);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        campaign.setBrand(user);
        Campaign saved = campaignRepository.save(campaign);

        // Notify all influencers
        List<User> influencers = userRepository.findAll().stream()
                .filter(u -> "influencer".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());

        for (User influencer : influencers) {
            notificationService.notify(influencer, "campaign", "New campaign posted: " + saved.getTitle(), "/influencer/campaigns/" + saved.getId());
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/brand/campaigns")
    public ResponseEntity<?> getBrandCampaigns(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestHeader("Authorization") String authHeader) {
        
        User user = getCurrentUser(authHeader);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        List<Campaign> campaigns = (status == null || status.isEmpty()) 
                ? campaignRepository.findAllByBrand(user)
                : campaignRepository.findAllByBrandAndStatus(user, status);

        // Map to include request counts as expected by frontend
        List<Map<String, Object>> responseList = campaigns.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("title", c.getTitle());
            map.put("status", c.getStatus());
            map.put("budget", c.getBudgetMax() != null ? String.format("%.0f", c.getBudgetMax()) : "--");
            map.put("requestCount", requestRepository.countByCampaign(c));
            map.put("acceptedCount", 0); // Placeholder
            map.put("postedDate", c.getPostedDate());
            map.put("category", c.getIndustry());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("campaigns", responseList);
        response.put("total", responseList.size());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/campaigns/{id}")
    public ResponseEntity<?> getCampaign(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User currentUser = getCurrentUser(authHeader);
        return campaignRepository.findById(id)
                .map(c -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", c.getId());
                    map.put("title", c.getTitle());
                    map.put("description", c.getDescription());
                    map.put("industry", c.getIndustry());
                    map.put("contentTypes", c.getContentTypes());
                    map.put("platforms", c.getPlatforms());
                    map.put("creatorCount", c.getCreatorCount());
                    map.put("postedDate", c.getPostedDate());
                    map.put("deliverables", c.getDeliverables());
                    map.put("location", c.getLocation());
                    
                    if (c.getBrand() != null) {
                        map.put("brandName", resolveBrandName(c.getBrand()));
                        map.put("brandId", c.getBrand().getId());
                    }
                    map.put("verified", true);
                    map.put("budget", c.getBudgetMax() != null ? String.format("%.0f", c.getBudgetMax()) : "--");
                    map.put("deadline", c.getDraftDeadline() != null ? c.getDraftDeadline().toString() : "--");
                    
                    boolean hasApplied = false;
                    String applicationStatus = null;
                    if (currentUser != null && "influencer".equalsIgnoreCase(currentUser.getRole())) {
                        java.util.Optional<com.influencehub.backend.model.CollaborationRequest> req = requestRepository.findAllByCreator(currentUser).stream()
                                .filter(r -> r.getCampaign() != null && r.getCampaign().getId().equals(id)
                                          && ("INFLUENCER".equals(r.getInitiatedBy()) || r.getInitiatedBy() == null))
                                .findFirst();
                        if (req.isPresent()) {
                            hasApplied = true;
                            applicationStatus = req.get().getStatus();
                        }
                    }
                    map.put("hasApplied", hasApplied);
                    map.put("applicationStatus", applicationStatus != null ? applicationStatus.toLowerCase() : null);
                    
                    return ResponseEntity.ok((Object) map);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/campaigns/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return campaignRepository.findById(id).map(c -> {
            c.setStatus(body.get("status"));
            campaignRepository.save(c);
            return ResponseEntity.ok(c);
        }).orElse(ResponseEntity.notFound().build());
    }
}
