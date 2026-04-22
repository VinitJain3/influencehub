package com.influencehub.backend.repository;

import com.influencehub.backend.model.CollaborationRequest;
import com.influencehub.backend.model.User;
import com.influencehub.backend.brand.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CollaborationRequestRepository extends JpaRepository<CollaborationRequest, Long> {
    List<CollaborationRequest> findAllByBrand(User brand);
    List<CollaborationRequest> findAllByCreator(User creator);
    List<CollaborationRequest> findAllByCampaign(Campaign campaign);
    long countByCampaign(Campaign campaign);

    /**
     * Check if an ACCEPTED request exists between two users in either direction.
     * Used by MessageController to enforce: messaging allowed only after acceptance.
     */
    @Query("SELECT COUNT(r) > 0 FROM CollaborationRequest r WHERE r.status = 'ACCEPTED' AND " +
           "((r.brand = :u1 AND r.creator = :u2) OR (r.brand = :u2 AND r.creator = :u1))")
    boolean existsAcceptedBetween(@Param("u1") User u1, @Param("u2") User u2);
}

