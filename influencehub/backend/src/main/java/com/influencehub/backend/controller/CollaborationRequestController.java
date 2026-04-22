package com.influencehub.backend.controller;

import com.influencehub.backend.config.JwtUtil;
import com.influencehub.backend.brand.model.Campaign;
import com.influencehub.backend.model.CollaborationRequest;
import com.influencehub.backend.model.User;
import com.influencehub.backend.brand.repository.CampaignRepository;
import com.influencehub.backend.repository.CollaborationRequestRepository;
import com.influencehub.backend.repository.UserRepository;
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
public class CollaborationRequestController {

    @Autowired
    private CollaborationRequestRepository requestRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.influencehub.backend.service.NotificationService notificationService;

    private User getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return null;
        String token = authHeader.substring(7);
        if (jwtUtil.validateToken(token)) {
            String email = jwtUtil.extractUsername(token);
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }

    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(@RequestBody Map<String, Object> body,
            @RequestHeader("Authorization") String authHeader) {
        User brandUser = getCurrentUser(authHeader);
        if (brandUser == null)
            return ResponseEntity.status(401).body("Unauthorized");

        Long creatorId = Long.valueOf(body.get("creatorId").toString());
        Long campaignId = Long.valueOf(body.get("campaignId").toString());
        String message = (String) body.get("message");

        Optional<User> creatorOpt = userRepository.findById(creatorId);
        Optional<Campaign> campaignOpt = campaignRepository.findById(campaignId);

        if (creatorOpt.isEmpty() || campaignOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid creator or campaign ID");
        }

        CollaborationRequest request = new CollaborationRequest();
        request.setBrand(brandUser);
        request.setCreator(creatorOpt.get());
        request.setCampaign(campaignOpt.get());
        request.setMessage(message);

        CollaborationRequest saved = requestRepository.save(request);

        // Notify influencer
        notificationService.notify(creatorOpt.get(), "request",
                "New collaboration request for campaign: " + campaignOpt.get().getTitle(), "/influencer/requests");

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/brand/requests")
    public ResponseEntity<?> getBrandRequests(@RequestHeader("Authorization") String authHeader) {
        User user = getCurrentUser(authHeader);
        if (user == null)
            return ResponseEntity.status(401).body("Unauthorized");

        List<CollaborationRequest> requests = requestRepository.findAllByBrand(user);

        List<Map<String, Object>> responseList = requests.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("campaignTitle", r.getCampaign().getTitle());
            map.put("creatorName", r.getCreator().getName());
            map.put("status", r.getStatus());
            map.put("timestamp", r.getTimestamp());
            map.put("message", r.getMessage());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/influencer/requests")
    public ResponseEntity<?> getInfluencerRequests(@RequestHeader("Authorization") String authHeader) {
        User user = getCurrentUser(authHeader);
        if (user == null)
            return ResponseEntity.status(401).body("Unauthorized");

        List<CollaborationRequest> requests = requestRepository.findAllByCreator(user);

        List<Map<String, Object>> responseList = requests.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("campaignTitle", r.getCampaign().getTitle());
            map.put("brandName", r.getBrand().getName());
            map.put("status", r.getStatus());
            map.put("timestamp", r.getTimestamp());
            map.put("message", r.getMessage());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @PutMapping("/requests/{id}/status")
    public ResponseEntity<?> updateRequestStatus(@PathVariable Long id, @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        User user = getCurrentUser(authHeader);
        if (user == null)
            return ResponseEntity.status(401).body("Unauthorized");

        String status = body.get("status");
        if (status == null)
            return ResponseEntity.badRequest().body("Status is required");

        Optional<CollaborationRequest> reqOpt = requestRepository.findById(id);
        if (reqOpt.isEmpty())
            return ResponseEntity.notFound().build();

        CollaborationRequest req = reqOpt.get();
        // Only the recipient (influencer) can update status
        if (!req.getCreator().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Forbidden");
        }

        req.setStatus(status.toUpperCase());
        requestRepository.save(req);

        // Notify brand
        notificationService.notify(req.getBrand(), "request",
                user.getName() + " has " + status.toLowerCase() + " your request for " + req.getCampaign().getTitle(),
                "/brand/requests");

        return ResponseEntity.ok(req);
    }
}
