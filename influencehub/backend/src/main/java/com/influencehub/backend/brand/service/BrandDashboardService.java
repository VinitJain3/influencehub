package com.influencehub.backend.brand.service;

import com.influencehub.backend.brand.dto.BrandDashboardResponse;

public interface BrandDashboardService {
    BrandDashboardResponse getDashboard(String email);
}
