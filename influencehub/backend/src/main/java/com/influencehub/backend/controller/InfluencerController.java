package com.influencehub.backend.controller;

import com.influencehub.backend.dto.CreatorDTO;
import com.influencehub.backend.dto.CreatorListResponse;
import com.influencehub.backend.influencer.model.InfluencerProfile;
import com.influencehub.backend.influencer.repository.InfluencerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.influencehub.backend.repository.CollaborationRequestRepository;
import com.influencehub.backend.repository.UserRepository;
import com.influencehub.backend.config.JwtUtil;
import com.influencehub.backend.model.User;
import com.influencehub.backend.model.CollaborationRequest;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/creators")
public class InfluencerController {

    @Autowired
    private InfluencerProfileRepository influencerRepository;

    @Autowired
    private CollaborationRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private User getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (jwtUtil.validateToken(token)) {
            return userRepository.findByEmail(jwtUtil.extractUsername(token)).orElse(null);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<CreatorListResponse> getCreators(
            @RequestParam(required = false) List<String> niches,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        User currentUser = getCurrentUser(authHeader);

        List<InfluencerProfile> profiles = (niches != null && !niches.isEmpty())
                ? influencerRepository.findAll().stream()
                        .filter(p -> niches.contains(p.getNiche()))
                        .collect(Collectors.toList())
                : influencerRepository.findAll();

        // Build a map of creatorUserId → effective collaboration status
        // We check ALL requests between this brand and each creator (from either side)
        // to determine the correct button: Message (accepted), Requested (pending), or Request/Request Again
        Map<Long, String> requestStatusByCreatorUserId = new java.util.HashMap<>();
        if (currentUser != null && "brand".equalsIgnoreCase(currentUser.getRole())) {
            // Collect all requests where the brand is involved (either as brand or as the accepting party)
            List<com.influencehub.backend.model.CollaborationRequest> allBrandRequests = requestRepository.findAllByBrand(currentUser);

            allBrandRequests.stream()
                    .filter(r -> r.getCreator() != null)
                    .forEach(r -> {
                        Long cid = r.getCreator().getId();
                        String existing = requestStatusByCreatorUserId.get(cid);
                        String newStatus = r.getStatus() != null ? r.getStatus().toLowerCase() : "pending";
                        // Priority: accepted > pending > rejected
                        if (existing == null || "accepted".equals(newStatus) ||
                                ("pending".equals(newStatus) && !"accepted".equals(existing))) {
                            requestStatusByCreatorUserId.put(cid, newStatus);
                        }
                    });
        }

        List<CreatorDTO> dtos = profiles.stream()
                .map(p -> {
                    CreatorDTO dto = convertToDTO(p);
                    if (p.getUser() != null) {
                        String rs = requestStatusByCreatorUserId.get(p.getUser().getId());
                        if (rs != null) dto.setRequestStatus(rs);
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(new CreatorListResponse(dtos, dtos.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CreatorDTO> getCreator(
            @PathVariable Long id, 
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        User currentUser = getCurrentUser(authHeader);

        return influencerRepository.findById(id)
                .map(p -> {
                    CreatorDTO dto = convertToDTO(p);
                    if (currentUser != null && "brand".equalsIgnoreCase(currentUser.getRole()) && p.getUser() != null) {
                        java.util.Optional<CollaborationRequest> req = requestRepository.findAllByBrand(currentUser).stream()
                                .filter(r -> r.getCreator() != null && r.getCreator().getId().equals(p.getUser().getId()) 
                                          && ("BRAND".equals(r.getInitiatedBy())))
                                .findFirst();
                        if (req.isPresent()) {
                            dto.setRequestStatus(req.get().getStatus().toLowerCase());
                        }
                    }
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/similar")
    public ResponseEntity<List<CreatorDTO>> getSimilar(@PathVariable Long id) {
        // Mocking similar creators by returning others in the same niche
        return influencerRepository.findById(id)
                .map(p -> {
                    List<CreatorDTO> similar = influencerRepository.findAll().stream()
                            .filter(other -> !other.getId().equals(id) && other.getNiche().equals(p.getNiche()))
                            .limit(3)
                            .map(this::convertToDTO)
                            .collect(Collectors.toList());
                    return ResponseEntity.ok(similar);
                })
                .orElse(ResponseEntity.ok(Collections.emptyList()));
    }

    private CreatorDTO convertToDTO(InfluencerProfile profile) {
        Map<String, String> stats = new HashMap<>();
        stats.put("Followers",      profile.getFollowerCount() != null ? profile.getFollowerCount() : "--");
        stats.put("EngagementRate", profile.getEngagementRate() != null ? profile.getEngagementRate() : "--");
        stats.put("PostsMonth",     profile.getPostsPerMonth() != null ? profile.getPostsPerMonth() : "--");
        stats.put("AvgReach",       profile.getAvgReach() != null ? profile.getAvgReach() : "--");

        // Parse portfolio images from JSON array stored in the profile
        java.util.List<String> portfolio = new java.util.ArrayList<>();
        if (profile.getPortfolioImages() != null && !profile.getPortfolioImages().isBlank()) {
            boolean inStr = false;
            StringBuilder cur = new StringBuilder();
            for (char c : profile.getPortfolioImages().toCharArray()) {
                if (c == '"') {
                    if (inStr) { portfolio.add(cur.toString()); cur.setLength(0); inStr = false; }
                    else inStr = true;
                } else if (inStr) {
                    cur.append(c);
                }
            }
        }

        String avatar = profile.getUser() != null ? profile.getUser().getAvatar() : null;

        return CreatorDTO.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .name(profile.getUser() != null ? profile.getUser().getName() : "Unknown")
                .handle(profile.getHandle())
                .niche(profile.getNiche())
                .followers(profile.getFollowerCount())
                .avatar(avatar)
                .coverPhoto(profile.getCoverPhoto())
                .location(profile.getLocation())
                .bio(profile.getBio())
                .website(profile.getPortfolioUrl())
                .stats(stats)
                .portfolio(portfolio)
                .build();
    }
}
