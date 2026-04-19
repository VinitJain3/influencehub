package com.influencehub.backend.influencer.service;

import com.influencehub.backend.influencer.model.InfluencerProfile;
import com.influencehub.backend.influencer.repository.InfluencerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InfluencerProfileServiceImpl implements InfluencerProfileService {

    @Autowired
    private InfluencerProfileRepository profileRepository;

    @Override
    public Map<String, Object> getCreators(Map<String, Object> filters, String sort, int page) {
        // Simple search logic, ignoring pagination for now. In real app we'd build a Specification/Querydsl
        String niche = null;
        if(filters.containsKey("niches") && filters.get("niches") != null) {
            List<String> niches = (List<String>) filters.get("niches");
            if(!niches.isEmpty()) niche = niches.get(0); // Taking first for simplicity
        }
        
        String platform = null;
        if(filters.containsKey("platforms") && filters.get("platforms") != null) {
            List<String> platforms = (List<String>) filters.get("platforms");
            if(!platforms.isEmpty()) platform = platforms.get(0); // Taking first for simplicity
        }

        List<InfluencerProfile> allProfiles = profileRepository.findWithFilters(niche, platform);

        List<Map<String, Object>> formatted = allProfiles.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("name", p.getUser().getName());
            map.put("handle", p.getHandle());
            map.put("niche", p.getNiche());
            map.put("verified", p.getVerified());
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> res = new HashMap<>();
        res.put("creators", formatted); // Pagination logic is skipped in this demo implementation
        res.put("total", formatted.size());
        return res;
    }
}
