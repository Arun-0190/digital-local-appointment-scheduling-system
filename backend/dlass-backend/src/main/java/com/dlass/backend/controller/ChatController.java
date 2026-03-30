package com.dlass.backend.controller;

import com.dlass.backend.model.ChatMessage;
import com.dlass.backend.model.User;
import com.dlass.backend.repository.ChatRepository;
import com.dlass.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;

    public ChatController(ChatRepository chatRepository, UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessage message, Authentication authentication) {
        User user = userRepository.findByEmailAndIsActiveTrue(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getId().equals(message.getSenderId())) {
            return ResponseEntity.status(403).build();
        }

        message.setCreatedAt(LocalDateTime.now());
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);
        ChatMessage saved = chatRepository.save(message);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{otherUserId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @PathVariable String otherUserId,
            @RequestParam(required = false) String since,
            Authentication authentication) {

        User user = userRepository.findByEmailAndIsActiveTrue(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String myId = user.getId();

        List<ChatMessage> messages;
        if (since != null && !since.trim().isEmpty()) {
            LocalDateTime sinceTime = LocalDateTime.parse(since);
            messages = chatRepository.findNewMessages(myId, otherUserId, sinceTime);
        } else {
            messages = chatRepository.findChatHistory(myId, otherUserId);
        }

        return ResponseEntity.ok(messages);
    }

    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String messageId, Authentication authentication) {
        ChatMessage msg = chatRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        User user = userRepository.findByEmailAndIsActiveTrue(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!msg.getReceiverId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        msg.setRead(true);
        chatRepository.save(msg);
        return ResponseEntity.ok().build();
    }
}
