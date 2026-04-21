package com.influencehub.backend.brand.controller;

import com.influencehub.backend.brand.dto.CampaignRequest;
import com.influencehub.backend.brand.dto.CampaignResponse;
import com.influencehub.backend.brand.service.CampaignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class CampaignController {

    @Autowired
    private CampaignService campaignService;

    @GetMapping("/brand/campaigns")
    public ResponseEntity<Map<String, Object>> getBrandCampaigns(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(campaignService.getBrandCampaigns(email, status, page));
    }

    @PostMapping("/campaigns")
    public ResponseEntity<CampaignResponse> createCampaign(@RequestBody CampaignRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(campaignService.createCampaign(email, request));
    }

    @GetMapping("/campaigns/{id}")
    public ResponseEntity<CampaignResponse> getCampaign(@PathVariable Long id) {
        String email = null;
        if (SecurityContextHolder.getContext().getAuthentication() != null &&
            !SecurityContextHolder.getContext().getAuthentication().getName().equals("anonymousUser")) {
            email = SecurityContextHolder.getContext().getAuthentication().getName();
        }
        return ResponseEntity.ok(campaignService.getCampaignById(id, email));
    }

    @PutMapping("/campaigns/{id}")
    public ResponseEntity<CampaignResponse> updateCampaign(@PathVariable Long id, @RequestBody CampaignRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(campaignService.updateCampaign(id, email, request));
    }

    @PutMapping("/campaigns/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        campaignService.updateStatus(id, email, body.get("status"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/campaigns/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        campaignService.deleteCampaign(id, email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/campaigns/{id}/duplicate")
    public ResponseEntity<CampaignResponse> duplicateCampaign(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(campaignService.duplicateCampaign(id, email));
    }
}
