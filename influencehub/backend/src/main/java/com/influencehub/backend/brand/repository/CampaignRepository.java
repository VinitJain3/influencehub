package com.influencehub.backend.brand.repository;

import com.influencehub.backend.brand.model.Campaign;
import com.influencehub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    List<Campaign> findAllByBrand(User brand);
    List<Campaign> findAllByBrandAndStatus(User brand, String status);
}
