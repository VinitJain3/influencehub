package com.influencehub.backend.influencer.controller;

import com.influencehub.backend.influencer.dto.InfluencerDashboardResponse;
import com.influencehub.backend.influencer.service.InfluencerDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/influencer")
public class InfluencerDashboardController {

    @Autowired
    private InfluencerDashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<InfluencerDashboardResponse> getDashboard() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(dashboardService.getDashboard(email));
    }
}
