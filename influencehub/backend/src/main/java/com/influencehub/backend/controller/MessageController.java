package com.influencehub.backend.controller;

import com.influencehub.backend.config.JwtUtil;
import com.influencehub.backend.dto.ConversationResponse;
import com.influencehub.backend.dto.MessageResponse;
import com.influencehub.backend.model.Conversation;
import com.influencehub.backend.model.Message;
import com.influencehub.backend.model.User;
import com.influencehub.backend.repository.ConversationRepository;
import com.influencehub.backend.repository.MessageRepository;
import com.influencehub.backend.repository.UserRepository;
import com.influencehub.backend.brand.repository.BrandProfileRepository;
import com.influencehub.backend.influencer.repository.InfluencerProfileRepository;
import com.influencehub.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/conversations")
public class MessageController {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BrandProfileRepository brandProfileRepository;

    @Autowired
    private InfluencerProfileRepository influencerProfileRepository;

    @Autowired
    private NotificationService notificationService;

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
    public ResponseEntity<?> getConversations(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = getCurrentUser(authHeader);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        List<Conversation> conversations = conversationRepository.findAllByParticipant(user);
        List<ConversationResponse> responses = conversations.stream().map(c -> {
            User other = c.getUser1().getId().equals(user.getId()) ? c.getUser2() : c.getUser1();
            return ConversationResponse.builder()
                    .id(c.getId())
                    .name(other.getName())
                    .avatar(null)
                    .lastMessage(c.getLastMessage())
                    .lastTime(c.getLastTimestamp() != null ? c.getLastTimestamp().toString() : "")
                    .unread(0)
                    .role(other.getRole())
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<?> createConversation(@RequestBody Map<String, Long> body, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = getCurrentUser(authHeader);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        Long otherUserId = body.get("otherUserId");
        if (otherUserId == null) return ResponseEntity.badRequest().body("otherUserId is required");

        Optional<User> otherOpt = userRepository.findById(otherUserId);
        if (otherOpt.isEmpty()) return ResponseEntity.notFound().build();
        User other = otherOpt.get();

        Optional<Conversation> existing = conversationRepository.findBetweenUsers(user, other);
        if (existing.isPresent()) {
            return ResponseEntity.ok(existing.get());
        }

        Conversation conv = new Conversation();
        conv.setUser1(user);
        conv.setUser2(other);
        conversationRepository.save(conv);

        return ResponseEntity.ok(conv);
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = getCurrentUser(authHeader);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        Optional<Conversation> convOpt = conversationRepository.findById(id);
        if (convOpt.isEmpty()) return ResponseEntity.notFound().build();

        Conversation conv = convOpt.get();
        if (!conv.getUser1().getId().equals(user.getId()) && !conv.getUser2().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        List<Message> messages = messageRepository.findAllByConversationOrderByTimestampAsc(conv);
        List<MessageResponse> responses = messages.stream().map(m -> MessageResponse.builder()
                .id(m.getId())
                .sender(m.getSender().getId().equals(user.getId()) ? "me" : "other")
                .text(m.getText())
                .time(m.getTimestamp())
                .build()).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable Long id, @RequestBody Map<String, String> body, @RequestHeader(value = "Authorization", required = false) String authHeader) {
        User user = getCurrentUser(authHeader);
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        Optional<Conversation> convOpt = conversationRepository.findById(id);
        if (convOpt.isEmpty()) return ResponseEntity.notFound().build();

        Conversation conv = convOpt.get();
        if (!conv.getUser1().getId().equals(user.getId()) && !conv.getUser2().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        String text = body.get("text");
        if (text == null || text.isBlank()) return ResponseEntity.badRequest().build();

        Message msg = new Message();
        msg.setConversation(conv);
        msg.setSender(user);
        msg.setText(text);
        msg.setTimestamp(LocalDateTime.now());
        messageRepository.save(msg);

        conv.setLastMessage(text);
        conv.setLastTimestamp(LocalDateTime.now());
        conversationRepository.save(conv);

        // Notify recipient
        User recipient = conv.getUser1().getId().equals(user.getId()) ? conv.getUser2() : conv.getUser1();
        notificationService.notify(recipient, "message", "New message from " + user.getName(), "/messages?conversationId=" + conv.getId());

        return ResponseEntity.ok(MessageResponse.builder()
                .id(msg.getId())
                .sender("me")
                .text(msg.getText())
                .time(msg.getTimestamp())
                .build());
    }
}
