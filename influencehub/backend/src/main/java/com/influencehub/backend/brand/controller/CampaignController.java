package com.influencehub.backend.brand.controller;

import com.influencehub.backend.config.JwtUtil;
import com.influencehub.backend.brand.model.Campaign;
import com.influencehub.backend.model.User;
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

    private User getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (jwtUtil.validateToken(token)) {
            String email = jwtUtil.extractUsername(token);
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
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
            map.put("budget", "₹" + c.getBudgetMin() + " - ₹" + c.getBudgetMax());
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
    public ResponseEntity<?> getCampaign(@PathVariable Long id) {
        return campaignRepository.findById(id)
                .map(ResponseEntity::ok)
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
