package com.dlass.backend.controller;

import com.dlass.backend.model.ChatMessage;
import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.ChatRepository;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.UserRepository;
import com.dlass.backend.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.dlass.backend.service.NotificationService;
import com.dlass.backend.model.NotificationType;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final ServiceProviderRepository serviceProviderRepository;
    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;

    public ChatController(ChatRepository chatRepository,
                          UserRepository userRepository,
                          ServiceProviderRepository serviceProviderRepository,
                          NotificationService notificationService,
                          JwtUtil jwtUtil) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
        this.serviceProviderRepository = serviceProviderRepository;
        this.notificationService = notificationService;
        this.jwtUtil = jwtUtil;
    }

    private User getAuthenticatedUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalStateException("Unauthorized");
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new IllegalStateException("Unauthorized");
        }

        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new IllegalStateException("Unauthorized"));
    }

    private String resolveChatUserId(String rawId) {
        if (rawId == null || rawId.isBlank()) {
            throw new IllegalArgumentException("Chat participant id is required");
        }

        if (userRepository.findById(rawId).isPresent()) {
            return rawId;
        }

        ServiceProvider provider = serviceProviderRepository.findById(rawId).orElse(null);
        if (provider != null && provider.getUserId() != null) {
            return provider.getUserId();
        }

        throw new IllegalArgumentException("Chat participant not found");
    }

    @PostMapping
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessage message, HttpServletRequest request) {
        User user;
        try {
            user = getAuthenticatedUser(request);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(401).build();
        }

        if (message == null || message.getMessage() == null || message.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        final String receiverId;
        try {
            receiverId = resolveChatUserId(message.getReceiverId());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }

        User receiver = userRepository.findById(receiverId).orElse(null);
        if (receiver == null) {
            return ResponseEntity.badRequest().build();
        }

        if (user.getId().equals(receiver.getId())) {
            return ResponseEntity.badRequest().build();
        }

        message.setSenderId(user.getId());
        message.setReceiverId(receiver.getId());
        message.setMessage(message.getMessage().trim());
        message.setCreatedAt(LocalDateTime.now());
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);
        ChatMessage saved = chatRepository.save(message);

        // Add Notification
        notificationService.createNotification(
                receiver.getId(),
                "New message from " + user.getFullName() + ": " + message.getMessage(),
                NotificationType.CHAT,
                saved.getId(),
                user.getRole().equals("USER") ? "/provider-dashboard" : "/dashboard"
        );

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{otherUserId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @PathVariable String otherUserId,
            HttpServletRequest request) {
        final User user;
        try {
            user = getAuthenticatedUser(request);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(401).build();
        }

        String myId = user.getId();
        final String resolvedOtherUserId;
        try {
            resolvedOtherUserId = resolveChatUserId(otherUserId);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }

        List<ChatMessage> messages = chatRepository.findChatHistory(myId, resolvedOtherUserId);

        User otherUser = userRepository.findById(resolvedOtherUserId).orElse(null);
        if (otherUser != null) {
            notificationService.markChatNotificationsAsReadForSender(myId, otherUser.getFullName());
        }

        return ResponseEntity.ok(messages);
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String messageId, HttpServletRequest request) {
        final User user;
        try {
            user = getAuthenticatedUser(request);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(401).build();
        }

        ChatMessage msg = chatRepository.findById(messageId).orElse(null);
        if (msg == null) {
            return ResponseEntity.notFound().build();
        }

        if (!msg.getReceiverId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        msg.setRead(true);
        chatRepository.save(msg);
        return ResponseEntity.ok().build();
    }
}
