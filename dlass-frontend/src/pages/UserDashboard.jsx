import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUsername, getToken } from "../services/authService";

const API = "http://localhost:8080/api";

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

function UserDashboard() {
  const navigate = useNavigate();
  const username = getUsername();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick search
  const [pincode, setPincode] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(`${API}/appointments/my`, { headers: authHeaders() });
      setAppointments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleQuickSearch = () => {
    const trimmed = pincode.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((h) => h !== trimmed);
      return [trimmed, ...filtered].slice(0, 5);
    });
    navigate(`/search?pincode=${trimmed}`);
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.delete(`${API}/appointments/${id}`, { headers: authHeaders() });
      fetchAppointments();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const now = new Date();

  // Sort upcoming by soonest first
  const upcoming = appointments
    .filter(a => a.status === "BOOKED" && new Date(`${a.date}T${a.startTime}`) >= now)
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`));

  // Sort past by most recent first
  const past = appointments
    .filter(a => a.status === "CANCELLED" || a.status === "COMPLETED" || new Date(`${a.date}T${a.startTime}`) < now)
    .sort((a, b) => new Date(`${b.date}T${b.startTime}`) - new Date(`${a.date}T${a.startTime}`));

  const cardStyle = { background: "#1e293b", border: "1.5px solid #334155", borderRadius: "12px", padding: "1.2rem", marginBottom: ".8rem" };

  return (
    <div className="page-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="dashboard-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title" style={{ fontSize: "2rem", marginBottom: "0.2rem" }}>Hello, {username} 👋</h1>
        <p style={{ color: "#94a3b8" }}>Manage your bookings and discover new services.</p>
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading appointments...</p>
      ) : (
        <>
          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "#e2e8f0", marginBottom: "1rem" }}>Upcoming Appointments</h2>
            {upcoming.length === 0 ? (
              <p style={{ color: "#64748b" }}>No upcoming appointments.</p>
            ) : (
              upcoming.map(a => (
                <div key={a.id} style={{ ...cardStyle, borderLeft: "4px solid #4ade80" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: "1.1rem" }}>{a.serviceName}</div>
                      <div style={{ color: "#cbd5e1", marginTop: "0.3rem" }}>Provider: {a.providerName}</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.2rem" }}>
                        📅 {a.date} at 🕐 {a.startTime}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                      <span style={{
                        padding: "4px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700,
                        background: "#166534", color: "#4ade80"
                      }}>
                        {a.status}
                      </span>
                      <button
                        onClick={() => handleCancel(a.id)}
                        style={{
                          background: "transparent", border: "1px solid #f87171", color: "#f87171",
                          padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.85rem",
                          transition: "all 0.2s"
                        }}
                        onMouseOver={e => e.target.style.background = "rgba(248, 113, 113, 0.1)"}
                        onMouseOut={e => e.target.style.background = "transparent"}
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ color: "#e2e8f0", marginBottom: "1rem" }}>Past Appointments</h2>
            {past.length === 0 ? (
              <p style={{ color: "#64748b" }}>No past appointments.</p>
            ) : (
              past.map(a => (
                <div key={a.id} style={{ ...cardStyle, opacity: 0.8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#cbd5e1" }}>{a.serviceName}</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Provider: {a.providerName}</div>
                      <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                        📅 {a.date} | 🕐 {a.startTime}
                      </div>
                    </div>
                    <div>
                      <span style={{
                        padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700,
                        background: a.status === "CANCELLED" ? "#7f1d1d" : "#1e3a5f",
                        color: a.status === "CANCELLED" ? "#fca5a5" : "#93c5fd"
                      }}>
                        {a.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      )}

      {/* Quick Search */}
      <section style={{ ...cardStyle }}>
        <h3 style={{ marginTop: 0, color: "#f1f5f9" }}>Need another service?</h3>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1rem" }}>Find top-rated local providers instantly.</p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Enter pincode (e.g. 400001)"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #334155",
              background: "#0f172a", color: "#f1f5f9", outline: "none"
            }}
          />
          <button
            onClick={handleQuickSearch}
            style={{
              padding: "10px 20px", borderRadius: "8px", border: "none",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 600, cursor: "pointer"
            }}
          >
            Search
          </button>
        </div>
      </section>
    </div>
  );
}

export default UserDashboard;