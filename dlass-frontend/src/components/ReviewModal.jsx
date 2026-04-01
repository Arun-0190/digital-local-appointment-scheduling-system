import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getToken } from "../services/authService";
import Button from "./ui/Button";

const API = "http://localhost:8080/api";

export default function ReviewModal({ isOpen, onClose, appointmentId, providerId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating from 1 to 5.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await axios.post(
        `${API}/reviews`,
        { appointmentId, providerId, rating, comment },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (onSuccess) onSuccess(appointmentId || providerId);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to submit review. You may have already reviewed this provider.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="bg-glassBg backdrop-blur-xl border border-glassBorder rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
            
            <header className="px-6 py-4 border-b border-glassBorder flex justify-between items-center relative z-10">
              <h2 className="font-headline font-bold text-lg text-textPrimary flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">rate_review</span>
                Share your Experience
              </h2>
              <button onClick={onClose} className="p-1 rounded-full text-textSecondary hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-6 relative z-10">
              {error && (
                <div className="mb-4 p-3 bg-coral/10 border border-coral/20 rounded-xl text-coral text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              <div className="flex flex-col items-center justify-center mb-6">
                <span className="text-sm font-label font-bold text-textSecondary mb-3">How was your service?</span>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      type="button"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <span className={`material-symbols-outlined text-4xl transition-all duration-300 ${
                        (hoverRating || rating) >= star ? "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]" : "text-gray-300 dark:text-gray-600"
                      }`} style={{ fontVariationSettings: (hoverRating || rating) >= star ? "'FILL' 1" : "'FILL' 0" }}>
                        star
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-label font-bold text-textSecondary uppercase tracking-widest mb-2">Leave a comment (optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your experience..."
                  rows={4}
                  className="w-full bg-white dark:bg-gray-800/50 border border-inputBorder rounded-xl p-4 text-textPrimary placeholder:text-gray-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                  Submit Review
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>
                    Not Now
                  </Button>
                  <Button type="button" variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>
                    Skip for Now
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
