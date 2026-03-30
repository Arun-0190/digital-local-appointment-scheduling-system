import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUsername, getToken } from "../services/authService";
import DynamicHeader from "../components/DynamicHeader";
import ChatWindow from "../components/ChatWindow";
import AppointmentDetailModal from "../components/AppointmentDetailModal";

const API = "http://localhost:8080/api";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

function UserDashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(getUsername());
  const [userId, setUserId] = useState(null);
  const [tab, setTab] = useState("appointments");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  // History tab state
  const [history, setHistory] = useState([]);
  const [historyDays, setHistoryDays] = useState(30);

  // Profile tab state
  const [profileForm, setProfileForm] = useState({ fullName: "", phone: "", pincode: "", profileImageUrl: "" });
  const [profileMsg, setProfileMsg] = useState("");

  // Quick search
  const [pincode, setPincode] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    // Fetch real name
    axios.get(`${API}/users/me`, { headers: authHeaders() })
      .then(res => {
        setUsername(res.data.fullName || getUsername());
        setUserId(res.data.id);
        setProfileForm({
           fullName: res.data.fullName || "",
           phone: res.data.phone || "",
           pincode: res.data.pincode || "",
           profileImageUrl: res.data.profileImageUrl || ""
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tab !== "history") return;
    axios.get(`${API}/appointments/history`, {
      headers: authHeaders(),
      params: { days: historyDays }
    })
    .then(r => setHistory(r.data))
    .catch(() => setHistory([]));
  }, [tab, historyDays]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProfileMsg("Uploading avatar...");
      const res = await axios.post(`${API}/users/upload-avatar`, formData, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });
      setProfileForm((prev) => ({ ...prev, profileImageUrl: res.data }));
      setProfileMsg("✓ Avatar updated successfully!");
    } catch (err) {
      console.error(err);
      setProfileMsg("Failed to upload avatar.");
    }
  };

  async function saveProfile(e) {
    if (e) e.preventDefault();
    try {
      await axios.put(`${API}/users/profile`, profileForm, { headers: authHeaders() });
      setProfileMsg("✓ Profile updated successfully!");
      setUsername(profileForm.fullName);
    } catch (e) {
      setProfileMsg("✕ Failed to update profile: " + (e.response?.data?.message || e.message));
    }
    setTimeout(() => setProfileMsg(""), 4000);
  }

  async function deactivateAccount() {
    if (!window.confirm("Are you sure you want to pause your account?")) return;
    try {
      await axios.patch(`${API}/users/deactivate`, {}, { headers: authHeaders() });
      alert("Account deactivated. You will now be logged out.");
      navigate("/login");
    } catch (e) {
      alert("Failed to deactivate: " + (e.response?.data?.message || e.message));
    }
  }

  async function deleteAccount() {
    if (!window.confirm("CRITICAL: Are you absolutely sure? This permanently deletes your account and data.")) return;
    try {
      await axios.patch(`${API}/users/delete`, {}, { headers: authHeaders() });
      alert("Account deleted. You will now be logged out.");
      navigate("/login");
    } catch (e) {
      alert("Failed to delete account: " + (e.response?.data?.message || e.message));
    }
  }

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

  const upcoming = appointments
    .filter((a) => a.status === "BOOKED" && new Date(`${a.date}T${a.startTime}`) >= now)
    .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`));

  const past = appointments
    .filter(
      (a) =>
        a.status === "CANCELLED" ||
        a.status === "COMPLETED" ||
        new Date(`${a.date}T${a.startTime}`) < now
    )
    .sort((a, b) => new Date(`${b.date}T${b.startTime}`) - new Date(`${a.date}T${a.startTime}`));

  const statusPill = (status) => {
    if (status === "BOOKED")
      return "px-4 py-1.5 bg-primary-container/20 text-primary-fixed-dim rounded-full text-xs font-bold border border-primary/30";
    if (status === "CANCELLED")
      return "px-4 py-1.5 bg-red-500/10 text-red-300 rounded-full text-xs font-bold border border-red-500/20";
    return "px-4 py-1.5 bg-surface-container-high text-on-surface-variant rounded-full text-xs font-bold border border-outline-variant/20";
  };

  const getHeaderContent = () => {
    switch (tab) {
      case "appointments": return "View and manage your upcoming bookings.";
      case "history": return "Check your past appointments.";
      case "profile": return "Manage your account details.";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto pt-8 space-y-10">
        {/* Welcome Header */}
        <header className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-2">
              Hey, ready for your next appointment?
            </h1>
            <p className="text-on-surface-variant text-base leading-relaxed max-w-md">
              {getHeaderContent()}
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative group">
            <div className="absolute inset-0 bg-secondary/10 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-3 bg-surface-container-highest/50 backdrop-blur-xl border border-outline-variant/20 rounded-2xl p-3 focus-within:ring-2 focus-within:ring-secondary/40 transition-all duration-300">
              <span className="material-symbols-outlined text-on-surface-variant px-1">location_on</span>
              <input
                type="text"
                placeholder="Enter pincode to find providers…"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
                className="bg-transparent border-none focus:ring-0 focus:outline-none w-full text-on-surface placeholder:text-on-surface-variant/50 text-sm font-body"
              />
              <button
                onClick={handleQuickSearch}
                className="shrink-0 px-4 py-2 bg-gradient-to-r from-primary-container to-secondary-container rounded-xl text-white font-headline font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all"
              >
                Search
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap bg-surface-container-low p-1.5 rounded-full shadow-inner border border-outline-variant/10 w-fit gap-1">
          {[
            { key: "appointments", icon: "calendar_today", label: "Appointments" },
            { key: "history", icon: "history", label: "History" },
            { key: "profile", icon: "person", label: "Profile" },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-headline font-bold text-xs uppercase tracking-widest transition-all ${
                tab === key
                  ? "bg-primary-container text-on-primary-container shadow-lg"
                  : "text-on-surface-variant hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Main Bento Grid */}
        {tab === "appointments" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Upcoming Appointments – 8 col */}
          <section className="md:col-span-8 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="font-headline text-xl font-bold flex items-center gap-3">
                <span className="w-1.5 h-7 bg-primary-container rounded-full" />
                Upcoming Appointments
              </h2>
              <button
                onClick={() => navigate("/search")}
                className="text-secondary text-sm font-label tracking-widest uppercase hover:underline underline-offset-4 transition-all"
              >
                Find Services
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="spinner" />
              </div>
            ) : upcoming.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center border-dashed border border-outline-variant/20">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-3 block">
                  calendar_today
                </span>
                <p className="font-headline text-lg font-bold text-on-surface-variant/40">
                  No upcoming appointments
                </p>
                <button
                  onClick={() => navigate("/search")}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-primary-container to-secondary-container rounded-xl text-white font-bold text-sm hover:scale-105 active:scale-95 transition-all"
                >
                  Book a Service
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((a) => (
                  <div
                    key={a.id}
                    className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:translate-x-1 transition-transform duration-300 group border-l-2 border-primary-container"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-2xl text-white">
                        handyman
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-headline text-base font-bold text-white">
                        {a.serviceName}
                      </h3>
                      <p className="text-on-surface-variant text-sm">
                        Provider: {a.providerName}
                      </p>
                      {a.providerPhone && (
                        <p className="text-on-surface-variant text-xs font-mono mt-0.5">
                          {a.providerPhone}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-secondary/80 font-label tracking-wide">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          {a.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {a.startTime}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
                      <span className={statusPill(a.status)}>{a.status}</span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedAppointmentId(a.id)}
                          className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">info</span>
                          Details
                        </button>
                        <button
                          onClick={() => setActiveChat({ id: a.providerUserId, name: a.providerName })}
                          className="flex items-center gap-1 text-xs font-bold text-secondary hover:text-secondary-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">chat</span>
                          Chat
                        </button>
                        <button
                          onClick={() => handleCancel(a.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">cancel</span>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Sidebar – 4 col */}
          <aside className="md:col-span-4 space-y-6">
            {/* Insights card */}
            <div className="glass-panel rounded-2xl p-6 space-y-5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-28 h-28 bg-primary/10 blur-3xl rounded-full -mr-14 -mt-14" />
              <h2 className="font-headline text-lg font-bold">Your Insights</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <span className="text-on-surface-variant text-sm">Total Bookings</span>
                  <span className="text-primary font-bold">{appointments.length}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <span className="text-on-surface-variant text-sm">Upcoming</span>
                  <span className="text-secondary font-bold">{upcoming.length}</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-xl border border-white/5">
                  <span className="text-on-surface-variant text-sm">Completed</span>
                  <span className="text-green-400 font-bold">
                    {appointments.filter((a) => a.status === "COMPLETED").length}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate("/search")}
                className="w-full py-3 bg-gradient-to-r from-primary-container to-secondary-container rounded-xl font-bold text-white text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Schedule New Service
              </button>
            </div>

            {/* Past Appointments */}
            {past.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-headline text-base font-bold px-1">Recently Completed</h2>
                {past.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    className="p-4 bg-surface-container-low/50 rounded-xl border-l-2 border-outline-variant hover:bg-surface-container-high transition-colors group cursor-default"
                  >
                    <div className="flex justify-between">
                      <span className="text-sm font-bold text-white truncate pr-2">
                        {a.serviceName}
                      </span>
                      <span className={statusPill(a.status)}>{a.status}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {a.date} · {a.providerName}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
        )}

        {/* ════════════════ HISTORY TAB ════════════════════════ */}
        {tab === "history" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Time Range</label>
                <select
                  value={historyDays}
                  onChange={(e) => setHistoryDays(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-surface-container-highest/50 border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 text-sm"
                >
                  <option value={7}>Last 7 Days</option>
                  <option value={15}>Last 15 Days</option>
                  <option value={30}>Last 30 Days</option>
                  <option value={90}>Last 3 Months</option>
                </select>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-headline font-bold tracking-tight text-on-surface">Past Appointments</h2>
                <span className="text-xs font-label tracking-widest text-on-surface-variant uppercase bg-white/5 px-4 py-2 rounded-full">
                  {history.length} total
                </span>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-3 block">history</span>
                  <p className="text-on-surface-variant/50 font-headline font-bold">No history for the selected range</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-left">
                        {["Provider", "Service", "Date & Time", "Status", "Action"].map((h) => (
                          <th key={h} className="pb-1 px-4 text-xs font-label uppercase tracking-widest text-on-surface-variant font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((a) => (
                        <tr key={a.id} className="bg-surface-container-low hover:bg-surface-container-high transition-colors">
                          <td className="py-4 px-4 rounded-l-2xl border-l-2 border-surface-container-highest">
                            <div className="text-sm font-bold text-on-surface">{a.providerName}</div>
                            {a.providerPhone && <div className="text-xs text-on-surface-variant font-mono mt-0.5">{a.providerPhone}</div>}
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-primary">{a.serviceName || "Appointment"}</td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-on-surface">{a.date}</div>
                            <div className="text-xs text-on-surface-variant">{a.startTime} – {a.endTime}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={statusPill(a.status)}>{a.status}</span>
                          </td>
                          <td className="py-4 px-4 rounded-r-2xl">
                            <button
                              onClick={() => setSelectedAppointmentId(a.id)}
                              className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-container transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">info</span>
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════ PROFILE TAB ════════════════════════ */}
        {tab === "profile" && (
          <div className="space-y-8">
            <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl">
              <h2 className="text-xl font-headline font-bold text-on-surface mb-6">Profile Settings</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-container-high border-2 border-outline-variant/30 flex items-center justify-center">
                    {profileForm.profileImageUrl ? (
                      <img 
                         src={`${BASE_URL}${profileForm.profileImageUrl.startsWith('/') ? '' : '/'}${profileForm.profileImageUrl}`} 
                         alt="Avatar" 
                         className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="material-symbols-outlined text-white">photo_camera</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Profile Picture</h3>
                  <p className="text-xs text-on-surface-variant mt-1">Click the image to upload a new avatar.</p>
                </div>
              </div>

              <form onSubmit={saveProfile} className="space-y-4 max-w-2xl">
                 <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Full Name</label>
                    <input type="text" required value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} className="w-full px-4 py-3 bg-surface-container-highest/50 border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 text-sm" placeholder="Enter full name" />
                  </div>
                  <div>
                    <label className="block text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Phone Number</label>
                    <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full px-4 py-3 bg-surface-container-highest/50 border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 text-sm" placeholder="Enter phone number" />
                  </div>
                  <div>
                    <label className="block text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Pincode</label>
                    <input type="text" value={profileForm.pincode} onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })} className="w-full px-4 py-3 bg-surface-container-highest/50 border border-outline-variant/20 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 text-sm" placeholder="Enter preferred pincode focus" />
                  </div>
                </div>
                {profileMsg && <p className={`text-sm font-bold mt-2 ${profileMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>{profileMsg}</p>}
                <button type="submit" className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-headline font-bold text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all">
                  Save Changes
                </button>
              </form>
            </div>

            <div className="glass-card rounded-3xl p-6 md:p-8 border border-red-500/20 bg-red-500/5 shadow-2xl">
              <h2 className="text-xl font-headline font-bold text-red-400 mb-2">Danger Zone</h2>
              <p className="text-sm text-on-surface-variant mb-6">These actions affect your account status.</p>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/10">
                  <div>
                    <h3 className="font-headline font-bold text-on-surface">Deactivate Account</h3>
                    <p className="text-xs text-on-surface-variant mt-1">Temporarily block yourself from booking appointments.</p>
                  </div>
                  <button onClick={deactivateAccount} className="px-5 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-sm hover:bg-amber-500/20 transition-all whitespace-nowrap">
                    Pause Account
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-container-low border border-red-500/10 hover:border-red-500/30 transition-colors">
                  <div>
                    <h3 className="font-headline font-bold text-red-400">Delete Account</h3>
                    <p className="text-xs text-on-surface-variant mt-1">Permanently remove your profile and history.</p>
                  </div>
                  <button onClick={deleteAccount} className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-sm hover:bg-red-500/20 transition-all whitespace-nowrap">
                    Permanently Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Apply as provider CTA */}
        <section className="glass-panel rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-outline-variant/10">
          <div>
            <h3 className="font-headline text-xl font-bold text-on-surface mb-1">
              Are you a service professional?
            </h3>
            <p className="text-on-surface-variant text-sm">
              Apply to become a DLASS provider and grow your business.
            </p>
          </div>
          <button
            onClick={() => navigate("/apply-provider")}
            className="shrink-0 px-8 py-3 rounded-xl border border-secondary/30 bg-secondary/5 text-secondary font-headline font-bold text-sm hover:bg-secondary/10 hover:border-secondary/60 transition-all"
          >
            Apply as Provider →
          </button>
        </section>
      </div>
      <ChatWindow
        isOpen={!!activeChat}
        onClose={() => setActiveChat(null)}
        currentUser={{ id: userId, name: username }}
        otherUserId={activeChat?.id}
        otherUserName={activeChat?.name}
      />

      <AppointmentDetailModal
        isOpen={!!selectedAppointmentId}
        appointmentId={selectedAppointmentId}
        onClose={() => setSelectedAppointmentId(null)}
        currentUserRole="USER"
        onCancel={(id) => handleCancel(id)}
        onChat={(targetId, targetName) => setActiveChat({ id: targetId, name: targetName })}
      />
    </div>
  );
}

export default UserDashboard;