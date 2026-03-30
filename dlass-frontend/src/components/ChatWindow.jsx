import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getToken } from "../services/authService";

const API = "http://localhost:8080/api";

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

export default function ChatWindow({ isOpen, onClose, currentUser, otherUserId, otherUserName }) {
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
    <div className="fixed bottom-6 right-6 z-[100] w-80 md:w-96 glass-card rounded-2xl shadow-2xl flex flex-col border border-outline-variant/30 overflow-hidden animate-fade-in" style={{ height: "500px" }}>
      {/* Header */}
      <div className="bg-surface-container-high px-4 py-3 flex items-center justify-between border-b border-outline-variant/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">
            {otherUserName?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <h3 className="font-headline font-bold text-on-surface text-sm">{otherUserName || "Chat"}</h3>
            <span className="text-[10px] text-green-400 font-bold tracking-wider">ONLINE</span>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-highest transition-colors text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container/30"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-on-surface-variant/50">
            <span className="material-symbols-outlined text-4xl mb-2">forum</span>
            <p className="text-xs font-bold text-center">No messages yet.<br/>Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id || i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div 
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-md ${
                    isMe 
                      ? "bg-gradient-to-br from-primary to-secondary text-white rounded-tr-sm" 
                      : "bg-surface-container-highest text-on-surface border border-outline-variant/10 rounded-tl-sm"
                  }`}
                >
                  {msg.message}
                </div>
                <span className="text-[10px] text-on-surface-variant/50 mt-1 font-mono">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-surface-container-high border-t border-outline-variant/20 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-surface border border-outline-variant/20 text-on-surface rounded-full px-4 py-2 text-sm focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all placeholder:text-on-surface-variant/50"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white hover:bg-secondary-container hover:text-on-secondary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </form>
    </div>
  );
}
