import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../services/authService";

const API = "http://localhost:8080/api";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const MASTER_SERVICES = [
  "Plumbing Repair",
  "Electrical Installation",
  "Deep Home Cleaning",
  "AC Servicing",
  "Pest Control",
  "Carpentry Work",
  "Painting Service",
  "Appliance Repair",
  "Sofa Cleaning",
  "Bathroom Cleaning"
];

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

// ─── Tab Button ──────────────────────────────────────────────────────────────
function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 22px",
        borderRadius: "8px",
        border: "none",
        background: active ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#1e293b",
        color: active ? "#fff" : "#64748b",
        fontWeight: active ? 700 : 400,
        cursor: "pointer",
        transition: "all .2s",
        fontSize: ".9rem",
      }}
    >
      {label}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProviderDashboard() {
  const [tab, setTab] = useState("services");
  const [providerId, setProviderId] = useState(null);

  // Services tab state
  const [services, setServices] = useState([]);
  const [svcForm, setSvcForm] = useState({ name: "", price: "", duration: 30 });
  const [svcMsg, setSvcMsg] = useState("");

  // Availability tab state
  const [availability, setAvailability] = useState([]);
  const [availForm, setAvailForm] = useState({ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "18:00" });
  const [availMsg, setAvailMsg] = useState("");

  // Appointments tab state
  const [appointments, setAppointments] = useState([]);
  const [apptDate, setApptDate] = useState(new Date().toISOString().split("T")[0]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Fetch provider profile to get our providerId ─────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const res = await axios.get(`${API}/provider/dashboard`, { headers: authHeaders() });
        setProviderId(res.data.providerId);
      } catch {
        setError("Could not load dashboard. Make sure you are an approved provider.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // ── Load services when tab or providerId changes ──────────────────────────
  useEffect(() => {
    if (!providerId || tab !== "services") return;
    axios.get(`${API}/providers/${providerId}/services`).then(r => setServices(r.data));
  }, [providerId, tab]);

  // ── Load availability ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!providerId || tab !== "availability") return;
    axios.get(`${API}/provider-availability/provider/${providerId}`).then(r => setAvailability(r.data));
  }, [providerId, tab]);

  // ── Load appointments ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!providerId || tab !== "appointments") return;
    axios
      .get(`${API}/appointments/provider`, { headers: authHeaders(), params: { date: apptDate || undefined } })
      .then(r => setAppointments(r.data))
      .catch(() => setAppointments([]));
  }, [providerId, tab, apptDate]);

  // ── Add service ───────────────────────────────────────────────────────────
  async function addService(e) {
    e.preventDefault();
    try {
      await axios.post(
        `${API}/providers/services`,
        { name: svcForm.name, price: parseFloat(svcForm.price), duration: parseInt(svcForm.duration) },
        { headers: authHeaders() }
      );
      setSvcMsg("✓ Service added!");
      setSvcForm({ name: "", price: "", duration: 30 });
      const r = await axios.get(`${API}/providers/${providerId}/services`);
      setServices(r.data);
    } catch (e) {
      setSvcMsg("✕ " + (e.response?.data?.message || "Failed to add service."));
    }
    setTimeout(() => setSvcMsg(""), 3000);
  }

  // ── Add availability ──────────────────────────────────────────────────────
  async function addAvailability(e) {
    e.preventDefault();
    try {
      await axios.post(
        `${API}/provider-availability`,
        { dayOfWeek: availForm.dayOfWeek, startTime: availForm.startTime, endTime: availForm.endTime, slotDuration: 30 },
        { headers: authHeaders() }
      );
      setAvailMsg("✓ Schedule added!");
      const r = await axios.get(`${API}/provider-availability/provider/${providerId}`);
      setAvailability(r.data);
    } catch (e) {
      setAvailMsg("✕ " + (e.response?.data?.message || "Failed or conflict."));
    }
    setTimeout(() => setAvailMsg(""), 3000);
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const card = { background: "#1e293b", border: "1.5px solid #334155", borderRadius: "12px", padding: "1.2rem", marginBottom: ".8rem" };
  const input = {
    width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #334155",
    background: "#0f172a", color: "#f1f5f9", fontSize: ".9rem", outline: "none", boxSizing: "border-box",
  };
  const label = { display: "block", color: "#94a3b8", fontSize: ".8rem", marginBottom: ".35rem" };
  const fieldWrap = { marginBottom: ".9rem" };

  if (loading) return <div className="page-container"><p style={{ color: "#94a3b8" }}>Loading…</p></div>;
  if (error) return <div className="page-container"><p style={{ color: "#f87171" }}>{error}</p></div>;

  return (
    <div className="page-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 className="page-title">Provider Dashboard</h1>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: ".6rem", marginBottom: "1.8rem", flexWrap: "wrap" }}>
        <Tab label="🔧 Services" active={tab === "services"} onClick={() => setTab("services")} />
        <Tab label="📅 Availability" active={tab === "availability"} onClick={() => setTab("availability")} />
        <Tab label="📋 Appointments" active={tab === "appointments"} onClick={() => setTab("appointments")} />
      </div>

      {/* ═══════════════ SERVICES TAB ═══════════════ */}
      {tab === "services" && (
        <div>
          <h2 style={{ color: "#e2e8f0", marginBottom: "1rem" }}>My Services</h2>

          {/* Add form */}
          <div style={{ ...card, borderColor: "#6366f1", marginBottom: "1.5rem" }}>
            <h3 style={{ color: "#f1f5f9", marginTop: 0 }}>Add New Service</h3>
            <form onSubmit={addService}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={fieldWrap}>
                  <label style={label}>Service Name *</label>
                  <select style={input} required value={svcForm.name}
                    onChange={e => setSvcForm({ ...svcForm, name: e.target.value })}>
                    <option value="" disabled>Select a service</option>
                    {MASTER_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={fieldWrap}>
                  <label style={label}>Price (₹) *</label>
                  <input style={input} required type="number" min="0" step="0.01" value={svcForm.price}
                    onChange={e => setSvcForm({ ...svcForm, price: e.target.value })} placeholder="e.g. 499" />
                </div>
                <div style={fieldWrap}>
                  <label style={label}>Duration (minutes) *</label>
                  <input style={input} required type="number" min="10" max="240" value={svcForm.duration}
                    onChange={e => setSvcForm({ ...svcForm, duration: e.target.value })} />
                </div>
              </div>
              {svcMsg && <p style={{ color: svcMsg.startsWith("✓") ? "#4ade80" : "#f87171", marginBottom: ".6rem" }}>{svcMsg}</p>}
              <button type="submit" style={{
                padding: "10px 24px", borderRadius: "8px", border: "none",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 700, cursor: "pointer"
              }}>Add Service</button>
            </form>
          </div>

          {/* Service list */}
          {services.length === 0 ? (
            <p style={{ color: "#64748b" }}>No services added yet. Add your first service above.</p>
          ) : (
            services.map(s => (
              <div key={s.id} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#f1f5f9" }}>{s.name}</div>
                    <div style={{ color: "#64748b", fontSize: ".85rem", marginTop: ".2rem" }}>⏱ {s.durationMinutes} min</div>
                  </div>
                  <div style={{ color: "#818cf8", fontWeight: 700, fontSize: "1.15rem" }}>₹{s.price}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══════════════ AVAILABILITY TAB ═══════════════ */}
      {tab === "availability" && (
        <div>
          <h2 style={{ color: "#e2e8f0", marginBottom: "1rem" }}>Working Hours</h2>

          {/* Add form */}
          <div style={{ ...card, borderColor: "#6366f1", marginBottom: "1.5rem" }}>
            <h3 style={{ color: "#f1f5f9", marginTop: 0 }}>Add Availability Window</h3>
            <form onSubmit={addAvailability}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div style={fieldWrap}>
                  <label style={label}>Day</label>
                  <select style={input} value={availForm.dayOfWeek}
                    onChange={e => setAvailForm({ ...availForm, dayOfWeek: e.target.value })}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div style={fieldWrap}>
                  <label style={label}>Start Time</label>
                  <input type="time" style={input} value={availForm.startTime}
                    onChange={e => setAvailForm({ ...availForm, startTime: e.target.value })} />
                </div>
                <div style={fieldWrap}>
                  <label style={label}>End Time</label>
                  <input type="time" style={input} value={availForm.endTime}
                    onChange={e => setAvailForm({ ...availForm, endTime: e.target.value })} />
                </div>
              </div>
              {availMsg && <p style={{ color: availMsg.startsWith("✓") ? "#4ade80" : "#f87171", marginBottom: ".6rem" }}>{availMsg}</p>}
              <button type="submit" style={{
                padding: "10px 24px", borderRadius: "8px", border: "none",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontWeight: 700, cursor: "pointer"
              }}>Save Schedule</button>
            </form>
          </div>

          {/* Existing schedule */}
          {availability.length === 0 ? (
            <p style={{ color: "#64748b" }}>No availability windows set yet.</p>
          ) : (
            availability.map(a => (
              <div key={a.id} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{a.dayOfWeek}</span>
                  <span style={{ color: "#818cf8" }}>{a.startTime} – {a.endTime}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══════════════ APPOINTMENTS TAB ═══════════════ */}
      {tab === "appointments" && (
        <div>
          <h2 style={{ color: "#e2e8f0", marginBottom: "1rem" }}>Bookings</h2>
          <div style={{ marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <div>
              <label style={label}>Select Date</label>
              <input type="date" style={{ ...input, maxWidth: "220px", marginBottom: 0 }} value={apptDate}
                onChange={e => setApptDate(e.target.value)} />
            </div>
            {apptDate && (
              <button onClick={() => setApptDate("")} style={{
                marginTop: "16px", padding: "10px 14px", borderRadius: "8px", border: "none",
                background: "#334155", color: "#f1f5f9", cursor: "pointer", fontSize: "0.85rem"
              }}>
                Clear Date Filter
              </button>
            )}
          </div>
          {appointments.length === 0 ? (
            <p style={{ color: "#64748b" }}>No bookings found for the selected view.</p>
          ) : (
            appointments.map(a => (
              <div key={a.id} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: ".5rem" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#f1f5f9" }}>{a.serviceName || "Appointment"}</div>
                    <div style={{ color: "#94a3b8", fontSize: ".9rem", marginTop: ".3rem" }}>
                      Customer: <span style={{ color: "#cbd5e1", fontWeight: 500 }}>{a.userName}</span> ({a.userEmail})
                    </div>
                    <div style={{ color: "#64748b", fontSize: ".85rem", marginTop: ".3rem" }}>
                      📅 {a.date} | 🕐 {a.startTime} – {a.endTime}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: "20px", fontSize: ".75rem", fontWeight: 700,
                      background: a.status === "BOOKED" ? "#166534" : a.status === "CANCELLED" ? "#7f1d1d" : "#1e3a5f",
                      color: a.status === "CANCELLED" ? "#fca5a5" : "#4ade80"
                    }}>
                      {a.status}
                    </span>
                  </div>
                </div>
                {a.amount > 0 && <div style={{ color: "#818cf8", fontSize: ".9rem", marginTop: ".4rem" }}>₹{a.amount}</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}