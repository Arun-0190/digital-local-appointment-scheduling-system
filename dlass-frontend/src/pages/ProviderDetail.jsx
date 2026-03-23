import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../services/authService";

const API = "http://localhost:8080/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking modal state
  const [selectedService, setSelectedService] = useState(null);
  const [bookDate, setBookDate] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(false);
  const [bookSuccess, setBookSuccess] = useState("");
  const [bookError, setBookError] = useState("");

  // ── Load profile + services ──────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [profRes, svcRes] = await Promise.all([
          axios.get(`${API}/providers/${id}/profile`),
          axios.get(`${API}/providers/${id}/services`),
        ]);
        setProfile(profRes.data.provider);
        setServices(svcRes.data);
      } catch (e) {
        setError("Failed to load provider details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // ── Load slots when service + date change ────────────────────────────────
  const fetchSlots = () => {
    if (!selectedService || !bookDate) { setSlots([]); return; }
    setSlotsLoading(true);
    setSelectedSlot(null);
    setBookError("");
    axios
      .get(`${API}/providers/${id}/slots`, { params: { serviceId: selectedService.id, date: bookDate } })
      .then(r => setSlots(r.data))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedService, bookDate, id]);

  // ── Book slot ────────────────────────────────────────────────────────────
  async function handleBook() {
    if (!selectedSlot) return;
    const token = getToken();
    if (!token) { navigate("/login"); return; }
    setBooking(true);
    setBookError("");
    setBookSuccess("");
    try {
      await axios.post(
        `${API}/appointments`,
        {
          providerId: id,
          serviceId: selectedService.id,
          date: bookDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookSuccess("Appointment booked! Check your dashboard.");
      // Refresh slots from backend to guarantee accurate availability
      fetchSlots();
      setSelectedSlot(null);
    } catch (e) {
      setBookError(e.response?.data?.message || "Booking failed. That slot may be taken.");
    } finally {
      setBooking(false);
    }
  }

  // ── Styles ───────────────────────────────────────────────────────────────
  const card = {
    background: "#1e293b",
    border: "1.5px solid #334155",
    borderRadius: "14px",
    padding: "1.5rem",
    marginBottom: "1rem",
  };

  const badge = (c) => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: ".75rem",
    fontWeight: 700,
    background: c,
    color: "#fff",
    marginRight: "6px",
  });

  if (loading) return <div className="page-container"><p style={{ color: "#94a3b8" }}>Loading…</p></div>;
  if (error) return <div className="page-container"><p style={{ color: "#f87171" }}>{error}</p></div>;

  return (
    <div className="page-container" style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* ── Back ── */}
      <button
        onClick={() => navigate(-1)}
        style={{ background: "none", border: "none", color: "#818cf8", cursor: "pointer", marginBottom: "1.2rem", fontSize: ".95rem" }}
      >
        ← Back to Search
      </button>

      {/* ── Provider Header ── */}
      <div style={{ ...card, borderColor: "#6366f1", background: "linear-gradient(135deg,#1e1b4b 0%,#1e293b 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#f1f5f9" }}>{profile?.businessName}</h1>
            <p style={{ color: "#94a3b8", marginTop: ".4rem" }}>{profile?.description}</p>
            <p style={{ color: "#64748b", fontSize: ".9rem", marginTop: ".5rem" }}>
              📍 {profile?.area}, {profile?.city} — {profile?.pincode}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#facc15", fontSize: "1.3rem", marginBottom: ".3rem" }}>
              {"★".repeat(Math.round(profile?.rating || 0))}{"☆".repeat(5 - Math.round(profile?.rating || 0))}
            </div>
            <span style={{ color: "#94a3b8", fontSize: ".85rem" }}>
              {profile?.rating?.toFixed(1) || "0.0"} ({profile?.reviewCount || 0} reviews)
            </span>
            <div style={{ marginTop: ".5rem" }}>
              <span style={badge("#10b981")}>{profile?.experienceYears} yrs exp.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Services ── */}
      <h2 style={{ color: "#e2e8f0", marginBottom: ".8rem" }}>Services</h2>
      {services.length === 0 ? (
        <p style={{ color: "#64748b" }}>This provider hasn't listed any services yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {services.map(svc => (
            <div
              key={svc.id}
              onClick={() => { setSelectedService(svc); setBookSuccess(""); setBookError(""); }}
              style={{
                ...card,
                cursor: "pointer",
                borderColor: selectedService?.id === svc.id ? "#6366f1" : "#334155",
                boxShadow: selectedService?.id === svc.id ? "0 0 0 2px #6366f1" : "none",
                transition: "all .2s",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "#f1f5f9", marginBottom: ".4rem" }}>{svc.name}</div>
              <div style={{ color: "#818cf8", fontWeight: 700, fontSize: "1.15rem" }}>₹{svc.price}</div>
              <div style={{ color: "#64748b", fontSize: ".85rem", marginTop: ".3rem" }}>⏱ {svc.durationMinutes} min</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Booking Section ── */}
      {selectedService && (
        <div style={{ ...card, borderColor: "#6366f1" }}>
          <h3 style={{ color: "#f1f5f9", marginTop: 0 }}>
            Book: <span style={{ color: "#818cf8" }}>{selectedService.name}</span>
            <span style={{ color: "#64748b", fontSize: ".85rem", fontWeight: 400, marginLeft: "8px" }}>
              ₹{selectedService.price} · {selectedService.durationMinutes} min
            </span>
          </h3>

          {/* Date Picker */}
          <label style={{ color: "#94a3b8", fontSize: ".85rem", display: "block", marginBottom: ".4rem" }}>Select Date</label>
          <input
            type="date"
            value={bookDate}
            min={todayISO()}
            onChange={e => setBookDate(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1.5px solid #334155",
              background: "#0f172a",
              color: "#f1f5f9",
              fontSize: ".95rem",
              marginBottom: "1.2rem",
              outline: "none",
              colorScheme: "dark",
            }}
          />

          {/* Slot Grid */}
          <label style={{ color: "#94a3b8", fontSize: ".85rem", display: "block", marginBottom: ".6rem" }}>
            Available Slots
          </label>
          {slotsLoading ? (
            <p style={{ color: "#64748b" }}>Loading slots…</p>
          ) : slots.length === 0 ? (
            <p style={{ color: "#64748b" }}>No available slots for this date.</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: ".6rem", marginBottom: "1.2rem" }}>
              {slots.map(slot => (
                <button
                  key={slot.startTime}
                  onClick={() => setSelectedSlot(slot)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: `2px solid ${selectedSlot?.startTime === slot.startTime ? "#6366f1" : "#334155"}`,
                    background: selectedSlot?.startTime === slot.startTime ? "#6366f1" : "#0f172a",
                    color: "#f1f5f9",
                    fontSize: ".88rem",
                    cursor: "pointer",
                    fontWeight: selectedSlot?.startTime === slot.startTime ? 700 : 400,
                    transition: "all .15s",
                  }}
                >
                  {fmt(slot.startTime)} – {fmt(slot.endTime)}
                </button>
              ))}
            </div>
          )}

          {/* Feedback */}
          {bookSuccess && <div style={{ color: "#4ade80", marginBottom: ".8rem", fontWeight: 600 }}>✓ {bookSuccess}</div>}
          {bookError && <div style={{ color: "#f87171", marginBottom: ".8rem" }}>✕ {bookError}</div>}

          {/* Confirm Button */}
          <button
            onClick={handleBook}
            disabled={!selectedSlot || booking}
            style={{
              padding: "12px 28px",
              borderRadius: "10px",
              border: "none",
              background: !selectedSlot ? "#334155" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: !selectedSlot ? "not-allowed" : "pointer",
              opacity: booking ? 0.6 : 1,
              transition: "all .2s",
            }}
          >
            {booking ? "Booking…" : selectedSlot ? `Confirm ${fmt(selectedSlot.startTime)} – ${fmt(selectedSlot.endTime)}` : "Select a slot to book"}
          </button>
        </div>
      )}
    </div>
  );
}
