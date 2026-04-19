package com.influencehub.backend.application.controller;

import com.influencehub.backend.application.service.CampaignApplicationService;
import com.influencehub.backend.model.User;
import com.influencehub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class CampaignApplicationController {

    @Autowired
    private CampaignApplicationService applicationService;

    @Autowired
    private UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String email = (String) auth.getPrincipal();
        User user = userRepository.findByEmail(email).orElse(null);
        return user != null ? user.getId() : null;
    }

    @GetMapping("/brand/requests")
    public ResponseEntity<Map<String, Object>> getBrandRequests(
            @RequestParam(required = false) Long campaignId,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "1") int page) {
        Long userId = getCurrentUserId();
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(applicationService.getBrandRequests(userId, campaignId, status, page));
    }

    @GetMapping("/influencer/requests")
    public ResponseEntity<Map<String, Object>> getInfluencerRequests(
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "1") int page) {
        Long userId = getCurrentUserId();
        if (userId == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(applicationService.getInfluencerRequests(userId, status, page));
    }

    @PostMapping("/campaigns/{id}/apply")
    public ResponseEntity<Void> applyToCampaign(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Long userId = getCurrentUserId();
        if (userId == null) return ResponseEntity.status(401).build();
        applicationService.applyToCampaign(userId, id, payload);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/requests/{id}")
    public ResponseEntity<Void> updateRequestStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        applicationService.updateRequestStatus(id, payload.get("status"), payload.get("reason"));
        return ResponseEntity.ok().build();
    }
}
