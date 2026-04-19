package com.influencehub.backend.application.repository;

import com.influencehub.backend.application.model.CampaignApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignApplicationRepository extends JpaRepository<CampaignApplication, Long> {

    Page<CampaignApplication> findByCampaignBrandProfileId(Long brandProfileId, Pageable pageable);

    Page<CampaignApplication> findByCampaignBrandProfileIdAndStatus(Long brandProfileId, String status, Pageable pageable);

    Page<CampaignApplication> findByCampaignId(Long campaignId, Pageable pageable);

    Page<CampaignApplication> findByInfluencerProfileId(Long influencerProfileId, Pageable pageable);

    Page<CampaignApplication> findByInfluencerProfileIdAndStatus(Long influencerProfileId, String status, Pageable pageable);

    long countByCampaignId(Long campaignId);

    long countByCampaignIdAndStatus(Long campaignId, String status);

    boolean existsByCampaignIdAndInfluencerProfileId(Long campaignId, Long influencerProfileId);
}
