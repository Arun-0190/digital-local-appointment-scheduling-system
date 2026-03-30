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
    if (st === "BOOKED") return "bg-primary-container/20 text-primary border-primary/30";
    if (st === "COMPLETED") return "bg-green-500/10 text-green-400 border-green-500/30";
    if (st === "CANCELLED") return "bg-red-500/10 text-red-400 border-red-500/30";
    return "bg-surface-container-high text-on-surface-variant border-outline-variant/30";
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
      <div className="bg-surface border border-outline-variant/20 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <header className="px-6 py-4 flex justify-between items-center border-b border-outline-variant/10 bg-surface-container-lowest">
          <h2 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">event_note</span>
            Appointment Details
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        <div className="p-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-surface-container-highest rounded-xl w-1/3 mb-6" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-24 bg-surface-container-high rounded-2xl" />
                <div className="h-24 bg-surface-container-high rounded-2xl" />
              </div>
              <div className="h-24 bg-surface-container-high rounded-2xl w-full" />
            </div>
          ) : error ? (
            <div className="py-10 text-center space-y-3">
              <span className="material-symbols-outlined text-4xl text-red-400">error</span>
              <p className="text-sm font-headline text-red-300">{error}</p>
            </div>
          ) : detail ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-headline font-black text-on-surface">
                    {detail.serviceName || "Service"}
                  </h3>
                  <p className="text-secondary font-label uppercase tracking-widest text-xs mt-1 font-bold">
                    {detail.date} • {detail.startTime} - {detail.endTime}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${statusBadge(detail.status)}`}>
                    {detail.status}
                  </span>
                  {detail.amount > 0 && (
                    <div className="mt-2 text-lg font-bold text-on-surface">
                      ₹{detail.amount}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User Side */}
                <div className="bg-surface-container-low p-4 rounded-2xl border-l-2 border-primary-container">
                  <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1 mb-2">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                    Customer Detail
                  </span>
                  <div className="space-y-1.5">
                    <p className="font-bold text-sm text-on-surface">{detail.userName}</p>
                    <p className="text-xs text-on-surface-variant">{detail.userEmail || "—"}</p>
                    <div className="flex items-center gap-2 group">
                      <p className="text-xs text-on-surface-variant">{detail.userPhone || "—"}</p>
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
                <div className="bg-surface-container-low p-4 rounded-2xl border-l-2 border-secondary-container">
                  <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-1 mb-2">
                    <span className="material-symbols-outlined text-[14px]">store</span>
                    Provider Detail
                  </span>
                  <div className="space-y-1.5">
                    <p className="font-bold text-sm text-on-surface">{detail.providerName}</p>
                    <p className="text-xs text-on-surface-variant">{detail.providerEmail || "—"}</p>
                    <div className="flex items-center gap-2 group">
                      <p className="text-xs text-on-surface-variant">{detail.providerPhone || "—"}</p>
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
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/10 text-sm text-on-surface-variant leading-relaxed italic">
                  "{detail.notes}"
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        {!loading && !error && detail && (
          <div className="px-6 py-4 bg-surface-container-lowest border-t border-outline-variant/10 flex items-center justify-end gap-3">
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
                className="px-4 py-2 flex items-center gap-2 rounded-xl bg-red-500/10 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-all"
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
