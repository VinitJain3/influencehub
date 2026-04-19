package com.influencehub.backend.influencer.repository;

import com.influencehub.backend.influencer.model.InfluencerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InfluencerProfileRepository extends JpaRepository<InfluencerProfile, Long> {
    Optional<InfluencerProfile> findByUserId(Long userId);

    @Query("SELECT i FROM InfluencerProfile i WHERE " +
           "(:niche IS NULL OR i.niche = :niche) AND " +
           "(:platform IS NULL OR i.primaryPlatform = :platform OR i.otherPlatforms LIKE %:platform%)")
    List<InfluencerProfile> findWithFilters(@Param("niche") String niche, @Param("platform") String platform);
}
