import React, { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import NotificationPanel from "./NotificationPanel";
import { notificationService } from "../services/notificationService";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread notifications count", err);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    // Polling every 20 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inline-block">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-500 hover:text-blue-500 hover:bg-black/5 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-white/5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        aria-label="Notifications"
      >
        <FaBell size={20} className={unreadCount > 0 ? "animate-pulse" : ""} />
        
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.7)]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <NotificationPanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        unreadCount={unreadCount}
        onNotificationsUpdated={fetchUnreadCount}
      />
    </div>
  );
}
