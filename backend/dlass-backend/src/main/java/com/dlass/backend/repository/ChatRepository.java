package com.dlass.backend.repository;

import com.dlass.backend.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatRepository extends MongoRepository<ChatMessage, String> {

    @Query(value = "{ $or: [ { 'senderId': ?0, 'receiverId': ?1 }, { 'senderId': ?1, 'receiverId': ?0 } ] }", sort = "{ 'createdAt': 1 }")
    List<ChatMessage> findChatHistory(String user1, String user2);

    @Query(value = "{ $or: [ { 'senderId': ?0, 'receiverId': ?1 }, { 'senderId': ?1, 'receiverId': ?0 } ], 'createdAt': { $gt: ?2 } }", sort = "{ 'createdAt': 1 }")
    List<ChatMessage> findNewMessages(String user1, String user2, LocalDateTime since);

}
