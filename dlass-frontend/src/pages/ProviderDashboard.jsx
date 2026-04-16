import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { getToken } from "../services/authService";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import DynamicHeader from "../components/DynamicHeader";
import ChatWindow from "../components/ChatWindow";
import AppointmentDetailModal from "../components/AppointmentDetailModal";
import PageWrapper from "../components/ui/PageWrapper";
import StatCard from "../components/ui/StatCard";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import AvailabilityCalendar from "../components/AvailabilityCalendar";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${BASE_URL}/api`;
const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

function getRangeLabel(range) {
  const r = range?.toLowerCase();
  switch(r) {
    case "1d": return "Last 1 Day";
    case "3d": return "Last 3 Days";
    case "7d": return "Last 7 Days";
    case "15d": return "Last 15 Days";
    case "1m": return "Last 1 Month";
    case "3m": return "Last 3 Months";
    case "6m": return "Last 6 Months";
    case "1y": return "Last 1 Year";
    default: return "Last 7 Days";
  }
}

// ── Recharts custom tooltip ──────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, prefix = "", suffix = "" }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-inputBg backdrop-blur-xl border border-glassBorder rounded-xl px-4 py-2 text-sm shadow-xl">
        <p className="text-textSecondary text-xs mb-1">{label}</p>
        <p className="font-bold text-primary">
          {prefix}{payload[0].value}{suffix}
        </p>
      </div>
    );
  }
  return null;
}

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsChatMaximized(false);
  }, [location.pathname]);

  const [tab, setTab] = useState("appointments");
  const [providerId, setProviderId] = useState(null);
  const [providerInfo, setProviderInfo] = useState(null);
  const [userName, setUserName] = useState("Provider");
  const [userId, setUserId] = useState(null);

  // Services
  const [services, setServices] = useState([]);
  const [categoryServices, setCategoryServices] = useState([]);
  const [svcForm, setSvcForm] = useState({ name: "", price: "", duration: 30 });
  const [svcMsg, setSvcMsg] = useState("");

  // Availability
  const [availability, setAvailability] = useState([]);
  const [availForm, setAvailForm] = useState({ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "18:00" });
  const [availMsg, setAvailMsg] = useState("");
  const [editingAvailId, setEditingAvailId] = useState(null);
  const [editAvailForm, setEditAvailForm] = useState({ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "18:00" });
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Appointments
  const [appointments, setAppointments] = useState([]);
  const [apptDate, setApptDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  // History
  const [history, setHistory] = useState([]);
  const [historyDays, setHistoryDays] = useState(30);

  // Profile
  const [profileForm, setProfileForm] = useState({ phone: "", city: "", area: "", pincode: "", profileImageUrl: "" });
  const [profileMsg, setProfileMsg] = useState("");


  // Analytics
  const [bookingsWeek, setBookingsWeek] = useState([]);
  const [revenueMonth, setRevenueMonth] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState("7d");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Portfolio
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Chat
  const [activeChat, setActiveChat] = useState(null);
  const [isChatMaximized, setIsChatMaximized] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (location.state?.openChatWith) {
      setActiveChat(location.state.openChatWith);
      window.history.replaceState({}, document.title);
    }
    if (location.state?.tab) {
      setTab(location.state.tab);
    }
  }, [location]);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        console.log("Token in use:", getToken());
        const [dashboardRes, meRes] = await Promise.all([
          axios.get(`${API}/provider/dashboard`, { headers: authHeaders() }),
          axios.get(`${API}/users/me`, { headers: authHeaders() })
        ]);
        console.log("Dashboard API Response:", dashboardRes.data);
        console.log("Users Me API Response:", meRes.data);
        
        if (!dashboardRes.data || !dashboardRes.data.providerId) {
          throw new Error("Missing providerId in response data");
        }

        setProviderId(dashboardRes.data.providerId);
        setProviderInfo(dashboardRes.data);
        setUserName(meRes.data.fullName || "Provider");
        setUserId(meRes.data.id);

        setProfileForm({
          fullName: meRes.data.fullName || "",
          username: meRes.data.username || meRes.data.email || "",
          businessName: dashboardRes.data.businessName || "",
          email: meRes.data.email || "",
          phone: dashboardRes.data.phone || "",
          city: dashboardRes.data.city || "",
          area: dashboardRes.data.area || "",
          pincode: dashboardRes.data.pincode || "",
          profileImageUrl: dashboardRes.data.profileImageUrl || "",
          createdAt: dashboardRes.data.createdAt || meRes.data.createdAt,
          status: dashboardRes.data.status || (dashboardRes.data.isActive ? "ACTIVE" : "INACTIVE")
        });

        // Global fetch for reviews to use in multiple tabs
        axios.get(`${API}/reviews/provider/${dashboardRes.data.providerId}`)
          .then(r => setReviews(r.data))
          .catch(() => {});
      } catch (err) {
        console.error("Dashboard Init Error:", err);
        setError("Could not load dashboard. Make sure you are an approved provider.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // ── Services tab ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!providerId || tab !== "services") return;
    axios.get(`${API}/providers/${providerId}/services`).then((r) => setServices(r.data));
    if (providerInfo?.subCategoryId) {
      axios
        .get(`${API}/catalog/subcategories?categoryId=${providerInfo.categoryId}`)
        .then((r) => {
          const sub = r.data.find((sc) => sc.id === providerInfo.subCategoryId);
          if (sub?.services?.length) setCategoryServices(sub.services);
        })
        .catch(() => {});
    }
  }, [providerId, tab, providerInfo]);

  // ── Availability tab ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!providerId || tab !== "availability") return;
    axios.get(`${API}/provider-availability/provider/${providerId}`).then((r) => setAvailability(r.data));
  }, [providerId, tab]);

  // ── Appointments tab ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!providerId || tab !== "appointments") return;
    axios
      .get(`${API}/appointments/provider`, {
        headers: authHeaders(),
        params: { date: apptDate || undefined },
      })
      .then((r) => setAppointments(r.data))
      .catch(() => setAppointments([]));
  }, [providerId, tab, apptDate]);

  // ── History tab ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!providerId || tab !== "history") return;
    axios.get(`${API}/appointments/history`, {
      headers: authHeaders(),
      params: { days: historyDays }
    })
    .then(r => setHistory(r.data))
    .catch(() => setHistory([]));
  }, [providerId, tab, historyDays]);

  // Fetch all appointments for calendar markers
  useEffect(() => {
    if (!providerId) return;
    axios.get(`${API}/appointments/provider`, { headers: authHeaders() })
      .then(r => setAppointments(r.data))
      .catch(() => {});
  }, [providerId]);

  // ── Analytics tab ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!providerId || tab !== "analytics") return;
    setAnalyticsLoading(true);
    const params = { range: analyticsRange };
    Promise.all([
      axios.get(`${API}/provider/dashboard/bookings-week`, { headers: authHeaders(), params }),
      axios.get(`${API}/provider/dashboard/revenue-month`, { headers: authHeaders(), params }),
      axios.get(`${API}/provider/dashboard/peak-hours`, { headers: authHeaders(), params }),
      axios.get(`${API}/provider/dashboard/recommendations`, { headers: authHeaders(), params }),
    ])
      .then(([bw, rm, ph, rec]) => {
        setBookingsWeek(bw?.data || []);
        setRevenueMonth(rm?.data || []);
        // Show top 12 peak hours for readability
        setPeakHours((ph?.data || []).slice(0, 12).map(h => ({ ...h, label: `${h.hour}:00` })));
        setRecommendations(rec?.data || []);
      })
      .catch((err) => {
        console.error("Analytics fetch error:", err);
      })
      .finally(() => setAnalyticsLoading(false));
  }, [providerId, tab, analyticsRange]);

  // ── Portfolio tab ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!providerId || tab !== "portfolio") return;
    axios.get(`${API}/provider/${providerId}/portfolio`).then((r) => setPortfolioImages(r.data)).catch(() => {});
  }, [providerId, tab]);

  // ── Reviews tab ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!providerId || tab !== "reviews") return;
    // We already fetch reviews globally on init, but we can refresh here if needed
    setReviewsLoading(true);
    axios
      .get(`${API}/reviews/provider/${providerId}`)
      .then((r) => setReviews(r.data))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [providerId, tab]);

  // ── Add Service ───────────────────────────────────────────────────────────
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

  // ── Add Availability ──────────────────────────────────────────────────────
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

  async function deleteAvailability(id) {
    if (!window.confirm("Remove this availability slot?")) return;
    try {
      await axios.delete(`${API}/provider-availability/${id}`, { headers: authHeaders() });
      setAvailability((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      alert("Failed to delete: " + (e.response?.data?.message || e.message));
    }
  }

  async function saveAvailEdit(id) {
    try {
      const res = await axios.put(
        `${API}/provider-availability/${id}`,
        { dayOfWeek: editAvailForm.dayOfWeek, startTime: editAvailForm.startTime, endTime: editAvailForm.endTime },
        { headers: authHeaders() }
      );
      setAvailability((prev) => prev.map((a) => (a.id === id ? res.data : a)));
      setEditingAvailId(null);
    } catch (e) {
      alert("Failed to update: " + (e.response?.data?.message || e.message));
    }
  }

  async function cancelAppointmentByProvider(id) {
    if (!window.confirm("Cancel this appointment? The customer will be notified.")) return;
    try {
      await axios.put(`${API}/appointments/${id}/cancel-by-provider`, {}, { headers: authHeaders() });
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a)));
    } catch (e) {
      alert("Failed to cancel: " + (e.response?.data?.message || e.message));
    }
  }

  // ── Profile Actions ────────────────────────────────────────────────────────
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant Preview
    const previewUrl = URL.createObjectURL(file);
    const oldUrl = profileForm.profileImageUrl;
    setProfileForm(prev => ({ ...prev, profileImageUrl: previewUrl }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      setProfileMsg("Uploading avatar...");
      const res = await axios.post(`${API}/providers/upload-avatar`, formData, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });
      setProfileForm((prev) => ({ ...prev, profileImageUrl: res.data }));
      setProfileMsg("✓ Profile picture updated!");
      window.dispatchEvent(new Event("profile-update"));
      
      // Clean up object URL
      setTimeout(() => URL.revokeObjectURL(previewUrl), 10000);
    } catch (err) {
      console.error(err);
      setProfileForm(prev => ({ ...prev, profileImageUrl: oldUrl }));
      setProfileMsg("✕ Failed to upload avatar.");
    }
  };

  async function saveProfile(e) {
    if (e) e.preventDefault();
    try {
      setProfileMsg("Saving changes...");
      const res = await axios.put(`${API}/providers/profile`, profileForm, { headers: authHeaders() });
      setProfileMsg("✓ Profile updated successfully!");
      setIsEditingProfile(false);
      
      // Update local state with saved data
      setUserName(profileForm.fullName);
      setProviderInfo(prev => ({ ...prev, ...profileForm }));
      
      // Dispatch event to sync Navbar
      window.dispatchEvent(new Event("profile-update"));
    } catch (e) {
      setProfileMsg("✕ Failed to update profile: " + (e.response?.data?.message || e.message));
    }
    setTimeout(() => setProfileMsg(""), 4000);
  }

  async function deactivateAccount() {
    if (!window.confirm("Are you sure you want to pause your account? Customers won't be able to find you until an admin reactivates it.")) return;
    try {
      await axios.patch(`${API}/providers/deactivate`, {}, { headers: authHeaders() });
      alert("Account deactivated. You will now be logged out.");
      navigate("/login");
    } catch (e) {
      alert("Failed to deactivate: " + (e.response?.data?.message || e.message));
    }
  }

  async function deleteAccount() {
    if (!window.confirm("CRITICAL: Are you absolutely sure? This permanently deletes your provider data.")) return;
    try {
      await axios.patch(`${API}/providers/delete`, {}, { headers: authHeaders() });
      alert("Account deleted. You will now be logged out.");
      navigate("/login");
    } catch (e) {
      alert("Failed to delete account: " + (e.response?.data?.message || e.message));
    }
  }

  // ── Portfolio upload ───────────────────────────────────────────────────────
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API}/provider/upload-image`, formData, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });
      setPortfolioImages((prev) => [...prev, res.data.filename]);
      setUploadMsg("✓ Image uploaded!");
    } catch (e) {
      setUploadMsg("✕ " + (e.response?.data?.error || "Upload failed."));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setUploadMsg(""), 4000);
    }
  }

  async function deletePortfolioImage(filename) {
    if (!window.confirm("Delete this image?")) return;
    try {
      await axios.delete(`${API}/provider/image/${filename}`, { headers: authHeaders() });
      setPortfolioImages((prev) => prev.filter((f) => f !== filename));
    } catch (e) {
      alert("Failed to delete: " + (e.response?.data?.error || e.message));
    }
  }

  // ── Style helpers ─────────────────────────────────────────────────────────
  const inputClass = "w-full px-4 py-3 bg-inputBg border border-inputBorder rounded-xl text-textPrimary placeholder:text-textSecondary/40 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm";
  const labelClass = "block text-xs font-label font-bold text-textSecondary uppercase tracking-widest mb-1.5 flex items-center gap-1";
  const statusBadge = (status) => {
    if (status === "BOOKED") return "bg-primary/10 text-primary border-primary/30";
    if (status === "CANCELLED") return "bg-coral/10 text-coral border-coral/20";
    if (status === "COMPLETED") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    return "bg-black/5 dark:bg-white/5 text-textSecondary border-glassBorder";
  };

  const TABS = [
    { key: "appointments", icon: "calendar_month", label: "Appointments" },
    { key: "history", icon: "history", label: "History" },
    { key: "services", icon: "build", label: "Services" },
    { key: "availability", icon: "schedule", label: "Availability" },
    { key: "analytics", icon: "bar_chart", label: "Analytics" },
    { key: "reviews", icon: "rate_review", label: "Reviews" },
    { key: "portfolio", icon: "photo_library", label: "Portfolio" },
    { key: "profile", icon: "person", label: "Profile" },
  ];

  if (loading)
    return (
      <PageWrapper className="min-h-screen flex flex-col items-center justify-center pt-16">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-textSecondary/60 font-label tracking-widest uppercase text-xs font-bold">Loading Dashboard...</p>
      </PageWrapper>
    );
  if (error)
    return (
      <PageWrapper className="min-h-screen flex items-center justify-center pt-16">
        <div className="bg-coral/10 border border-coral/20 rounded-2xl p-6 text-center max-w-sm">
          <span className="material-symbols-outlined text-coral text-4xl mb-3 block">error</span>
          <p className="text-coral font-bold">{error}</p>
        </div>
      </PageWrapper>
    );

  const stats = {
    totalRevenue: revenueMonth.reduce((acc, r) => acc + r.revenue, 0),
    totalBookings: bookingsWeek.reduce((acc, b) => acc + b.count, 0),
    avgRating: providerInfo?.rating || 0,
    totalReviews: reviews.length,
    upcomingCount: appointments.filter(a => a.status === "BOOKED").length,
    ratingDistribution: [1, 2, 3, 4, 5].map(star => ({
      star: `${star} Stars`,
      count: reviews.filter(r => r.rating === star).length
    }))
  };

  const getHeader = () => {
    switch(tab) {
      case "appointments": return { title: "Manage your bookings", sub: "Track and manage your upcoming schedule." };
      case "history": return { title: "Schedule History", sub: "Review your past appointments and performance." };
      case "services": return { title: "Your Services", sub: "Add or modify the services you offer." };
      case "availability": return { title: "Working Hours", sub: "Define when customers can book you." };
      case "analytics": return { title: "Performance Insights", sub: "Deep dive into your earnings and trends." };
      case "reviews": return { title: "Client Feedback", sub: "What customers are saying about your service." };
      case "portfolio": return { title: "Your Portfolio", sub: "Showcase your best work to new clients." };
      case "profile": return { title: "Profile Settings", sub: "Update your business details and location." };
      default: return { title: "Dashboard", sub: "Overview of your platform activity." };
    }
  };
  const headerInfo = getHeader();

  return (
    <PageWrapper className="pt-24 pb-16 px-4 md:px-8">
      <div className={`transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] max-w-7xl mx-auto pt-8 space-y-10 ${!!activeChat && isChatMaximized ? 'lg:w-1/2 lg:max-w-none lg:mr-auto lg:pr-6' : 'w-full'}`}>
        {/* Header + Tab Nav */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <h1 className="text-3xl font-headline font-extrabold tracking-tight text-textPrimary">
                {headerInfo.title}
             </h1>
            <p className="text-textSecondary text-sm">
              {headerInfo.sub}
            </p>
          </div>

          <div className="flex flex-wrap bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl w-fit gap-1 border border-gray-200 dark:border-gray-700">
            {TABS.map(({ key, icon, label }) => (
              <button
                key={key}
                id={`tab-${key}`}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  tab === key
                    ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                    : "text-textSecondary hover:text-textPrimary"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{icon}</span>
                <span className="hidden lg:inline">{label}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} icon="payments" trend="up" trendValue="+8%" />
          <StatCard title="Total Bookings" value={stats.totalBookings} icon="event" color="secondary" />
          <StatCard title="Avg Rating" value={stats.avgRating.toFixed(1)} icon="star" color="warning" />
          <StatCard title="Client Reviews" value={stats.totalReviews} icon="rate_review" color="secondary" />
        </div>

        {/* ════════════════ APPOINTMENTS TAB ════════════════════ */}
        {tab === "appointments" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className={labelClass}>Filter by Date</label>
                <input
                  type="date"
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                  className={`${inputClass} max-w-[220px]`}
                />
              </div>
              {apptDate && (
                <button
                  onClick={() => setApptDate("")}
                  className="mt-5 px-4 py-2.5 rounded-xl border border-glassBorder bg-black/10 dark:bg-white/10 text-textSecondary text-sm hover:bg-black/15 dark:bg-white/15 transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>

            <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-headline font-bold tracking-tight text-textPrimary">Bookings</h2>
                <span className="text-xs font-label tracking-widest text-textSecondary uppercase bg-white/5 px-4 py-2 rounded-full">
                  {appointments.length} total
                </span>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-5xl text-textSecondary/20 mb-3 block">event_busy</span>
                  <p className="text-textSecondary/50 font-headline font-bold">No bookings for the selected view</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-left">
                        {["Customer", "Service", "Date & Time", "Status", "Action"].map((h) => (
                          <th key={h} className="pb-1 px-4 text-xs font-label uppercase tracking-widest text-textSecondary font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((a) => (
                        <tr key={a.id} className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 transition-colors">
                          <td className="py-4 px-4 rounded-l-2xl border-l-4 border-primary">
                            <div className="text-sm font-bold text-textPrimary">{a.userName}</div>
                            <div className="text-xs text-textSecondary">{a.userEmail}</div>
                            {a.userPhone && <div className="text-xs text-textSecondary font-mono mt-0.5">{a.userPhone}</div>}
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-primary">{a.serviceName || "Appointment"}</td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-textPrimary">{a.date}</div>
                            <div className="text-xs text-textSecondary">{a.startTime} – {a.endTime}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 border rounded-full text-xs font-bold ${statusBadge(a.status)}`}>{a.status}</span>
                          </td>
                          <td className="py-4 px-4 rounded-r-2xl">
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={() => setSelectedAppointmentId(a.id)}
                                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-container transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">info</span>
                                Details
                              </button>
                              <button
                                onClick={() => setActiveChat({ id: a.userId, name: a.userName })}
                                className="flex items-center gap-1 text-xs font-bold text-secondary hover:text-secondary-container transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">chat</span>
                                Chat
                              </button>
                              {a.status === "BOOKED" && (
                                <button
                                  onClick={() => cancelAppointmentByProvider(a.id)}
                                  className="flex items-center gap-1 text-xs font-bold text-coral hover:text-coral/80 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-sm">cancel</span>
                                  Cancel
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
            </div>
          </div>
        )}

        {/* ════════════════ HISTORY TAB ════════════════════════ */}
        {tab === "history" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className={labelClass}>Time Range</label>
                <select
                  value={historyDays}
                  onChange={(e) => setHistoryDays(Number(e.target.value))}
                  className={inputClass}
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
                <h2 className="text-xl font-headline font-bold tracking-tight text-textPrimary">Past Appointments</h2>
                <span className="text-xs font-label tracking-widest text-textSecondary uppercase bg-white/5 px-4 py-2 rounded-full">
                  {history.length} total
                </span>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-5xl text-textSecondary/20 mb-3 block">history</span>
                  <p className="text-textSecondary/50 font-headline font-bold">No history for the selected range</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-left">
                        {["Customer", "Service", "Date & Time", "Status", "Action"].map((h) => (
                          <th key={h} className="pb-1 px-4 text-xs font-label uppercase tracking-widest text-textSecondary font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((a) => (
                        <tr key={a.id} className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 transition-colors">
                          <td className="py-4 px-4 rounded-l-2xl border-l-2 border-surface-container-highest">
                            <div className="text-sm font-bold text-textPrimary">{a.userName}</div>
                            <div className="text-xs text-textSecondary">{a.userEmail}</div>
                            {a.userPhone && <div className="text-xs text-textSecondary font-mono mt-0.5">{a.userPhone}</div>}
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-primary">{a.serviceName || "Appointment"}</td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-textPrimary">{a.date}</div>
                            <div className="text-xs text-textSecondary">{a.startTime} – {a.endTime}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 border rounded-full text-xs font-bold ${statusBadge(a.status)}`}>{a.status}</span>
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

        {/* ════════════════ SERVICES TAB ════════════════════════ */}
        {tab === "services" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <div className="glass-card rounded-3xl p-6 md:p-8">
                <h2 className="text-xl font-headline font-bold text-textPrimary mb-6">Add New Service</h2>
                <form onSubmit={addService} className="space-y-4">
                  <div>
                    <label className={labelClass}>Service Name *</label>
                    {categoryServices.length > 0 ? (
                      <select required value={svcForm.name} onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })} className={inputClass}>
                        <option value="" disabled>Select a service</option>
                        {categoryServices.map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                    ) : (
                      <input type="text" required placeholder="Enter service name" value={svcForm.name} onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })} className={inputClass} />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Price (₹) *</label>
                      <input type="number" min="0" step="0.01" required placeholder="e.g. 499" value={svcForm.price} onChange={(e) => setSvcForm({ ...svcForm, price: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Duration (min) *</label>
                      <input type="number" min="10" max="240" required value={svcForm.duration} onChange={(e) => setSvcForm({ ...svcForm, duration: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  {svcMsg && <p className={`text-sm font-bold ${svcMsg.startsWith("✓") ? "text-green-400" : "text-coral"}`}>{svcMsg}</p>}
                  <button type="submit" className="w-full py-3.5 rounded-xl bg-primary text-black font-headline font-bold text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all">
                    Add Service
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-xl font-headline font-bold text-textPrimary">My Services</h2>
              {services.length === 0 ? (
                <div className="bg-black/5 dark:bg-white/5 border border-glassBorder rounded-2xl p-10 text-center">
                  <span className="material-symbols-outlined text-4xl text-textSecondary/20 mb-2 block">category</span>
                  <p className="text-textSecondary/50 text-sm">No services added yet.</p>
                </div>
              ) : (
                services.map((s) => (
                  <div key={s.id} className="glass-card rounded-2xl p-5 flex justify-between items-center hover:scale-[1.01] transition-transform">
                    <div>
                      <div className="font-headline font-bold text-textPrimary">{s.name}</div>
                      <div className="text-xs text-textSecondary mt-1">⏱ {s.durationMinutes} min</div>
                    </div>
                    <div className="text-2xl font-headline font-black text-primary">₹{s.price}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ════════════════ AVAILABILITY TAB ════════════════════ */}
        {tab === "availability" && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Calendar */}
              <div className="lg:col-span-7">
                <AvailabilityCalendar 
                  availability={availability} 
                  appointments={appointments} 
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
                
                {/* Weekly Rules Summary */}
                <div className="mt-8 glass-card rounded-3xl p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-headline font-bold text-textPrimary">Weekly Schedule Rules</h3>
                    <button 
                      onClick={() => document.getElementById('add-avail-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Add Rule
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availability.length === 0 ? (
                      <p className="col-span-full text-center py-4 text-textSecondary/40 text-xs italic">No weekly rules set.</p>
                    ) : (
                      availability.map((a) => (
                        <div key={a.id} className="flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-glassBorder group hover:border-primary/20 transition-all">
                          <div>
                            <div className="text-[10px] font-label font-black text-textSecondary uppercase tracking-widest">{a.dayOfWeek}</div>
                            <div className="text-xs font-bold text-textPrimary">{a.startTime} – {a.endTime}</div>
                          </div>
                          <button onClick={() => deleteAvailability(a.id)} className="p-2 opacity-0 group-hover:opacity-100 rounded-lg bg-coral/10 text-coral hover:bg-coral/20 transition-all">
                            <span className="material-symbols-outlined text-xs">delete</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Day Detail & Add Form */}
              <div className="lg:col-span-5 space-y-8">
                {/* Day Detail View */}
                <div className="glass-card rounded-3xl p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex flex-col items-center justify-center text-primary">
                       <span className="text-[10px] font-black uppercase leading-none">{selectedDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                       <span className="text-xl font-headline font-black leading-none">{selectedDate.getDate()}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-headline font-bold text-textPrimary">{selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}</h3>
                      <p className="text-xs text-textSecondary">Viewing all slots for this date</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {(() => {
                      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
                      const dateStr = selectedDate.toISOString().split('T')[0];
                      const rules = availability.filter(a => a.dayOfWeek === dayName);
                      const dayAppts = appointments.filter(app => app.date === dateStr && app.status !== "CANCELLED");

                      if (rules.length === 0) {
                        return <div className="text-center py-10 text-textSecondary/40 text-xs italic">No availability set for {dayName}s.</div>;
                      }

                      return rules.map((rule, idx) => (
                        <div key={idx} className="space-y-4">
                           <div className="flex items-center gap-2 mb-2">
                             <div className="h-[1px] flex-1 bg-glassBorder" />
                             <span className="text-[10px] font-label font-bold text-textSecondary uppercase tracking-widest">{rule.startTime} – {rule.endTime} Window</span>
                             <div className="h-[1px] flex-1 bg-glassBorder" />
                           </div>
                           
                           {/* Highlight appointments that fall in this range */}
                           {dayAppts.length > 0 ? (
                             dayAppts.map(ap => (
                               <div key={ap.id} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                                      <span className="material-symbols-outlined text-amber-500 text-sm">event_busy</span>
                                   </div>
                                   <div>
                                      <div className="text-xs font-bold text-textPrimary">{ap.userName}</div>
                                      <div className="text-[10px] text-textSecondary">{ap.startTime} – {ap.endTime}</div>
                                   </div>
                                 </div>
                                 <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Booked</span>
                               </div>
                             ))
                           ) : (
                             <div className="p-8 text-center rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                               <span className="material-symbols-outlined text-emerald-400 text-3xl mb-2">check_circle</span>
                               <p className="text-xs font-bold text-emerald-500/60 uppercase racking-widest">Fully Open for Bookings</p>
                             </div>
                           )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Add Rule Form */}
                <div id="add-avail-form" className="glass-card rounded-3xl p-6 md:p-8 border border-primary/20 shadow-xl shadow-primary/5">
                  <h3 className="text-xl font-headline font-bold text-textPrimary mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">add_circle</span>
                    Define Working Hours
                  </h3>
                  <form onSubmit={addAvailability} className="space-y-5">
                    <div>
                      <label className={labelClass}>Day of Week</label>
                      <select value={availForm.dayOfWeek} onChange={(e) => setAvailForm({ ...availForm, dayOfWeek: e.target.value })} className={inputClass}>
                        {DAYS.map((d) => (<option key={d} value={d}>{d}</option>))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Start Time</label>
                        <input type="time" value={availForm.startTime} onChange={(e) => setAvailForm({ ...availForm, startTime: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>End Time</label>
                        <input type="time" value={availForm.endTime} onChange={(e) => setAvailForm({ ...availForm, endTime: e.target.value })} className={inputClass} />
                      </div>
                    </div>
                    {availMsg && <p className={`text-center text-sm font-bold ${availMsg.startsWith("✓") ? "text-green-400" : "text-coral"}`}>{availMsg}</p>}
                    <button type="submit" className="w-full py-4 rounded-xl bg-primary text-deep-navy font-headline font-black text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
                      Save Weekly Rule
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════ ANALYTICS TAB ════════════════════════ */}
        {tab === "analytics" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-2xl p-4">
              <h2 className="text-lg font-headline font-bold text-textPrimary">Time Range</h2>
              <div className="flex flex-wrap items-center gap-2">
                {["1d", "3d", "7d", "1m", "3m", "1y"].map(r => (
                  <button key={r} onClick={() => setAnalyticsRange(r)} className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${analyticsRange === r ? "bg-primary text-white" : "bg-black/10 dark:bg-white/10 text-textSecondary hover:bg-black/15 dark:bg-white/15"}`}>
                    {r}
                  </button>
                ))}
                <select value={analyticsRange} onChange={(e) => setAnalyticsRange(e.target.value)} className="bg-inputBg backdrop-blur-md border border-glassBorder rounded-xl px-3 py-1.5 text-xs text-textPrimary focus:outline-none">
                  <option value="1d">1 Day</option>
                  <option value="3d">3 Days</option>
                  <option value="7d">7 Days</option>
                  <option value="15d">15 Days</option>
                  <option value="1m">1 Month</option>
                  <option value="3m">3 Months</option>
                  <option value="6m">6 Months</option>
                  <option value="1y">1 Year</option>
                </select>
              </div>
            </div>

            {analyticsLoading ? (
              <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-28 bg-black/10 dark:bg-white/10 rounded-2xl" />)}
                </div>
                <div className="h-64 bg-black/10 dark:bg-white/10 rounded-3xl" />
                <div className="h-64 bg-black/10 dark:bg-white/10 rounded-3xl" />
              </div>
            ) : (
              <>
                {/* Summary KPI cards */}
                {providerInfo && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Total Appointments", value: providerInfo.totalAppointments, icon: "calendar_month", color: "from-primary-container/30 to-primary-container/10" },
                      { label: "Today", value: providerInfo.todayAppointments, icon: "today", color: "from-secondary-container/30 to-secondary-container/10" },
                      { label: "Upcoming", value: providerInfo.upcomingAppointments, icon: "upcoming", color: "from-tertiary-container/30 to-tertiary-container/10" },
                      { label: "Total Revenue", value: `₹${providerInfo.totalRevenue?.toFixed(0) || 0}`, icon: "payments", color: "from-green-500/20 to-green-500/5" },
                    ].map((kpi) => (
                      <div key={kpi.label} className={`glass-card rounded-2xl p-5 bg-gradient-to-br ${kpi.color}`}>
                        <span className="material-symbols-outlined text-2xl text-primary mb-2 block">{kpi.icon}</span>
                        <div className="text-2xl font-headline font-black text-textPrimary">{kpi.value}</div>
                        <div className="text-xs text-textSecondary font-label tracking-widest uppercase mt-1">{kpi.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bookings per Week — Line Chart */}
                <div className="glass-card rounded-3xl p-6 md:p-8">
                  <h2 className="text-lg font-headline font-bold text-textPrimary mb-1">Bookings — {getRangeLabel(analyticsRange)}</h2>
                  <p className="text-xs text-textSecondary mb-6">Daily booking count trend</p>
                  {bookingsWeek.length === 0 ? (
                    <div className="text-center py-10 text-textSecondary/40 text-sm">No data available.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={bookingsWeek}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                        <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip suffix=" bookings" />} />
                        <Line type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2.5} dot={{ fill: "#5de6ff", r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Revenue per Month — Bar Chart */}
                <div className="glass-card rounded-3xl p-6 md:p-8">
                  <h2 className="text-lg font-headline font-bold text-textPrimary mb-1">Revenue — {getRangeLabel(analyticsRange)}</h2>
                  <p className="text-xs text-textSecondary mb-6">Monthly revenue from completed appointments (₹)</p>
                  {revenueMonth.length === 0 ? (
                    <div className="text-center py-10 text-textSecondary/40 text-sm">No data available.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={revenueMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 11 }} tickFormatter={(m) => m.slice(5)} />
                        <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip prefix="₹" />} />
                        <Bar dataKey="revenue" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Peak Hours — Bar Chart */}
                <div className="glass-card rounded-3xl p-6 md:p-8">
                  <h2 className="text-lg font-headline font-bold text-textPrimary mb-1">Peak Booking Hours — {getRangeLabel(analyticsRange)}</h2>
                  {peakHours.length === 0 ? (
                    <div className="text-center py-10 text-textSecondary/40 text-sm">No booking data yet.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={peakHours}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                        <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip suffix=" bookings" />} />
                        <Bar dataKey="count" fill="#fb7185" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>



                {/* Rating Distribution — Bar Chart */}
                <div className="glass-card rounded-3xl p-6 md:p-8">
                  <h2 className="text-lg font-headline font-bold text-textPrimary mb-1">Rating Distribution</h2>
                  <p className="text-xs text-textSecondary mb-6">Overview of client satisfaction (1–5 Stars)</p>
                  {stats.totalReviews === 0 ? (
                    <div className="text-center py-10 text-textSecondary/40 text-sm italic">No reviews received yet.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={stats.ratingDistribution} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="star" type="category" tick={{ fill: "#9ca3af", fontSize: 11 }} width={50} />
                        <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip suffix=" reviews" />} />
                        <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Recent Reviews Preview in Analytics */}
                <div className="glass-card rounded-3xl p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-amber-500 text-xl">reviews</span>
                      </div>
                      <h2 className="text-lg font-headline font-bold text-textPrimary">Recent Client Feedback</h2>
                    </div>
                    <button onClick={() => setTab("reviews")} className="text-xs font-bold text-primary hover:underline">View All</button>
                  </div>
                  
                  {reviews.length === 0 ? (
                    <p className="text-center py-6 text-textSecondary/40 text-sm italic">No feedback received in the last 30 days.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {reviews.slice(0, 3).map((rev) => (
                        <div key={rev.id} className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-glassBorder flex flex-col h-full hover:border-primary/20 transition-all">
                          <div className="flex items-center gap-0.5 mb-2">
                            {[1,2,3,4,5].map(s => (
                              <span key={s} className={`material-symbols-outlined text-[12px] ${rev.rating >= s ? 'text-amber-500' : 'text-gray-300 dark:text-gray-700'}`} style={{ fontVariationSettings: rev.rating >= s ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                            ))}
                          </div>
                          <p className="text-xs text-textPrimary line-clamp-3 italic flex-1 mb-3">"{rev.comment || 'Perfect service!'}"</p>
                          <div className="flex items-center justify-between border-t border-glassBorder pt-2 mt-auto">
                            <span className="text-[10px] font-bold text-textSecondary uppercase tracking-tighter truncate max-w-[80px]">{rev.userName || 'Client'}</span>
                            <span className="text-[9px] text-textSecondary opacity-50">{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        {/* ════════════════ REVIEWS TAB ═════════════════════════ */}
        {tab === "reviews" && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-headline font-bold tracking-tight text-textPrimary">Client Feedback</h2>
                <span className="text-xs font-label tracking-widest text-textSecondary uppercase bg-white/5 px-4 py-2 rounded-full">
                  {reviews.length} total reviews
                </span>
              </div>

              {reviewsLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                  <p className="text-textSecondary/60 font-label tracking-widest uppercase text-xs font-bold">Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-6xl text-textSecondary/20 mb-3 block">rate_review</span>
                  <p className="text-textSecondary font-headline font-bold text-lg">No reviews yet.</p>
                  <p className="text-sm text-textSecondary/60 mt-1">Feedback from completed appointments will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="glass-card !bg-white/5 dark:!bg-black/5 hover:!bg-white/10 dark:hover:!bg-black/10 rounded-2xl p-6 border border-glassBorder transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`material-symbols-outlined text-sm ${rev.rating >= star ? 'text-amber-500' : 'text-gray-300 dark:text-gray-700'}`}
                              style={{ fontVariationSettings: rev.rating >= star ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-textSecondary uppercase tracking-widest font-bold bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Recently"}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        {rev.comment ? (
                          <p className="text-textPrimary text-sm leading-relaxed italic group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            "{rev.comment}"
                          </p>
                        ) : (
                          <p className="text-textSecondary/50 italic text-sm">No comment provided.</p>
                        )}
                        
                        <div className="pt-4 border-t border-glassBorder flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                               <span className="material-symbols-outlined text-indigo-500 text-sm">person</span>
                             </div>
                             <span className="text-xs font-bold text-textPrimary">{rev.userName || "Customer"}</span>
                           </div>
                           {rev.appointmentId && (
                             <span className="text-[10px] text-textSecondary font-mono opacity-50">Appt #{rev.appointmentId}</span>
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════ PORTFOLIO TAB ════════════════════════ */}
        {tab === "portfolio" && (
          <div className="space-y-8">
            {/* Upload Section */}
            <div className="glass-card rounded-3xl p-6 md:p-8">
              <h2 className="text-xl font-headline font-bold text-textPrimary mb-2">Portfolio Gallery</h2>
              <p className="text-xs text-textSecondary mb-6">Upload images showcasing your work (JPEG, PNG, WebP, GIF — max 5 MB each)</p>

              <div
                className="border-2 border-dashed border-glassBorder rounded-2xl p-10 text-center hover:border-primary/40 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="material-symbols-outlined text-5xl text-textSecondary/30 group-hover:text-primary/50 transition-all block mb-3">
                  {uploading ? "hourglass_top" : "cloud_upload"}
                </span>
                <p className="font-headline font-bold text-textSecondary/60 text-sm">
                  {uploading ? "Uploading…" : "Click to upload an image"}
                </p>
                <p className="text-xs text-textSecondary/40 mt-1">or drag and drop</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageUpload}
                  id="portfolio-file-input"
                />
              </div>

              {uploadMsg && (
                <p className={`mt-3 text-sm font-bold text-center ${uploadMsg.startsWith("✓") ? "text-green-400" : "text-coral"}`}>
                  {uploadMsg}
                </p>
              )}
            </div>

            {/* Image Grid */}
            {portfolioImages.length === 0 ? (
              <div className="bg-black/5 dark:bg-white/5 border border-glassBorder rounded-3xl p-16 text-center">
                <span className="material-symbols-outlined text-5xl text-textSecondary/20 mb-4 block">photo_library</span>
                <p className="font-headline font-bold text-textSecondary/40">No portfolio images yet.</p>
                <p className="text-xs text-textSecondary/30 mt-1">Upload images to showcase your work to clients.</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-label font-bold uppercase tracking-widest text-textSecondary">
                    {portfolioImages.length} image{portfolioImages.length !== 1 ? "s" : ""}
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {portfolioImages.map((filename) => (
                    <div
                      key={filename}
                      className="relative group rounded-2xl overflow-hidden aspect-square bg-black/5 dark:bg-white/5 border border-glassBorder"
                    >
                      <img
                        src={`${BASE_URL}/uploads/provider/${filename}`}
                        alt="Portfolio"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => deletePortfolioImage(filename)}
                          className="p-2.5 rounded-xl bg-red-500/80 text-white hover:bg-red-600 transition-all"
                          title="Delete image"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-all">
                        <p className="text-white text-[9px] font-mono truncate">{filename}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* ════════════════ PROFILE TAB ════════════════════════ */}
        {tab === "profile" && (
          <div className="space-y-8 animate-fade-in">
            {isEditingProfile ? (
              <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl border-primary/20">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-headline font-bold text-textPrimary">Edit Profile Settings</h2>
                  <button onClick={() => setIsEditingProfile(false)} className="text-textSecondary hover:text-textPrimary flex items-center gap-1 text-sm font-bold">
                    <span className="material-symbols-outlined text-sm">close</span> Cancel
                  </button>
                </div>
                
                <div className="flex items-center gap-6 mb-10 p-4 rounded-3xl bg-primary/5 border border-primary/10">
                  <div className="relative group/avatar">
                    <Avatar 
                      src={profileForm.profileImageUrl ? (profileForm.profileImageUrl.startsWith('blob:') ? profileForm.profileImageUrl : `${BASE_URL}${profileForm.profileImageUrl.startsWith('/') ? '' : '/'}${profileForm.profileImageUrl}`) : null} 
                      name={profileForm.fullName || userName} 
                      size="lg" 
                      glow={true}
                    />
                    <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer z-10">
                      <span className="material-symbols-outlined text-white">photo_camera</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-textPrimary">Profile Picture</h3>
                    <p className="text-xs text-textSecondary mt-1">Update your professional profile photo.</p>
                  </div>
                </div>

                <form onSubmit={saveProfile} className="space-y-6 max-w-3xl">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Full Name</label>
                      <input type="text" value={profileForm.fullName} onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} className={inputClass} placeholder="Full Name" />
                    </div>
                    <div>
                      <label className={labelClass}>Business Name</label>
                      <input type="text" value={profileForm.businessName} onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })} className={inputClass} placeholder="Business Name" />
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className={inputClass} placeholder="Enter phone" />
                    </div>
                    <div>
                      <label className={labelClass}>City</label>
                      <input type="text" value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} className={inputClass} placeholder="Enter city" />
                    </div>
                    <div>
                      <label className={labelClass}>Area</label>
                      <input type="text" value={profileForm.area} onChange={(e) => setProfileForm({ ...profileForm, area: e.target.value })} className={inputClass} placeholder="Enter area" />
                    </div>
                    <div>
                      <label className={labelClass}>Pincode</label>
                      <input type="text" value={profileForm.pincode} onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })} className={inputClass} placeholder="Enter pincode" />
                    </div>
                  </div>
                  {profileMsg && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${profileMsg.startsWith("✓") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-coral/10 text-coral border border-coral/20"}`}>
                      <span className="material-symbols-outlined text-sm">{profileMsg.startsWith("✓") ? "check_circle" : "error"}</span>
                      <p className="text-sm font-bold">{profileMsg}</p>
                    </div>
                  )}
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="flex-1 py-4 rounded-2xl bg-black/10 dark:bg-white/10 text-textPrimary font-headline font-bold text-sm uppercase tracking-widest hover:bg-black/20 transition-all border border-glassBorder">
                      Discard
                    </button>
                    <button type="submit" className="flex-[2] py-4 rounded-2xl bg-primary text-deep-navy font-headline font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20">
                      Save Profile
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                 {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors" />
                
                <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
                   <Avatar 
                    src={profileForm.profileImageUrl ? `${BASE_URL}${profileForm.profileImageUrl.startsWith('/') ? '' : '/'}${profileForm.profileImageUrl}` : null} 
                    name={profileForm.businessName || profileForm.fullName || userName} 
                    size="xl" 
                    glow={true}
                    className="shrink-0"
                  />
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-4xl font-headline font-black text-textPrimary tracking-tight">
                        {profileForm.businessName || profileForm.fullName || userName}
                      </h2>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 flex items-center gap-1.5 ring-4 ring-primary/5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          Verified Professional
                        </span>
                        <span className="text-textSecondary text-[10px] font-bold uppercase tracking-widest opacity-60">Status: {profileForm.status || "ACTIVE"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 pt-4">
                      {[
                        { icon: "person", label: "Full Name", value: profileForm.fullName || "Not set" },
                        { icon: "account_circle", label: "Username", value: profileForm.username || "Not set" },
                        { icon: "business", label: "Business", value: profileForm.businessName || "Not set" },
                        { icon: "mail", label: "Email", value: profileForm.email || "Not set" },
                        { icon: "phone", label: "Contact", value: profileForm.phone || "Not set" },
                        { icon: "location_on", label: "Location", value: profileForm.city && profileForm.area ? `${profileForm.area}, ${profileForm.city}` : profileForm.city || profileForm.area || "Not set" },
                        { icon: "pin_drop", label: "Pincode", value: profileForm.pincode || "Not set" },
                        { icon: "calendar_month", label: "Member Since", value: profileForm.createdAt ? new Date(profileForm.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "April 2026" },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-3 group/item">
                          <div className="w-9 h-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover/item:border-primary/40 transition-colors">
                            <span className="material-symbols-outlined text-lg text-primary">{item.icon}</span>
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[10px] text-textSecondary uppercase font-bold tracking-widest opacity-40">{item.label}</p>
                            <p className="text-sm font-bold text-textPrimary leading-none truncate">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6">
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="px-8 py-3.5 rounded-2xl bg-primary text-deep-navy font-headline font-black text-sm uppercase tracking-widest hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                        Edit Public Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="glass-card rounded-3xl p-6 md:p-8 border border-coral/20 bg-red-500/5 shadow-2xl">
              <h2 className="text-xl font-headline font-bold text-coral mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-coral">report_problem</span>
                Danger Zone
              </h2>
              <p className="text-sm text-textSecondary mb-6">These actions affect your account status. Please proceed with caution.</p>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-glassBorder group hover:border-amber-500/30 transition-colors">
                  <div>
                    <h3 className="font-headline font-bold text-textPrimary group-hover:text-amber-500 transition-colors">Deactivate Account</h3>
                    <p className="text-xs text-textSecondary mt-1">Temporarily hide your profile from customers. Requires Admin approval to reactivate.</p>
                  </div>
                  <button onClick={deactivateAccount} className="px-6 py-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold text-sm hover:bg-amber-500/20 transition-all whitespace-nowrap">
                    Pause Account
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-coral/10 hover:border-coral/30 transition-colors group">
                  <div>
                    <h3 className="font-headline font-bold text-coral group-hover:text-red-500 transition-colors">Delete Account</h3>
                    <p className="text-xs text-textSecondary mt-1">Permanently remove your provider profile. This action cannot be undone.</p>
                  </div>
                  <button onClick={deleteAccount} className="px-6 py-2.5 rounded-xl bg-coral/10 text-coral border border-coral/20 font-bold text-sm hover:bg-coral/20 transition-all whitespace-nowrap">
                    Permanently Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ChatWindow
        isOpen={!!activeChat}
        onClose={() => setActiveChat(null)}
        currentUser={{ id: userId, name: userName }}
        otherUserId={activeChat?.id}
        otherUserName={activeChat?.name}
        isMaximized={isChatMaximized}
        onToggleMaximize={() => setIsChatMaximized(!isChatMaximized)}
      />

      <AppointmentDetailModal
        isOpen={!!selectedAppointmentId}
        appointmentId={selectedAppointmentId}
        onClose={() => setSelectedAppointmentId(null)}
        currentUserRole="PROVIDER"
        onCancel={(id) => cancelAppointmentByProvider(id)}
        onChat={(targetId, targetName) => setActiveChat({ id: targetId, name: targetName })}
      />
    </PageWrapper>
  );
}