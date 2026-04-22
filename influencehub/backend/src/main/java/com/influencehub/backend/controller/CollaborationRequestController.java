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

/**
 * CollaborationRequestController — handles brand-to-creator collaboration requests.
 *
 * Design Patterns used:
 *  - Facade Pattern: This controller acts as a facade over the repository layer,
 *    providing a simplified API surface for request lifecycle management.
 *  - Strategy Pattern (implicit): Status transitions (PENDING → ACCEPTED / REJECTED)
 *    are handled via a status-update endpoint, keeping logic centralized.
 */
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

    /**
     * POST /api/requests
     * Brand sends a collaboration request to a creator.
     * campaignId is OPTIONAL — brand can send a request without linking to a campaign.
     * A description field allows the brand to describe their intent.
     */
    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(@RequestBody Map<String, Object> body,
            @RequestHeader("Authorization") String authHeader) {
        User brandUser = getCurrentUser(authHeader);
        if (brandUser == null)
            return ResponseEntity.status(401).body("Unauthorized");

        Object creatorIdObj = body.get("creatorId");
        if (creatorIdObj == null)
            return ResponseEntity.badRequest().body("creatorId is required");

        Long creatorId = Long.valueOf(creatorIdObj.toString());
        String description = (String) body.get("description");
        String message = (String) body.get("message"); // backwards compat

        Optional<User> creatorOpt = userRepository.findById(creatorId);
        if (creatorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid creatorId");
        }

        // Check for existing pending request to avoid duplicates
        List<CollaborationRequest> existing = requestRepository.findAllByBrand(brandUser)
                .stream()
                .filter(r -> r.getCreator().getId().equals(creatorId) && "PENDING".equals(r.getStatus()))
                .collect(Collectors.toList());
        if (!existing.isEmpty()) {
            return ResponseEntity.badRequest().body("A pending request to this creator already exists.");
        }

        CollaborationRequest request = new CollaborationRequest();
        request.setBrand(brandUser);
        request.setCreator(creatorOpt.get());
        request.setDescription(description != null ? description : message);
        request.setMessage(message); // keep for backwards compat

        // campaignId is optional
        if (body.get("campaignId") != null) {
            try {
                Long campaignId = Long.valueOf(body.get("campaignId").toString());
                campaignRepository.findById(campaignId).ifPresent(request::setCampaign);
            } catch (NumberFormatException ignored) {}
        }

        CollaborationRequest saved = requestRepository.save(request);

        // Notify the influencer — Observer-style notification via NotificationService
        String campaignName = saved.getCampaign() != null ? saved.getCampaign().getTitle() : "a new opportunity";
        notificationService.notify(
                creatorOpt.get(),
                "request",
                brandUser.getName() + " sent you a collaboration request for " + campaignName,
                "/influencer/requests"
        );

        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("status", saved.getStatus());
        response.put("creatorId", saved.getCreator().getId());
        response.put("timestamp", saved.getTimestamp());

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/brand/requests
     * Returns all collaboration requests sent by the authenticated brand.
     */
    @GetMapping("/brand/requests")
    public ResponseEntity<?> getBrandRequests(@RequestHeader("Authorization") String authHeader) {
        User user = getCurrentUser(authHeader);
        if (user == null)
            return ResponseEntity.status(401).body("Unauthorized");

        List<CollaborationRequest> requests = requestRepository.findAllByBrand(user);

        List<Map<String, Object>> responseList = requests.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            // Campaign title is optional since campaign may be null
            map.put("campaignTitle", r.getCampaign() != null ? r.getCampaign().getTitle() : null);
            map.put("creatorName", r.getCreator().getName());
            map.put("creatorId", r.getCreator().getId());
            map.put("status", r.getStatus());
            map.put("timestamp", r.getTimestamp());
            // Use description if available, fall back to message
            map.put("message", r.getDescription() != null ? r.getDescription() : r.getMessage());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    /**
     * GET /api/influencer/requests
     * Returns all collaboration requests received by the authenticated influencer.
     */
    @GetMapping("/influencer/requests")
    public ResponseEntity<?> getInfluencerRequests(@RequestHeader("Authorization") String authHeader) {
        User user = getCurrentUser(authHeader);
        if (user == null)
            return ResponseEntity.status(401).body("Unauthorized");

        List<CollaborationRequest> requests = requestRepository.findAllByCreator(user);

        List<Map<String, Object>> responseList = requests.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("campaignTitle", r.getCampaign() != null ? r.getCampaign().getTitle() : null);
            map.put("brandName", r.getBrand().getName());
            map.put("brandId", r.getBrand().getId());
            map.put("status", r.getStatus());
            map.put("timestamp", r.getTimestamp());
            map.put("message", r.getDescription() != null ? r.getDescription() : r.getMessage());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    /**
     * PUT /api/requests/{id}/status
     * Influencer accepts or rejects a collaboration request.
     * Only the creator (recipient) of the request can update the status.
     */
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
        // Only the recipient (influencer/creator) can update status
        if (!req.getCreator().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Forbidden");
        }

        req.setStatus(status.toUpperCase());
        requestRepository.save(req);

        // Notify brand — Observer pattern via NotificationService
        String statusLabel = status.toLowerCase();
        notificationService.notify(
                req.getBrand(),
                "request",
                user.getName() + " has " + statusLabel + " your collaboration request",
                "/brand/requests"
        );

        Map<String, Object> response = new HashMap<>();
        response.put("id", req.getId());
        response.put("status", req.getStatus());
        return ResponseEntity.ok(response);
    }
}
