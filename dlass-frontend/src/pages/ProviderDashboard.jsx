import { useState, useEffect } from "react";
import axios from "axios";
import { getToken } from "../services/authService";

const API = "http://localhost:8080/api";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

export default function ProviderDashboard() {
  const [tab, setTab] = useState("appointments");
  const [providerId, setProviderId] = useState(null);
  const [providerInfo, setProviderInfo] = useState(null); // full dashboard data incl. categoryId

  // Services
  const [services, setServices] = useState([]);
  const [categoryServices, setCategoryServices] = useState([]); // dynamic from API
  const [svcForm, setSvcForm] = useState({ name: "", price: "", duration: 30 });
  const [svcMsg, setSvcMsg] = useState("");

  // Availability
  const [availability, setAvailability] = useState([]);
  const [availForm, setAvailForm] = useState({ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "18:00" });
  const [availMsg, setAvailMsg] = useState("");
  const [editingAvailId, setEditingAvailId] = useState(null);
  const [editAvailForm, setEditAvailForm] = useState({ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "18:00" });

  // Appointments
  const [appointments, setAppointments] = useState([]);
  const [apptDate, setApptDate] = useState(new Date().toISOString().split("T")[0]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Init: load dashboard & provider info ──────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const res = await axios.get(`${API}/provider/dashboard`, { headers: authHeaders() });
        setProviderId(res.data.providerId);
        setProviderInfo(res.data);
      } catch {
        setError("Could not load dashboard. Make sure you are an approved provider.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // ── Services tab: load provider services & category service list ──────
  useEffect(() => {
    if (!providerId || tab !== "services") return;
    axios.get(`${API}/providers/${providerId}/services`).then((r) => setServices(r.data));

    // Load available services from catalog based on provider's subcategory
    if (providerInfo?.subCategoryId) {
      axios
        .get(`${API}/catalog/subcategories?categoryId=${providerInfo.categoryId}`)
        .then((r) => {
          const sub = r.data.find((sc) => sc.id === providerInfo.subCategoryId);
          if (sub?.services?.length) {
            setCategoryServices(sub.services);
          }
        })
        .catch(() => {});
    }
  }, [providerId, tab, providerInfo]);

  // ── Availability tab ──────────────────────────────────────────────────
  useEffect(() => {
    if (!providerId || tab !== "availability") return;
    axios
      .get(`${API}/provider-availability/provider/${providerId}`)
      .then((r) => setAvailability(r.data));
  }, [providerId, tab]);

  // ── Appointments tab ──────────────────────────────────────────────────
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

  // ── Add Service ───────────────────────────────────────────────────────
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

  // ── Add Availability ──────────────────────────────────────────────────
  async function addAvailability(e) {
    e.preventDefault();
    try {
      await axios.post(
        `${API}/provider-availability`,
        {
          dayOfWeek: availForm.dayOfWeek,
          startTime: availForm.startTime,
          endTime: availForm.endTime,
          slotDuration: 30,
        },
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

  // ── Delete Availability ───────────────────────────────────────────────
  async function deleteAvailability(id) {
    if (!window.confirm("Remove this availability slot?")) return;
    try {
      await axios.delete(`${API}/provider-availability/${id}`, { headers: authHeaders() });
      setAvailability((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      alert("Failed to delete: " + (e.response?.data?.message || e.message));
    }
  }

  // ── Save Availability Edit ────────────────────────────────────────────
  async function saveAvailEdit(id) {
    try {
      const res = await axios.put(
        `${API}/provider-availability/${id}`,
        {
          dayOfWeek: editAvailForm.dayOfWeek,
          startTime: editAvailForm.startTime,
          endTime: editAvailForm.endTime,
        },
        { headers: authHeaders() }
      );
      setAvailability((prev) => prev.map((a) => (a.id === id ? res.data : a)));
      setEditingAvailId(null);
    } catch (e) {
      alert("Failed to update: " + (e.response?.data?.message || e.message));
    }
  }

  // ── Cancel Appointment (by Provider) ─────────────────────────────────
  async function cancelAppointmentByProvider(id) {
    if (!window.confirm("Cancel this appointment? The customer will be notified.")) return;
    try {
      await axios.put(`${API}/appointments/${id}/cancel-by-provider`, {}, { headers: authHeaders() });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a))
      );
    } catch (e) {
      alert("Failed to cancel: " + (e.response?.data?.message || e.message));
    }
  }

  const inputClass =
    "w-full px-4 py-3 bg-surface-container-highest/50 border border-outline-variant/20 rounded-xl text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all text-sm";
  const labelClass =
    "block text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-1.5";

  const statusBadge = (status) => {
    if (status === "BOOKED") return "bg-secondary-container/20 text-secondary";
    if (status === "CANCELLED") return "bg-red-500/10 text-red-300";
    if (status === "COMPLETED") return "bg-green-500/10 text-green-300";
    return "bg-primary-container/20 text-primary";
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="spinner" />
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <p className="text-red-400 text-center max-w-sm">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto pt-8 space-y-10">
        {/* Header + Tab Nav */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-2">
              Provider Dashboard
            </h1>
            <p className="text-on-surface-variant max-w-xl text-sm">
              Manage your workspace, optimize availability, and track upcoming appointments.
            </p>
          </div>

          <div className="flex bg-surface-container-low p-1.5 rounded-full shadow-inner border border-outline-variant/10 shrink-0">
            {[
              { key: "appointments", icon: "calendar_month", label: "Appointments" },
              { key: "services", icon: "build", label: "Services" },
              { key: "availability", icon: "schedule", label: "Availability" },
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
        </header>

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
                  className="mt-5 px-4 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-high text-on-surface-variant text-sm hover:bg-surface-bright transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>

            <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-headline font-bold tracking-tight text-on-surface">
                  Bookings
                </h2>
                <span className="text-xs font-label tracking-widest text-on-surface-variant uppercase bg-white/5 px-4 py-2 rounded-full">
                  {appointments.length} total
                </span>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-3 block">
                    event_busy
                  </span>
                  <p className="text-on-surface-variant/50 font-headline font-bold">
                    No bookings for the selected view
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-left">
                        {["Customer", "Service", "Date & Time", "Status", "Action"].map((h) => (
                          <th
                            key={h}
                            className="pb-1 px-4 text-xs font-label uppercase tracking-widest text-on-surface-variant font-medium"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((a) => (
                        <tr
                          key={a.id}
                          className="bg-surface-container-low hover:bg-surface-container-high transition-colors"
                        >
                          <td className="py-4 px-4 rounded-l-2xl border-l-2 border-primary-container">
                            <div className="text-sm font-bold text-on-surface">{a.userName}</div>
                            <div className="text-xs text-on-surface-variant">{a.userEmail}</div>
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-primary">
                            {a.serviceName || "Appointment"}
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-on-surface">{a.date}</div>
                            <div className="text-xs text-on-surface-variant">
                              {a.startTime} – {a.endTime}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusBadge(a.status)}`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 rounded-r-2xl">
                            {a.status === "BOOKED" && (
                              <button
                                onClick={() => cancelAppointmentByProvider(a.id)}
                                className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">cancel</span>
                                Cancel
                              </button>
                            )}
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
            {/* Add Form */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-3xl p-6 md:p-8">
                <h2 className="text-xl font-headline font-bold text-on-surface mb-6">
                  Add New Service
                </h2>
                <form onSubmit={addService} className="space-y-4">
                  <div>
                    <label className={labelClass}>Service Name *</label>
                    {categoryServices.length > 0 ? (
                      <select
                        required
                        value={svcForm.name}
                        onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })}
                        className={inputClass}
                      >
                        <option value="" disabled>
                          Select a service
                        </option>
                        {categoryServices.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder="Enter service name"
                        value={svcForm.name}
                        onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })}
                        className={inputClass}
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Price (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        placeholder="e.g. 499"
                        value={svcForm.price}
                        onChange={(e) => setSvcForm({ ...svcForm, price: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Duration (min) *</label>
                      <input
                        type="number"
                        min="10"
                        max="240"
                        required
                        value={svcForm.duration}
                        onChange={(e) => setSvcForm({ ...svcForm, duration: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {svcMsg && (
                    <p
                      className={`text-sm font-bold ${
                        svcMsg.startsWith("✓") ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {svcMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-headline font-bold text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Add Service
                  </button>
                </form>
              </div>
            </div>

            {/* Services List */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-xl font-headline font-bold text-on-surface">My Services</h2>
              {services.length === 0 ? (
                <div className="glass-panel rounded-2xl p-10 text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 mb-2 block">
                    category
                  </span>
                  <p className="text-on-surface-variant/50 text-sm">No services added yet.</p>
                </div>
              ) : (
                services.map((s) => (
                  <div
                    key={s.id}
                    className="glass-card rounded-2xl p-5 flex justify-between items-center hover:scale-[1.01] transition-transform"
                  >
                    <div>
                      <div className="font-headline font-bold text-on-surface">{s.name}</div>
                      <div className="text-xs text-on-surface-variant mt-1">⏱ {s.durationMinutes} min</div>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Add Form */}
            <div className="lg:col-span-5">
              <div className="glass-card rounded-3xl p-6 md:p-8">
                <h2 className="text-xl font-headline font-bold text-on-surface mb-6">
                  Add Availability Window
                </h2>
                <form onSubmit={addAvailability} className="space-y-4">
                  <div>
                    <label className={labelClass}>Day of Week</label>
                    <select
                      value={availForm.dayOfWeek}
                      onChange={(e) => setAvailForm({ ...availForm, dayOfWeek: e.target.value })}
                      className={inputClass}
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Start Time</label>
                      <input
                        type="time"
                        value={availForm.startTime}
                        onChange={(e) => setAvailForm({ ...availForm, startTime: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>End Time</label>
                      <input
                        type="time"
                        value={availForm.endTime}
                        onChange={(e) => setAvailForm({ ...availForm, endTime: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {availMsg && (
                    <p
                      className={`text-sm font-bold ${
                        availMsg.startsWith("✓") ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {availMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-headline font-bold text-sm uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Save Schedule
                  </button>
                </form>
              </div>
            </div>

            {/* Availability List with Edit/Delete */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-xl font-headline font-bold text-on-surface">Working Hours</h2>
              {availability.length === 0 ? (
                <div className="glass-panel rounded-2xl p-10 text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 mb-2 block">
                    event_available
                  </span>
                  <p className="text-on-surface-variant/50 text-sm">
                    No availability windows set yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availability.map((a) => (
                    <div key={a.id} className="glass-card rounded-2xl px-5 py-4">
                      {editingAvailId === a.id ? (
                        /* ── Inline Edit Form ── */
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <select
                              value={editAvailForm.dayOfWeek}
                              onChange={(e) =>
                                setEditAvailForm({ ...editAvailForm, dayOfWeek: e.target.value })
                              }
                              className={`${inputClass} col-span-1`}
                            >
                              {DAYS.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                            <input
                              type="time"
                              value={editAvailForm.startTime}
                              onChange={(e) =>
                                setEditAvailForm({ ...editAvailForm, startTime: e.target.value })
                              }
                              className={inputClass}
                            />
                            <input
                              type="time"
                              value={editAvailForm.endTime}
                              onChange={(e) =>
                                setEditAvailForm({ ...editAvailForm, endTime: e.target.value })
                              }
                              className={inputClass}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveAvailEdit(a.id)}
                              className="flex-1 py-2 rounded-xl bg-green-500/20 text-green-300 border border-green-500/30 text-sm font-bold hover:bg-green-500/30 transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingAvailId(null)}
                              className="flex-1 py-2 rounded-xl bg-surface-container-high text-on-surface-variant text-sm font-bold hover:bg-surface-bright transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── Display Row ── */
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-container/30 flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-lg">
                                event
                              </span>
                            </div>
                            <div>
                              <span className="font-headline font-bold text-on-surface text-sm block">
                                {a.dayOfWeek}
                              </span>
                              <span className="text-secondary font-mono text-sm font-bold">
                                {a.startTime} – {a.endTime}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingAvailId(a.id);
                                setEditAvailForm({
                                  dayOfWeek: a.dayOfWeek,
                                  startTime: a.startTime,
                                  endTime: a.endTime,
                                });
                              }}
                              className="p-2 rounded-xl bg-white/5 text-on-surface-variant hover:text-white hover:bg-white/10 transition-all"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button
                              onClick={() => deleteAvailability(a.id)}
                              className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}