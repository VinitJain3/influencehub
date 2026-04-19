package com.influencehub.backend.campaign.repository;

import com.influencehub.backend.campaign.model.Campaign;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    Page<Campaign> findByBrandProfileId(Long brandProfileId, Pageable pageable);

    Page<Campaign> findByBrandProfileIdAndStatus(Long brandProfileId, String status, Pageable pageable);

    @Query("SELECT c FROM Campaign c WHERE c.visibility = 'Public' AND c.status = 'active' AND " +
           "(:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:industry IS NULL OR c.industry = :industry)")
    Page<Campaign> findPublicCampaigns(@Param("search") String search,
                                       @Param("industry") String industry,
                                       Pageable pageable);

    long countByBrandProfileId(Long brandProfileId);
}
