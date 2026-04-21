package com.influencehub.backend.brand.controller;

import com.influencehub.backend.brand.dto.BrandDashboardResponse;
import com.influencehub.backend.brand.service.BrandDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/brand")
public class BrandDashboardController {

    @Autowired
    private BrandDashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<BrandDashboardResponse> getDashboard() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(dashboardService.getDashboard(email));
    }
}
