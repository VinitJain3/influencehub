package com.influencehub.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class CreatorDTO {
    private Long id;
    private Long userId;
    private String name;
    private String handle;
    private String niche;
    private String followers;
    private String avatar;
    private String coverPhoto;
    private String location;
    private String bio;
    private String website;
    private Map<String, String> stats;
    private List<String> portfolio;
    private String requestStatus;
}
