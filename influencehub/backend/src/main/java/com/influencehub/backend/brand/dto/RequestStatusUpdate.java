package com.influencehub.backend.brand.dto;

import lombok.Data;

@Data
public class RequestStatusUpdate {
    private String status;   // accepted | rejected
    private String reason;   // reject reason (optional)
}
