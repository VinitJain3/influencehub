package com.influencehub.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User recipient;

    private String type; // campaign, request, message, system
    private String text;
    private String link;
    private boolean isRead = false;
    private LocalDateTime timestamp = LocalDateTime.now();
}
