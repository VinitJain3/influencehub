package com.influencehub.backend.controller;

import com.influencehub.backend.config.JwtUtil;
import com.influencehub.backend.dto.NotificationResponse;
import com.influencehub.backend.model.Notification;
import com.influencehub.backend.model.User;
import com.influencehub.backend.repository.NotificationRepository;
import com.influencehub.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private User getCurrentUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        if (jwtUtil.validateToken(token)) {
            String email = jwtUtil.extractUsername(token);
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestParam(required = false) String type,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = getCurrentUser(authHeader);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        List<Notification> notifications = (type != null && !type.equals("all"))
                ? notificationRepository.findAllByRecipientAndTypeOrderByTimestampDesc(user, type)
                : notificationRepository.findAllByRecipientOrderByTimestampDesc(user);

        List<NotificationResponse> responses = notifications.stream().map(n -> NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .text(n.getText())
                .time(n.getTimestamp().toString())
                .read(n.isRead())
                .link(n.getLink())
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllRead(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = getCurrentUser(authHeader);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        List<Notification> unread = notificationRepository.findAllByRecipientOrderByTimestampDesc(user)
                .stream().filter(n -> !n.isRead()).collect(Collectors.toList());
        
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = getCurrentUser(authHeader);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        Optional<Notification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isPresent()) {
            Notification n = notifOpt.get();
            if (n.getRecipient().getId().equals(user.getId())) {
                n.setRead(true);
                notificationRepository.save(n);
                return ResponseEntity.ok().build();
            }
        }
        return ResponseEntity.notFound().build();
    }
}
