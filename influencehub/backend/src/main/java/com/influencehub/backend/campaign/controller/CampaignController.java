package com.influencehub.backend.campaign.controller;

import com.influencehub.backend.campaign.model.Campaign;
import com.influencehub.backend.campaign.service.CampaignService;
import com.influencehub.backend.model.User;
import com.influencehub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    @Autowired
    private CampaignService campaignService;

    @Autowired
    private UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null; // Handle properly in production
        }
        String email = (String) auth.getPrincipal();
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null ? user.getId() : null;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCampaigns(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String industry,
            @RequestParam(defaultValue = "relevance") String sort,
            @RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(campaignService.getPublicCampaigns(search, industry, sort, page));
    }

    @GetMapping("/brand")
    public ResponseEntity<Map<String, Object>> getBrandCampaigns(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page) {
        Long userId = getCurrentUserId();
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(campaignService.getBrandCampaigns(userId, status, page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Campaign> getCampaign(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getCampaignById(id));
    }

    @PostMapping
    public ResponseEntity<Campaign> createCampaign(@RequestBody Map<String, Object> payload) {
        Long userId = getCurrentUserId();
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(campaignService.createCampaign(userId, payload));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Campaign> updateCampaign(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(campaignService.updateCampaign(id, payload));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        campaignService.updateStatus(id, payload.get("status"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable Long id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<Campaign> duplicateCampaign(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.duplicateCampaign(id));
    }
}
