import { useState, useEffect } from "react";
import { getUsername } from "../services/authService";
import { getProviderDashboard } from "../services/providerService";

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ── Star display ──────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? "star filled" : "star"}>★</span>
      ))}
      <span className="rating-num">{rating?.toFixed(1) ?? "—"}</span>
    </span>
  );
}

function ProviderDashboard() {
  const email = getUsername();

  // Dashboard stats from backend
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  // Profile edit form (local UI state – backend PUT endpoint not yet available)
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    businessName: "",
    pincode: "",
    service: "",
  });
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const data = await getProviderDashboard();
        setStats(data);
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data || "";
        setStatsError(msg || "Failed to load dashboard data.");
      } finally {
        setStatsLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const handleProfileChange = (e) =>
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleProfileSave = (e) => {
    e.preventDefault();
    // Future: call PUT /api/providers/me
    setSaveMsg("Changes saved locally. Backend update coming soon.");
    setEditMode(false);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="page-title">Provider Dashboard</h1>
        <p className="page-subtitle">{email}</p>
      </div>

      {/* Stats */}
      <section className="dashboard-section">
        <h2 className="section-title">Overview</h2>

        {statsLoading && (
          <div className="loading-state">
            <div className="spinner" /> Loading stats…
          </div>
        )}

        {statsError && <div className="alert alert-error">{statsError}</div>}

        {stats && (
          <div className="stats-grid">
            <StatCard
              label="Total Appointments"
              value={stats.totalAppointments}
              icon="📅"
            />
            <StatCard
              label="Today"
              value={stats.todayAppointments}
              icon="🗓️"
            />
            <StatCard
              label="Upcoming"
              value={stats.upcomingAppointments}
              icon="⏳"
            />
            <StatCard
              label="Revenue"
              value={`₹${stats.totalRevenue?.toFixed(2) ?? "0.00"}`}
              icon="💰"
            />
            <div className="stat-card wide">
              <div className="stat-icon">⭐</div>
              <div className="stat-label">Average Rating</div>
              <Stars rating={stats.averageRating} />
              <div className="stat-sub">{stats.reviewCount} review{stats.reviewCount !== 1 ? "s" : ""}</div>
            </div>
          </div>
        )}
      </section>

      {/* Profile Edit */}
      <section className="dashboard-section">
        <div className="section-header-row">
          <h2 className="section-title">Profile</h2>
          <button
            className="btn-secondary btn-sm"
            onClick={() => setEditMode((v) => !v)}
          >
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {saveMsg && <div className="alert alert-success">{saveMsg}</div>}

        {editMode && (
          <form className="profile-form" onSubmit={handleProfileSave}>
            <div className="form-group">
              <label htmlFor="businessName">Business Name</label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="Your business name"
                value={profileForm.businessName}
                onChange={handleProfileChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="providerPincode">Pincode</label>
              <input
                id="providerPincode"
                name="pincode"
                type="text"
                placeholder="6-digit pincode"
                value={profileForm.pincode}
                onChange={handleProfileChange}
                maxLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="service">Service Offered</label>
              <input
                id="service"
                name="service"
                type="text"
                placeholder="e.g. Plumbing, Electrical…"
                value={profileForm.service}
                onChange={handleProfileChange}
              />
            </div>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default ProviderDashboard;