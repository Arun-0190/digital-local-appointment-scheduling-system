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

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-6">
      <div className="max-w-7xl mx-auto pt-8 space-y-10">
        {/* Welcome Header */}
        <header className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
          <div className="space-y-3">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">
              Welcome back,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {username}
              </span>
            </h1>
            <p className="text-on-surface-variant text-base leading-relaxed max-w-md">
              {upcoming.length > 0
                ? `You have ${upcoming.length} upcoming appointment${upcoming.length > 1 ? "s" : ""} this week.`
                : "No upcoming appointments. Book a service now!"}
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

        {/* Main Bento Grid */}
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
                      <button
                        onClick={() => handleCancel(a.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">cancel</span>
                        Cancel
                      </button>
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
    </div>
  );
}

export default UserDashboard;