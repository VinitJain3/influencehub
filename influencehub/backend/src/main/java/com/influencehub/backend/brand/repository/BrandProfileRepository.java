package com.influencehub.backend.brand.repository;

import com.influencehub.backend.brand.model.BrandProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BrandProfileRepository extends JpaRepository<BrandProfile, Long> {

    Optional<BrandProfile> findByUserId(Long userId);
    
    Optional<BrandProfile> findByUser(com.influencehub.backend.model.User user);
}