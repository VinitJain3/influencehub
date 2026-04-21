package com.influencehub.backend.brand.controller;

import com.influencehub.backend.influencer.model.InfluencerProfile;
import com.influencehub.backend.influencer.repository.InfluencerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/creators")
public class CreatorDiscoveryController {

    @Autowired
    private InfluencerProfileRepository influencerRepo;

    @GetMapping
    public ResponseEntity<Map<String, Object>> discoverCreators(
            @RequestParam(defaultValue = "1") int page) {
        Page<InfluencerProfile> pagedResult = influencerRepo.findAll(PageRequest.of(page - 1, 10));
        
        List<Map<String, Object>> creators = pagedResult.getContent().stream().map(c -> Map.<String, Object>of(
                "id", c.getId(),
                "name", c.getUser() != null ? c.getUser().getName() : "Creator",
                "handle", c.getHandle() != null ? c.getHandle() : "",
                "followerCount", c.getFollowerCount() != null ? c.getFollowerCount() : "0",
                "engagementRate", c.getEngagementRate() != null ? c.getEngagementRate() : "0%",
                "niche", c.getNiche() != null ? c.getNiche() : "",
                "location", c.getLocation() != null ? c.getLocation() : "",
                "primaryPlatform", c.getPrimaryPlatform() != null ? c.getPrimaryPlatform() : ""
        )).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "creators", creators,
                "total", pagedResult.getTotalElements()
        ));
    }
}
