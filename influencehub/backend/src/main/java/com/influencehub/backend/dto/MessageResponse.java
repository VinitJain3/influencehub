package com.influencehub.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {
    private Long id;
    private String sender; // "me" or "other"
    private String text;
    private LocalDateTime time;
}
