package com.influencehub.backend.brand.repository;

import com.influencehub.backend.brand.model.Campaign;
import com.influencehub.backend.brand.model.BrandProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    Page<Campaign> findByBrandProfile(BrandProfile brandProfile, Pageable pageable);

    Page<Campaign> findByBrandProfileAndStatus(BrandProfile brandProfile, String status, Pageable pageable);

    List<Campaign> findByBrandProfileAndStatus(BrandProfile brandProfile, String status);

    long countByBrandProfile(BrandProfile brandProfile);

    long countByBrandProfileAndStatus(BrandProfile brandProfile, String status);

    // For influencer browse campaigns — public active ones
    Page<Campaign> findByStatusAndVisibility(String status, String visibility, Pageable pageable);

    // Matching by industry / niche for influencer dashboard
    List<Campaign> findTop6ByStatusAndVisibilityOrderByCreatedAtDesc(String status, String visibility);

    @Query("SELECT DISTINCT c.industry FROM Campaign c WHERE c.status = 'active'")
    List<String> findDistinctActiveIndustries();
}
