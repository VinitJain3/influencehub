package com.influencehub.backend.influencer.controller;

import com.influencehub.backend.influencer.service.InfluencerProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/creators")
public class InfluencerProfileController {

    @Autowired
    private InfluencerProfileService profileService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCreators(
            @RequestParam Map<String, Object> filters,
            @RequestParam(defaultValue = "relevance") String sort,
            @RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(profileService.getCreators(filters, sort, page));
    }
}
