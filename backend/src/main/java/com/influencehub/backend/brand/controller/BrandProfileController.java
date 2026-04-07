package com.influencehub.backend.brand.controller;

import com.influencehub.backend.brand.dto.BrandProfileRequest;
import com.influencehub.backend.brand.model.BrandProfile;
import com.influencehub.backend.brand.service.BrandProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/brand")
public class BrandProfileController {

    @Autowired
    private BrandProfileService brandService;

    @PostMapping("/profile/{userId}")
    public BrandProfile createProfile(
            @PathVariable Long userId,
            @Valid @RequestBody BrandProfileRequest request
    ) {
        return brandService.createProfile(userId, request);
    }
}