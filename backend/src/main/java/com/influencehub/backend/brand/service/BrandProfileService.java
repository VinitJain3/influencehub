package com.influencehub.backend.brand.service;

import com.influencehub.backend.brand.dto.BrandProfileRequest;
import com.influencehub.backend.brand.model.BrandProfile;

public interface BrandProfileService {

    BrandProfile createProfile(Long userId, BrandProfileRequest request);
}