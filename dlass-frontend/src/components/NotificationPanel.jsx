import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../services/notificationService";

const FILTERS = ["ALL", "APPOINTMENT", "CHAT", "ADMIN", "SYSTEM", "REVIEW", "REPORT"];

export default function NotificationPanel({ isOpen, onClose, unreadCount, onNotificationsUpdated }) {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, activeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(activeFilter, 0, 20);
      setNotifications(data.content || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      onNotificationsUpdated();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        fetchNotifications();
        onNotificationsUpdated();
      } catch (err) {
        console.error("Failed to mark read", err);
      }
    }
    
    if (notification.redirectUrl) {
      navigate(notification.redirectUrl);
      onClose();
    } else {
      // Fallback redirects
      const role = localStorage.getItem("role");
      let path = "/dashboard";
      if (role === "PROVIDER") path = "/provider/dashboard";
      if (role === "ADMIN") path = "/admin/dashboard";
      navigate(path);
      onClose();
    }
  };

  const timeSince = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " yo";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " m";
    return Math.floor(seconds) + " s";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[99]" onClick={onClose} />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-14 w-80 sm:w-96 z-[100] bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/5">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 uppercase tracking-wider text-sm">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex overflow-x-auto no-scrollbar border-b border-white/10 bg-black/5 px-2 py-2 gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1 pb-[0.2rem] whitespace-nowrap rounded-full text-xs font-medium transition-all ${
                    activeFilter === f 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30" 
                      : "bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-white/20"
                  }`}
                >
                  {f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="max-h-[60vh] overflow-y-auto w-full flex-grow p-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                  No notifications found
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      whileHover={{ x: 4, transition: { duration: 0.2 } }}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 rounded-xl cursor-pointer flex gap-3 group transition-all duration-300
                        ${!n.isRead ? "bg-indigo-50/50 dark:bg-indigo-900/20" : "hover:bg-black/5 dark:hover:bg-white/5"}
                      `}
                    >
                      <div className="flex flex-col gap-1 flex-grow">
                        <div className="flex justify-between items-start">
                          <span className={`text-xs font-semibold ${!n.isRead ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"}`}>
                            {n.type}
                          </span>
                          <span className="text-xs text-textSecondary uppercase tracking-tighter opacity-60">
                            {timeSince(n.createdAt)}
                          </span>
                        </div>
                        <p className={`text-sm ${!n.isRead ? "font-semibold text-textPrimary" : "text-textSecondary"}`}>
                          {n.message}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="flex-shrink-0 flex items-center justify-center pt-2">
                          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
