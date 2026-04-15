import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { getUsername, getToken } from "../services/authService";
import DynamicHeader from "../components/DynamicHeader";
import ChatWindow from "../components/ChatWindow";
import AppointmentDetailModal from "../components/AppointmentDetailModal";
import PageWrapper from "../components/ui/PageWrapper";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Dropdown from "../components/ui/Dropdown";
import ReviewModal from "../components/ReviewModal";
import StatCard from "../components/ui/StatCard";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const API = "http://localhost:8080/api";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState(getUsername());
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    setIsChatMaximized(false);
  }, [location.pathname]);
  useEffect(() => {
    if (location.state?.openChat?.id) {
      setActiveChat(location.state.openChat);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);
  const [tab, setTab] = useState("appointments");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [isChatMaximized, setIsChatMaximized] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewedIds, setReviewedIds] = useState([]);

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
      setProfileForm((prev) => ({ ...prev, profileImageUrl: res.data.profileImageUrl || prev.profileImageUrl }));
      setProfileMsg("✓ Avatar updated successfully!");
    } catch (err) {
      console.error(err);
      setProfileMsg("Failed to upload avatar.");
    }
  };

  async function saveProfile(e) {
    if (e) e.preventDefault();
    try {
      await axios.put(`${API}/users/profile`, {
        name: profileForm.fullName,
        phone: profileForm.phone,
        pincode: profileForm.pincode,
      }, { headers: authHeaders() });
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

  const canReview = (a) => {
    if (a.status !== "COMPLETED") return false;
    const endDateTime = new Date(`${a.date}T${a.endTime}`);
    const now = new Date();
    const diffHours = (now - endDateTime) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 24 && !reviewedIds.includes(a.id);
  };

  // Chart data: Bookings per day
  const chartData = appointments.reduce((acc, a) => {
    const day = a.date;
    const existing = acc.find(item => item.date === day);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ date: day, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7);

  const stats = {
    total: appointments.length,
    upcoming: upcoming.length,
    completed: appointments.filter(a => a.status === "COMPLETED").length,
    spent: appointments.filter(a => a.status === "COMPLETED").reduce((acc, a) => acc + a.amount, 0)
  };

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
      return "px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/30";
    if (status === "CANCELLED")
      return "px-4 py-1.5 bg-coral/10 text-coral rounded-full text-xs font-bold border border-coral/20";
    if (status === "COMPLETED")
      return "px-4 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20";
    return "px-4 py-1.5 bg-black/5 dark:bg-white/5 text-textSecondary rounded-full text-xs font-bold border border-glassBorder";
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
    <PageWrapper className="pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Welcome Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-extrabold tracking-tight text-textPrimary">
              Dashboard Overview
            </h1>
            <p className="text-textSecondary text-sm">
              Manage your services and track your appointments
            </p>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative group">
                <input
                  type="text"
                  placeholder="Quick search pins..."
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuickSearch()}
                  className="bg-white dark:bg-gray-800 border border-inputBorder rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64 transition-all"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary text-xl">search</span>
             </div>
             <Button onClick={handleQuickSearch} className="!py-2 !px-4 text-xs">Search</Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Bookings" value={stats.total} icon="bookmark" trend="up" trendValue="+12%" />
          <StatCard title="Upcoming" value={stats.upcoming} icon="calendar_today" color="secondary" />
          <StatCard title="Completed" value={stats.completed} icon="check_circle" color="success" />
          <StatCard title="Total Spent" value={`₹${stats.spent}`} icon="payments" color="warning" />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl w-fit gap-1 border border-gray-200 dark:border-gray-700">
          {[
            { key: "appointments", icon: "dashboard", label: "Overview" },
            { key: "history", icon: "history", label: "Booking History" },
            { key: "profile", icon: "person", label: "Account" },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                tab === key
                  ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Main Bento Grid */}
        {tab === "appointments" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Upcoming Appointments – 8 col */}
          <section className="md:col-span-8 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart Card */}
              <GlassCard className="lg:col-span-2 !p-6 flex flex-col h-[400px]">
                <h3 className="font-headline font-bold text-lg mb-6">Booking Trends</h3>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                      />
                      <Area type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Sidebar Info */}
              <GlassCard className="!p-6 flex flex-col justify-between overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                 <div>
                    <h3 className="font-headline font-bold text-lg mb-2">Member Rewards</h3>
                    <p className="text-sm text-textSecondary mb-6">You've reached Silver level. Book 2 more to hit Gold!</p>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-2">
                       <div className="bg-primary-gradient h-full rounded-full w-2/3" />
                    </div>
                    <span className="text-xs text-textSecondary">14/20 points</span>
                 </div>
                 <Button variant="outline" className="w-full mt-8">View Benefits</Button>
              </GlassCard>
            </div>

            <div className="flex justify-between items-center mt-10 mb-4">
              <h2 className="font-headline text-xl font-bold flex items-center gap-3 text-textPrimary">
                Upcoming Appointments
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : upcoming.length === 0 ? (
              <GlassCard className="!p-12 text-center border-dashed border-glassBorder shadow-none bg-transparent">
                <span className="material-symbols-outlined text-5xl text-textSecondary/30 mb-3 block">
                  calendar_today
                </span>
                <p className="font-headline text-lg font-bold text-textSecondary/60">
                  No upcoming appointments
                </p>
                <Button
                  onClick={() => navigate("/search")}
                  className="mt-6 mx-auto"
                >
                  Book a Service
                </Button>
              </GlassCard>
            ) : (
              <div className="space-y-4">
                {upcoming.map((a) => (
                  <GlassCard
                    key={a.id}
                    className="!p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 hover:translate-x-1 group border-l-4 border-l-primary/60 hover:border-l-primary"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <span className="material-symbols-outlined text-2xl text-primary">
                        handyman
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-headline text-base font-bold text-textPrimary">
                        {a.serviceName}
                      </h3>
                      <p className="text-textSecondary text-sm">
                        Provider: {a.providerName}
                      </p>
                      {a.providerPhone && (
                        <p className="text-textSecondary text-xs font-mono mt-0.5">
                          {a.providerPhone}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-secondary/90 font-label tracking-wide">
                        <span className="flex items-center gap-1.5 bg-secondary/10 px-2 py-0.5 rounded-md">
                          <span className="material-symbols-outlined text-sm">calendar_today</span>
                          {a.date}
                        </span>
                        <span className="flex items-center gap-1.5 bg-secondary/10 px-2 py-0.5 rounded-md">
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
                          className="flex items-center gap-1 text-xs font-bold text-primary hover:brightness-125 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">info</span>
                          Details
                        </button>
                        <button
                          onClick={() => setActiveChat({ id: a.providerUserId, name: a.providerName })}
                          className="flex items-center gap-1 text-xs font-bold text-secondary hover:brightness-125 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">chat</span>
                          Chat
                        </button>
                        <button
                          onClick={() => handleCancel(a.id)}
                          className="text-coral hover:brightness-125 text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">cancel</span>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </section>


        </div>
        )}

        {/* ════════════════ HISTORY TAB ════════════════════════ */}
        {tab === "history" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <Dropdown
                  label="Time Range"
                  icon="date_range"
                  options={[
                    { value: 7, label: "Last 7 Days" },
                    { value: 15, label: "Last 15 Days" },
                    { value: 30, label: "Last 30 Days" },
                    { value: 90, label: "Last 3 Months" },
                  ]}
                  value={historyDays}
                  onChange={(val) => setHistoryDays(val)}
                  className="!py-2.5 min-w-40"
                />
              </div>
            </div>

            <GlassCard className="!p-6 md:!p-8 shadow-2xl overflow-hidden block">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-headline font-bold tracking-tight text-textPrimary">Past Appointments</h2>
                <span className="text-xs font-label tracking-widest text-secondary uppercase bg-secondary/10 px-4 py-2 rounded-full font-bold">
                  {history.length} total
                </span>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-5xl text-textSecondary/20 mb-3 block">history</span>
                  <p className="text-textSecondary/60 font-headline font-bold">No history for the selected range</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-left">
                        {["Provider", "Service", "Date & Time", "Status", "Action"].map((h) => (
                          <th key={h} className="pb-1 px-4 text-xs font-label uppercase tracking-widest text-textSecondary font-bold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((a) => (
                        <tr key={a.id} className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                          <td className="py-4 px-4 rounded-l-2xl border-l-2 border-transparent">
                            <div className="text-sm font-bold text-textPrimary">{a.providerName}</div>
                            {a.providerPhone && <div className="text-xs text-textSecondary font-mono mt-0.5">{a.providerPhone}</div>}
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-primary">{a.serviceName || "Appointment"}</td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-textPrimary">{a.date}</div>
                            <div className="text-xs text-textSecondary">{a.startTime} – {a.endTime}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={statusPill(a.status)}>{a.status}</span>
                          </td>
                          <td className="py-4 px-4 rounded-r-2xl">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setSelectedAppointmentId(a.id)}
                                className="flex items-center gap-1 text-xs font-bold text-primary hover:scale-[1.05] transition-all"
                              >
                                <span className="material-symbols-outlined text-sm">info</span>
                                Details
                              </button>
                              {canReview(a) && (
                                <button
                                  onClick={() => setReviewTarget({ appointmentId: a.id, providerId: a.providerId })}
                                  className="flex items-center gap-1 text-xs font-bold text-coral hover:scale-[1.05] transition-all"
                                >
                                  <span className="material-symbols-outlined text-sm">star</span>
                                  Rate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* ════════════════ PROFILE TAB ════════════════════════ */}
        {tab === "profile" && (
          <div className="space-y-8">
            <GlassCard className="!p-6 md:!p-8 shadow-2xl">
              <h2 className="text-xl font-headline font-bold text-textPrimary mb-6">Profile Settings</h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 border-2 border-glassBorder flex items-center justify-center">
                    {profileForm.profileImageUrl ? (
                      <img 
                         src={`${BASE_URL}${profileForm.profileImageUrl.startsWith('/') ? '' : '/'}${profileForm.profileImageUrl}`} 
                         alt="Avatar" 
                         className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-textSecondary">person</span>
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="material-symbols-outlined text-white">photo_camera</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-textPrimary">Profile Picture</h3>
                  <p className="text-xs text-textSecondary mt-1">Click the image to upload a new avatar.</p>
                </div>
              </div>

              <form onSubmit={saveProfile} className="space-y-6 max-w-2xl">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Name" required value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} placeholder="Enter full name" />
                  <Input label="Phone Number" type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="Enter phone number" />
                  <Input label="Pincode" type="text" value={profileForm.pincode} onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })} placeholder="Enter preferred pincode" />
                </div>
                {profileMsg && <p className={`text-sm font-bold mt-2 ${profileMsg.startsWith("✓") ? "text-primary" : "text-coral"}`}>{profileMsg}</p>}
                <div className="mt-4">
                  <Button type="submit" className="w-full text-sm">
                    Save Changes
                  </Button>
                </div>
              </form>
            </GlassCard>

            <div className="glass-card rounded-3xl p-6 md:p-8 border border-coral/30 bg-coral/5 shadow-2xl mt-8">
              <h2 className="text-xl font-headline font-bold text-coral mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Danger Zone
              </h2>
              <p className="text-sm text-textSecondary mb-6">These actions affect your account status.</p>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-glassBorder">
                  <div>
                    <h3 className="font-headline font-bold text-textPrimary">Deactivate Account</h3>
                    <p className="text-xs text-textSecondary mt-1">Temporarily block yourself from booking appointments.</p>
                  </div>
                  <button onClick={deactivateAccount} className="px-5 py-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold text-sm hover:bg-amber-500/20 transition-all whitespace-nowrap">
                    Pause Account
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-coral/10 hover:border-coral/30 transition-colors">
                  <div>
                    <h3 className="font-headline font-bold text-coral">Delete Account</h3>
                    <p className="text-xs text-textSecondary mt-1">Permanently remove your profile and history.</p>
                  </div>
                  <button onClick={deleteAccount} className="px-5 py-2.5 rounded-xl bg-coral/10 text-coral border border-coral/20 font-bold text-sm hover:bg-coral/20 transition-all whitespace-nowrap">
                    Permanently Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Apply as provider CTA */}
        <section className="glass-panel rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-glassBorder bg-secondary/5 mt-10">
          <div>
            <h3 className="font-headline text-xl font-bold text-textPrimary mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">workspace_premium</span>
              Are you a service professional?
            </h3>
            <p className="text-textSecondary text-sm pt-1">
              Apply to become a DLASS provider and grow your business.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/apply-provider")}
            className="shrink-0 text-sm whitespace-nowrap border-secondary/50 text-secondary hover:bg-secondary/10"
          >
            Apply as Provider →
          </Button>
        </section>
      </div>
      <ChatWindow
        isOpen={!!activeChat}
        onClose={() => setActiveChat(null)}
        currentUser={{ id: userId, name: username }}
        otherUserId={activeChat?.id}
        otherUserName={activeChat?.name}
        isMaximized={isChatMaximized}
        onToggleMaximize={() => setIsChatMaximized(!isChatMaximized)}
      />

      <AppointmentDetailModal
        isOpen={!!selectedAppointmentId}
        appointmentId={selectedAppointmentId}
        onClose={() => setSelectedAppointmentId(null)}
        currentUserRole="USER"
        onCancel={(id) => handleCancel(id)}
        onChat={(targetId, targetName) => setActiveChat({ id: targetId, name: targetName })}
      />
      
      <ReviewModal
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        appointmentId={reviewTarget?.appointmentId}
        providerId={reviewTarget?.providerId}
        onSuccess={(id) => setReviewedIds(prev => [...prev, id])}
      />
    </PageWrapper>
  );
}

export default UserDashboard;
