package com.influencehub.backend.brand.dto;

import lombok.Data;

@Data
public class RequestResponse {
    private Long id;
    private Long creatorId;
    private String creatorName;
    private String creatorNiche;
    private String campaignTitle;
    private Long campaignId;
    private String message;
    private String proposedRate;
    private String date;
    private String status;
}
