package com.influencehub.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String type;
    private String text;
    private String time;
    private boolean read;
    private String link;
}
