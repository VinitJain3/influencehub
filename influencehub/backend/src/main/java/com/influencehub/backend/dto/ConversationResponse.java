package com.influencehub.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ConversationResponse {
    private Long id;
    private String name;
    private String avatar;
    private String lastMessage;
    private String lastTime;
    private int unread;
    private String role;
}
