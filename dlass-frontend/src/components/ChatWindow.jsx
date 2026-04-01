import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getToken } from "../services/authService";

const API = "http://localhost:8080/api";

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

export default function ChatWindow({ isOpen, onClose, currentUser, otherUserId, otherUserName, isMaximized, onToggleMaximize }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !otherUserId) return;

    let isSubscribed = true;

    const fetchMessages = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found for chat");
        return;
      }
      if (!otherUserId) return;

      console.log("Chat token:", token);

      try {
        const url = `${API}/chat/${otherUserId}`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (isSubscribed && res.data) {
          setMessages(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(res.data)) {
              setTimeout(scrollToBottom, 50);
              return res.data;
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Chat fetch error:", err);
      }
    };

    fetchMessages(); // initial load

    const interval = setInterval(() => {
      if (isSubscribed) fetchMessages();
    }, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [isOpen, otherUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found for chat");
      return;
    }
    if (!newMessage.trim() || !otherUserId) return;

    const msgData = {
      senderId: currentUser.id,
      receiverId: otherUserId,
      message: newMessage.trim(),
    };

    try {
      setNewMessage(""); // Optimistic clear
      const tempMsg = { ...msgData, id: Date.now().toString(), createdAt: new Date().toISOString() };
      setMessages(prev => [...prev, tempMsg]);
      setTimeout(scrollToBottom, 50);
      
      await axios.post(`${API}/chat`, msgData, {
        headers: { Authorization: `Bearer ${token}` }
      });

    } catch (err) {
      console.error("Send error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed z-[100] bg-glassBg backdrop-blur-xl border-glassBorder flex flex-col overflow-hidden animate-fade-in transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
      isMaximized
        ? 'top-[88px] bottom-0 right-0 w-1/2 rounded-none rounded-tl-3xl border-l border-t shadow-[-20px_0_40px_rgba(0,0,0,0.1)]'
        : 'bottom-6 right-6 w-80 md:w-96 rounded-2xl border shadow-2xl h-[500px]'
    }`}>
      {/* Header */}
      <div className="bg-black/10 dark:bg-white/10 px-4 py-3 flex items-center justify-between border-b border-glassBorder">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">
            {otherUserName?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <h3 className="font-headline font-bold text-textPrimary text-sm">{otherUserName || "Chat"}</h3>
            <span className="text-[10px] text-green-400 font-bold tracking-wider">ONLINE</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onToggleMaximize && (
            <button onClick={onToggleMaximize} className="p-1.5 rounded-full hover:bg-black/15 dark:hover:bg-white/15 transition-colors text-textSecondary hover:text-textPrimary" title={isMaximized ? "Minimize" : "Maximize"}>
              <span className="material-symbols-outlined text-lg">{isMaximized ? 'close_fullscreen' : 'open_in_full'}</span>
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/15 dark:hover:bg-white/15 transition-colors text-coral hover:text-red-400">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/5 dark:bg-white/5"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-textSecondary/50">
            <span className="material-symbols-outlined text-4xl mb-2">forum</span>
            <p className="text-xs font-bold text-center">No messages yet.<br/>Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id || i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 text-sm shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                    isMe 
                      ? "bg-gradient-to-br from-coral to-rose-400 text-white rounded-2xl rounded-br-sm" 
                      : "bg-black/10 dark:bg-white/10 text-textPrimary border border-glassBorder rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {msg.message}
                </div>
                <span className="text-[10px] text-textSecondary/50 mt-1 font-mono">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-black/10 dark:bg-white/10 border-t border-glassBorder flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-inputBg border border-inputBorder text-textPrimary rounded-full px-4 py-2 text-sm focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all placeholder:text-textSecondary/50"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white hover:scale-[1.05] hover:brightness-110 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </form>
    </div>
  );
}
