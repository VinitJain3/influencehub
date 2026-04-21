package com.influencehub.backend.controller;

import com.influencehub.backend.dto.CreatorDTO;
import com.influencehub.backend.dto.CreatorListResponse;
import com.influencehub.backend.influencer.model.InfluencerProfile;
import com.influencehub.backend.influencer.repository.InfluencerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping
    public ResponseEntity<CreatorListResponse> getCreators(
            @RequestParam(required = false) List<String> niches,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "1") int page) {
        // For now, simplicity: return all, filtered by niche if provided
        List<InfluencerProfile> profiles = (niches != null && !niches.isEmpty())
                ? influencerRepository.findAll().stream()
                        .filter(p -> niches.contains(p.getNiche()))
                        .collect(Collectors.toList())
                : influencerRepository.findAll();

        List<CreatorDTO> dtos = profiles.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new CreatorListResponse(dtos, dtos.size()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CreatorDTO> getCreator(@PathVariable Long id) {
        return influencerRepository.findById(id)
                .map(p -> ResponseEntity.ok(convertToDTO(p)))
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
        stats.put("TotalFollowers", profile.getFollowerCount());
        stats.put("AvgEngagement", profile.getEngagementRate());
        stats.put("PostsMonth", "12"); // Mock
        stats.put("AvgReach", "50K"); // Mock

        return CreatorDTO.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .name(profile.getUser() != null ? profile.getUser().getName() : "Unknown")
                .handle(profile.getHandle())
                .niche(profile.getNiche())
                .followers(profile.getFollowerCount())
                .avatar(null) // Mock avatar
                .location(profile.getLocation())
                .bio(profile.getBio())
                .website(profile.getPortfolioUrl())
                .stats(stats)
                .portfolio(Collections.emptyList()) // Mock
                .build();
    }
}
