package com.influencehub.backend.brand.repository;

import com.influencehub.backend.brand.model.Campaign;
import com.influencehub.backend.brand.model.CollaborationRequest;
import com.influencehub.backend.influencer.model.InfluencerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CollaborationRequestRepository extends JpaRepository<CollaborationRequest, Long> {

    // Brand side — all requests for brand's campaigns
    @Query("SELECT r FROM CollaborationRequest r WHERE r.campaign.brandProfile.id = :brandProfileId")
    Page<CollaborationRequest> findByBrandProfileId(Long brandProfileId, Pageable pageable);

    @Query("SELECT r FROM CollaborationRequest r WHERE r.campaign.brandProfile.id = :brandProfileId AND r.status = :status")
    Page<CollaborationRequest> findByBrandProfileIdAndStatus(Long brandProfileId, String status, Pageable pageable);

    @Query("SELECT r FROM CollaborationRequest r WHERE r.campaign.brandProfile.id = :brandProfileId AND r.campaign.id = :campaignId")
    Page<CollaborationRequest> findByBrandProfileIdAndCampaignId(Long brandProfileId, Long campaignId, Pageable pageable);

    @Query("SELECT r FROM CollaborationRequest r WHERE r.campaign.brandProfile.id = :brandProfileId AND r.campaign.id = :campaignId AND r.status = :status")
    Page<CollaborationRequest> findByBrandProfileIdAndCampaignIdAndStatus(Long brandProfileId, Long campaignId, String status, Pageable pageable);

    // Counts for dashboard stats
    @Query("SELECT COUNT(r) FROM CollaborationRequest r WHERE r.campaign.brandProfile.id = :brandProfileId AND r.status = 'pending'")
    long countPendingByBrandProfileId(Long brandProfileId);

    @Query("SELECT COUNT(r) FROM CollaborationRequest r WHERE r.campaign.brandProfile.id = :brandProfileId AND r.status = 'accepted'")
    long countAcceptedByBrandProfileId(Long brandProfileId);

    @Query("SELECT COUNT(DISTINCT r.influencerProfile.id) FROM CollaborationRequest r WHERE r.campaign.brandProfile.id = :brandProfileId")
    long countDistinctCreatorsByBrandProfileId(Long brandProfileId);

    // Recent requests for dashboard
    @Query("SELECT r FROM CollaborationRequest r WHERE r.campaign.brandProfile.id = :brandProfileId ORDER BY r.createdAt DESC")
    List<CollaborationRequest> findTop5ByBrandProfileIdOrderByCreatedAtDesc(Long brandProfileId, Pageable pageable);

    // Influencer side
    Page<CollaborationRequest> findByInfluencerProfile(InfluencerProfile influencerProfile, Pageable pageable);

    Page<CollaborationRequest> findByInfluencerProfileAndStatus(InfluencerProfile influencerProfile, String status, Pageable pageable);

    List<CollaborationRequest> findTop5ByInfluencerProfileOrderByCreatedAtDesc(InfluencerProfile influencerProfile);

    boolean existsByCampaignAndInfluencerProfile(Campaign campaign, InfluencerProfile influencerProfile);

    long countByInfluencerProfileAndStatus(InfluencerProfile influencerProfile, String status);
}
