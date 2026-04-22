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
 * CollaborationRequestController — handles brand-to-creator collaboration
 * requests.
 *
 * Design Patterns used:
 * - Facade Pattern: This controller acts as a facade over the repository layer,
 * providing a simplified API surface for request lifecycle management.
 * - Strategy Pattern (implicit): Status transitions (PENDING → ACCEPTED /
 * REJECTED)
 * are handled via a status-update endpoint, keeping logic centralized.
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
    private com.influencehub.backend.influencer.repository.InfluencerProfileRepository influencerProfileRepository;

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
     * campaignId is OPTIONAL — brand can send a request without linking to a
     * campaign.
     * A description field allows the brand to describe their intent.
     */
    @PostMapping("/requests")
    public ResponseEntity<?> createRequest(@RequestBody Map<String, Object> body,
            @RequestHeader("Authorization") String authHeader) {
        User currentUser = getCurrentUser(authHeader);
        if (currentUser == null)
            return ResponseEntity.status(401).body("Unauthorized");

        CollaborationRequest request = new CollaborationRequest();

        if ("influencer".equalsIgnoreCase(currentUser.getRole())) {
            // Influencer applying to a campaign
            Object campaignIdObj = body.get("campaignId");
            if (campaignIdObj == null) {
                return ResponseEntity.badRequest().body("campaignId is required for influencers");
            }
            Long campaignId = Long.valueOf(campaignIdObj.toString());
            Optional<Campaign> campaignOpt = campaignRepository.findById(campaignId);
            if (campaignOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid campaignId");
            }
            Campaign campaign = campaignOpt.get();

            // Check for existing pending request
            List<CollaborationRequest> existing = requestRepository.findAllByCreator(currentUser)
                    .stream()
                    .filter(r -> r.getCampaign() != null && r.getCampaign().getId().equals(campaignId)
                            && "PENDING".equals(r.getStatus()))
                    .collect(Collectors.toList());
            if (!existing.isEmpty()) {
                return ResponseEntity.badRequest().body("You have already applied for this campaign.");
            }

            request.setBrand(campaign.getBrand());
            request.setCreator(currentUser);
            request.setCampaign(campaign);

            String message = (String) body.get("message");
            Object rateObj = body.get("proposedRate");
            if (rateObj != null && !rateObj.toString().isEmpty()) {
                message = (message != null ? message + "\n" : "") + "Proposed Rate: ₹" + rateObj.toString();
            }
            request.setDescription(message);
            request.setMessage(message);

            CollaborationRequest saved = requestRepository.save(request);
            notificationService.notify(
                    campaign.getBrand(),
                    "request",
                    currentUser.getName() + " applied to your campaign: " + campaign.getTitle(),
                    "/brand/requests");

            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId());
            response.put("status", saved.getStatus());
            return ResponseEntity.ok(response);

        } else {
            // Brand requesting an influencer
            Object creatorIdObj = body.get("creatorId");
            if (creatorIdObj == null)
                return ResponseEntity.badRequest().body("creatorId is required");

            Long creatorId = Long.valueOf(creatorIdObj.toString());
            String description = (String) body.get("description");
            String message = (String) body.get("message");

            Optional<User> creatorOpt = userRepository.findById(creatorId);
            if (creatorOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid creatorId");
            }

            // Check for existing pending request to avoid duplicates
            List<CollaborationRequest> existing = requestRepository.findAllByBrand(currentUser)
                    .stream()
                    .filter(r -> r.getCreator().getId().equals(creatorId) && "PENDING".equals(r.getStatus()))
                    .collect(Collectors.toList());
            if (!existing.isEmpty()) {
                return ResponseEntity.badRequest().body("A pending request to this creator already exists.");
            }

            request.setBrand(currentUser);
            request.setCreator(creatorOpt.get());
            request.setDescription(description != null ? description : message);
            request.setMessage(message);

            if (body.get("campaignId") != null) {
                try {
                    Long campaignId = Long.valueOf(body.get("campaignId").toString());
                    campaignRepository.findById(campaignId).ifPresent(request::setCampaign);
                } catch (NumberFormatException ignored) {
                }
            }

            CollaborationRequest saved = requestRepository.save(request);

            // Notify the influencer
            String campaignName = saved.getCampaign() != null ? saved.getCampaign().getTitle() : "a new opportunity";
            notificationService.notify(
                    creatorOpt.get(),
                    "request",
                    currentUser.getName() + " sent you a collaboration request for " + campaignName,
                    "/influencer/requests");

            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId());
            response.put("status", saved.getStatus());
            response.put("creatorId", saved.getCreator().getId());
            response.put("timestamp", saved.getTimestamp());

            return ResponseEntity.ok(response);
        }
    }

    /**
     * GET /api/brand/requests
     * Returns all collaboration requests sent by the authenticated brand.
     */
    @GetMapping("/brand/requests")
    public ResponseEntity<?> getBrandRequests(
            @RequestParam(required = false) String status,
            @RequestHeader("Authorization") String authHeader) {
        User user = getCurrentUser(authHeader);
        if (user == null)
            return ResponseEntity.status(401).body("Unauthorized");

        List<CollaborationRequest> requests = requestRepository.findAllByBrand(user);
        if (status != null && !status.isEmpty()) {
            requests = requests.stream()
                    .filter(r -> status.equalsIgnoreCase(r.getStatus()))
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> responseList = requests.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            if (r.getCampaign() != null) {
                map.put("campaignTitle", r.getCampaign().getTitle());
                map.put("category", r.getCampaign().getIndustry());
            }
            map.put("creatorName", r.getCreator().getName());
            map.put("creatorId", r.getCreator().getId());
            map.put("status", r.getStatus() != null ? r.getStatus().toLowerCase() : "pending");
            map.put("date", r.getTimestamp() != null ? r.getTimestamp().toLocalDate().toString() : "--");

            String msg = r.getDescription() != null ? r.getDescription() : r.getMessage();
            map.put("message", msg);
            if (msg != null && msg.contains("Proposed Rate: ₹")) {
                int idx = msg.indexOf("Proposed Rate: ₹");
                map.put("proposedRate", msg.substring(idx + 16).trim());
            }
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("requests", responseList);
        response.put("total", responseList.size());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/influencer/requests
     * Returns all collaboration requests received by the authenticated influencer.
     */
    @GetMapping("/influencer/requests")
    public ResponseEntity<?> getInfluencerRequests(
            @RequestParam(required = false) String status,
            @RequestHeader("Authorization") String authHeader) {
        User user = getCurrentUser(authHeader);
        if (user == null)
            return ResponseEntity.status(401).body("Unauthorized");

        List<CollaborationRequest> requests = requestRepository.findAllByCreator(user);
        if (status != null && !status.isEmpty()) {
            requests = requests.stream()
                    .filter(r -> status.equalsIgnoreCase(r.getStatus()))
                    .collect(Collectors.toList());
        }

        List<Map<String, Object>> responseList = requests.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            if (r.getCampaign() != null) {
                map.put("campaignTitle", r.getCampaign().getTitle());
                map.put("category", r.getCampaign().getIndustry());
            }
            map.put("brandName", r.getBrand() != null ? r.getBrand().getName() : "--");
            map.put("brandId", r.getBrand() != null ? r.getBrand().getId() : null);
            map.put("status", r.getStatus() != null ? r.getStatus().toLowerCase() : "pending");
            map.put("date", r.getTimestamp() != null ? r.getTimestamp().toLocalDate().toString() : "--");

            String msg = r.getDescription() != null ? r.getDescription() : r.getMessage();
            map.put("message", msg);
            if (msg != null && msg.contains("Proposed Rate: ₹")) {
                int idx = msg.indexOf("Proposed Rate: ₹");
                map.put("proposedRate", msg.substring(idx + 16).trim());
            }
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("requests", responseList);
        response.put("total", responseList.size());
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/requests/{id}/status
     * Updates the status of a collaboration request.
     * Both the BRAND (who sent the request) and the CREATOR (recipient) can update
     * status.
     * - Brand uses this to accept/reject incoming applications on their Requests
     * page.
     * - Creator uses this to accept/reject brand outreach on their MyRequests page.
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

        boolean isBrand = req.getBrand().getId().equals(user.getId());
        boolean isCreator = req.getCreator().getId().equals(user.getId());

        // Only a participant (brand or creator) of this request can update it
        if (!isBrand && !isCreator) {
            return ResponseEntity.status(403).body("Forbidden: you are not a participant in this request");
        }

        req.setStatus(status.toUpperCase());
        requestRepository.save(req);

        // Observer-pattern notification: notify the OTHER party
        String statusLabel = status.toLowerCase();
        if (isBrand) {
            // Brand acted — notify the creator
            notificationService.notify(
                    req.getCreator(),
                    "request",
                    req.getBrand().getName() + " has " + statusLabel + " your collaboration request",
                    "/influencer/requests");
        } else {
            // Creator acted — notify the brand
            notificationService.notify(
                    req.getBrand(),
                    "request",
                    req.getCreator().getName() + " has " + statusLabel + " your collaboration request",
                    "/brand/requests");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", req.getId());
        response.put("status", req.getStatus());
        return ResponseEntity.ok(response);
    }
}
