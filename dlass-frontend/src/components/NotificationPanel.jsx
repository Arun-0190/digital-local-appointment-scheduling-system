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
            initial={{ opacity: 0, scale: 0.95, y: -10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: -10, filter: 'blur(10px)' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-14 w-80 sm:w-96 z-[100] bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h3 className="text-base font-headline font-black text-white uppercase tracking-widest">
                  Notifications
                </h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">
                  {unreadCount} UNREAD MESSAGES
                </p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex overflow-x-auto no-scrollbar border-b border-white/5 bg-white/[0.01] px-4 py-3 gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 whitespace-nowrap rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeFilter === f 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                      : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="max-h-[500px] overflow-y-auto w-full flex-grow p-3 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Synchronizing...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20 group">
                  <span className="material-symbols-outlined text-6xl group-hover:scale-110 transition-transform duration-500">notifications_off</span>
                  <p className="text-xs font-bold uppercase tracking-widest mt-4">All caught up!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 rounded-2xl cursor-pointer flex gap-4 transition-all duration-300 border border-transparent
                        ${!n.isRead ? "bg-indigo-600/5 border-indigo-500/10" : "hover:border-white/5"}
                      `}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner
                         ${n.type === 'CHAT' ? 'bg-emerald-500/10 text-emerald-500' : 
                           n.type === 'APPOINTMENT' ? 'bg-amber-500/10 text-amber-500' : 
                           'bg-indigo-500/10 text-indigo-500'}
                      `}>
                        <span className="material-symbols-outlined text-xl">
                          {n.type === 'CHAT' ? 'chat_bubble' : n.type === 'APPOINTMENT' ? 'event' : 'notifications'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-1 flex-grow">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                            {n.type}
                          </span>
                          <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">
                            {timeSince(n.createdAt)} ago
                          </span>
                        </div>
                        <p className={`text-sm leading-snug ${!n.isRead ? "font-bold text-white" : "text-gray-400 font-medium"}`}>
                          {n.message}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="flex-shrink-0 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-white/[0.01] border-t border-white/5 text-center">
               <button onClick={onClose} className="text-[10px] font-black text-gray-600 hover:text-gray-400 uppercase tracking-[0.2em] transition-colors">
                  Close Panel
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
