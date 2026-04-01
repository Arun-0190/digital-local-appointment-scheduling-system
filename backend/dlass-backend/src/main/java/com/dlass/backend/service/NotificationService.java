package com.dlass.backend.service;

import com.dlass.backend.model.Notification;
import com.dlass.backend.model.NotificationType;
import com.dlass.backend.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(String userId, String message, NotificationType type, String referenceId, String redirectUrl) {
        Notification notification = new Notification(userId, message, type, referenceId, redirectUrl);
        return notificationRepository.save(notification);
    }

    public Page<Notification> getUserNotifications(String userId, NotificationType type, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        
        if (type != null) {
            return notificationRepository.findByUserIdAndType(userId, type, pageRequest);
        }
        return notificationRepository.findByUserId(userId, pageRequest);
    }

    public Notification markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndReadFalse(userId);
        if (!unreadNotifications.isEmpty()) {
            unreadNotifications.forEach(n -> n.setRead(true));
            notificationRepository.saveAll(unreadNotifications);
        }
    }

    public void markChatNotificationsAsReadForSender(String userId, String senderName) {
        List<Notification> notifications = notificationRepository.findByUserIdAndTypeAndReadFalse(userId, NotificationType.CHAT);
        boolean changed = false;
        for (Notification n : notifications) {
            if (n.getMessage().contains("from " + senderName + ":")) {
                n.setRead(true);
                changed = true;
            }
        }
        if (changed) {
            notificationRepository.saveAll(notifications);
        }
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }
}
