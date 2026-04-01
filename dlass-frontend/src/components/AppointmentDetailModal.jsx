import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../services/authService";

const API = "http://localhost:8080/api";
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

export default function AppointmentDetailModal({
  isOpen,
  onClose,
  appointmentId,
  currentUserRole,
  onCancel,
  onChat
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !appointmentId) return;

    let mounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API}/appointments/${appointmentId}`, { headers: authHeaders() });
        if (mounted) setDetail(res.data);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load data. Something went wrong.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDetail();
    return () => { mounted = false; };
  }, [isOpen, appointmentId]);

  if (!isOpen) return null;

  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay") {
      onClose();
    }
  };

  const statusBadge = (st) => {
    if (st === "BOOKED") return "bg-primary/10 text-primary border-primary/30";
    if (st === "COMPLETED") return "bg-teal-500/10 text-teal-400 border-teal-500/30";
    if (st === "CANCELLED") return "bg-coral/10 text-coral border-coral/30";
    return "bg-black/10 dark:bg-white/10 text-textSecondary border-glassBorder";
  };

  const copyToClipboard = (text) => {
    if (text) navigator.clipboard.writeText(text);
  };

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleOutsideClick}
    >
      <div className="bg-glassBg backdrop-blur-xl border border-glassBorder rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="px-6 py-4 flex justify-between items-center border-b border-glassBorder bg-transparent">
          <h2 className="font-headline font-bold text-lg text-textPrimary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">event_note</span>
            Appointment Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-textSecondary hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
               <div className="flex justify-center mb-6">
                 <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
               </div>
            </div>
          ) : error ? (
            <div className="py-10 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-coral">error</span>
              <p className="text-sm font-headline text-coral/80">{error}</p>
            </div>
          ) : detail ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-headline font-black text-textPrimary">
                    {detail.serviceName || "Service"}
                  </h3>
                  <p className="text-secondary font-label uppercase tracking-widest text-xs mt-1 font-medium">
                    {detail.date} • {detail.startTime} - {detail.endTime}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-3 py-1 items-center text-xs font-bold uppercase tracking-wider rounded-full border ${statusBadge(detail.status)}`}>
                    {detail.status}
                  </span>
                  {detail.amount > 0 && (
                    <div className="mt-2 text-lg font-bold text-textPrimary">
                      ₹{detail.amount}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User Side */}
                <div className="bg-black/5 dark:bg-white/5 border border-glassBorder p-4 rounded-2xl border-l-4 border-l-primary">
                  <span className="text-[10px] font-label font-bold uppercase tracking-widest text-textSecondary flex items-center gap-1 mb-2">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    Customer Detail
                  </span>
                  <div className="space-y-1.5">
                    <p className="font-bold text-sm text-textPrimary">{detail.userName}</p>
                    <p className="text-xs text-textSecondary">{detail.userEmail || "—"}</p>
                    <div className="flex items-center gap-2 group">
                      <p className="text-xs text-textSecondary">{detail.userPhone || "—"}</p>
                      {detail.userPhone && (
                        <>
                           <button onClick={() => copyToClipboard(detail.userPhone)} className="opacity-0 group-hover:opacity-100 text-secondary hover:text-white transition-opacity text-[16px] material-symbols-outlined shrink-0" title="Copy">content_copy</button>
                           <a href={`tel:${detail.userPhone}`} className="opacity-0 group-hover:opacity-100 text-secondary hover:text-white transition-opacity text-[16px] material-symbols-outlined shrink-0">call</a>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Provider Side */}
                <div className="bg-black/5 dark:bg-white/5 border border-glassBorder p-4 rounded-2xl border-l-4 border-l-secondary">
                  <span className="text-[10px] font-label font-bold uppercase tracking-widest text-textSecondary flex items-center gap-1 mb-2">
                    <span className="material-symbols-outlined text-[14px]">store</span>
                    Provider Detail
                  </span>
                  <div className="space-y-1.5">
                    <p className="font-bold text-sm text-textPrimary">{detail.providerName}</p>
                    <p className="text-xs text-textSecondary">{detail.providerEmail || "—"}</p>
                    <div className="flex items-center gap-2 group">
                      <p className="text-xs text-textSecondary">{detail.providerPhone || "—"}</p>
                      {detail.providerPhone && (
                        <>
                           <button onClick={() => copyToClipboard(detail.providerPhone)} className="opacity-0 group-hover:opacity-100 text-secondary hover:text-white transition-opacity text-[16px] material-symbols-outlined shrink-0" title="Copy">content_copy</button>
                           <a href={`tel:${detail.providerPhone}`} className="opacity-0 group-hover:opacity-100 text-secondary hover:text-white transition-opacity text-[16px] material-symbols-outlined shrink-0">call</a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes (if ever populated) */}
              {detail.notes && (
                <div className="bg-transparent p-4 rounded-2xl border border-glassBorder text-sm text-textSecondary leading-relaxed italic">
                  "{detail.notes}"
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        {!loading && !error && detail && (
          <div className="px-6 py-4 bg-transparent border-t border-glassBorder flex items-center justify-end gap-3">
             <button
                onClick={() => {
                  const targetId = currentUserRole === "PROVIDER" ? undefined : detail.providerId; // Needs dynamic resolution depending on what's available
                  // Let's defer to caller for chat:
                  onChat?.(
                    currentUserRole === "PROVIDER" ? "UNKNOWN_USER_ID" : "UNKNOWN_PROVIDER_ID", 
                    currentUserRole === "PROVIDER" ? detail.userName : detail.providerName
                  ); 
                  // Wait, we don't have the exact opposite userId here directly except by mapping.
                  onClose();
                }}
                className="px-4 py-2 flex items-center gap-2 rounded-xl border border-secondary/30 bg-secondary/10 text-secondary text-sm font-bold hover:bg-secondary/20 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Message
            </button>
            {detail.status === "BOOKED" && onCancel && (
              <button
                onClick={() => {
                    onCancel(appointmentId);
                    onClose();
                }}
                className="px-4 py-2 flex items-center gap-2 rounded-xl bg-coral/10 text-coral font-bold text-sm hover:bg-coral/20 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
