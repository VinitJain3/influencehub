package com.influencehub.backend.influencer.repository;

import com.influencehub.backend.influencer.model.InfluencerProfile;
import com.influencehub.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InfluencerProfileRepository extends JpaRepository<InfluencerProfile, Long> {

    Optional<InfluencerProfile> findByUserId(Long userId);

    Optional<InfluencerProfile> findByUser(User user);

    Optional<InfluencerProfile> findByUser_Email(String email);

    List<InfluencerProfile> findTop4ByOrderByFollowerCountDesc();

    Page<InfluencerProfile> findAll(Pageable pageable);
}
