package com.influencehub.backend.repository;

import com.influencehub.backend.model.CollaborationRequest;
import com.influencehub.backend.model.User;
import com.influencehub.backend.brand.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CollaborationRequestRepository extends JpaRepository<CollaborationRequest, Long> {
    List<CollaborationRequest> findAllByBrand(User brand);
    List<CollaborationRequest> findAllByCreator(User creator);
    List<CollaborationRequest> findAllByCampaign(Campaign campaign);
    long countByCampaign(Campaign campaign);
}
