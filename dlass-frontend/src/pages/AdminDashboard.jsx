import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getToken } from "../services/authService";
import { getPendingProviders, approveProvider, rejectProvider } from "../services/providerService";
import { getCategories } from "../services/catalogService";

const API = "http://localhost:8080/api";

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

// ── Toast Component ──────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  const colors =
    type === "success"
      ? "bg-green-500/20 border-green-500/30 text-green-300"
      : "bg-red-500/20 border-red-500/30 text-red-300";
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl animate-fade-in ${colors}`}
    >
      <span className="material-symbols-outlined text-base">
        {type === "success" ? "check_circle" : "error"}
      </span>
      <span className="text-sm font-bold">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}

// ── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-3xl text-amber-400">warning</span>
          <h3 className="text-xl font-headline font-bold text-on-surface">{title}</h3>
        </div>
        <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-surface-container-high text-on-surface-variant font-headline font-bold text-sm hover:bg-surface-bright transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 font-headline font-bold text-sm hover:bg-red-500/30 transition-all"
          >
            Deactivate
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Search Bar Component ─────────────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search..."}
        className="w-full pl-9 pr-4 py-2.5 bg-surface-container-highest/40 border border-outline-variant/20 rounded-xl text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/30 text-sm transition-all"
      />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const [tab, setTab] = useState("pending");

  // Data states
  const [providers, setProviders] = useState([]);
  const [nameMap, setNameMap] = useState({});
  const [stats, setStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [allProviders, setAllProviders] = useState([]);
  const [appointmentsLastWeek, setAppointmentsLastWeek] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [newProviders, setNewProviders] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [deletedProviders, setDeletedProviders] = useState([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const [userSearch, setUserSearch] = useState("");
  const [providerSearch, setProviderSearch] = useState("");

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  const resolveName = (id) => nameMap[id] || id;

  const headers = authHeaders();

  // ── Tab Data Fetching ────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError("");

    if (tab === "pending") {
      Promise.all([getPendingProviders(), getCategories()])
        .then(([pData, cats]) => {
          setProviders(pData);
          const map = {};
          cats.forEach((c) => {
            map[c.id] = c.name;
            (c.subcategories || []).forEach((sc) => { map[sc.id] = sc.name; });
          });
          setNameMap(map);
        })
        .catch((err) => setError(err.message || "Failed to load"))
        .finally(() => setLoading(false));

    } else if (tab === "stats") {
      Promise.all([
        axios.get(`${API}/admin/stats`, { headers }),
        axios.get(`${API}/admin/weekly-stats`, { headers }),
      ])
        .then(([statsRes, weeklyRes]) => {
          setStats(statsRes.data);
          setWeeklyStats(weeklyRes.data);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));

    } else if (tab === "users") {
      axios.get(`${API}/admin/users`, { headers })
        .then((r) => setUsers(r.data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));

    } else if (tab === "providers") {
      axios.get(`${API}/admin/all-providers`, { headers })
        .then((r) => setAllProviders(r.data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));

    } else if (tab === "appointments") {
      axios.get(`${API}/admin/appointments-last-week`, { headers })
        .then((r) => setAppointmentsLastWeek(r.data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));

    } else if (tab === "newusers") {
      axios.get(`${API}/admin/new-users`, { headers })
        .then((r) => setNewUsers(r.data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));

    } else if (tab === "newproviders") {
      axios.get(`${API}/admin/new-providers`, { headers })
        .then((r) => setNewProviders(r.data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));

    } else if (tab === "deactivatedusers") {
      axios.get(`${API}/admin/users/deleted`, { headers })
        .then((r) => setDeletedUsers(r.data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));

    } else if (tab === "deactivatedproviders") {
      axios.get(`${API}/admin/providers/deleted`, { headers })
        .then((r) => setDeletedProviders(r.data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [tab]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleApprove = async (id) => {
    try {
      await approveProvider(id);
      setProviders((prev) => prev.filter((p) => p.id !== id));
      showToast("Provider approved successfully");
    } catch (err) {
      showToast("Failed to approve: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectProvider(id);
      setProviders((prev) => prev.filter((p) => p.id !== id));
      showToast("Provider rejected");
    } catch (err) {
      showToast("Failed to reject: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const confirmDeleteUser = (id, name) => {
    setModal({
      isOpen: true,
      title: "Deactivate User",
      message: `Are you sure you want to deactivate "${name}"? They will no longer be able to log in. This action can be reversed from the database.`,
      onConfirm: async () => {
        setModal((m) => ({ ...m, isOpen: false }));
        try {
          await axios.delete(`${API}/admin/user/${id}`, { headers: authHeaders() });
          setUsers((prev) => prev.filter((u) => u.id !== id));
          showToast("User removed successfully");
        } catch (err) {
          showToast("Failed: " + (err.response?.data?.message || err.message), "error");
        }
      },
    });
  };

  const confirmDeleteProvider = (id, name) => {
    setModal({
      isOpen: true,
      title: "Deactivate Provider",
      message: `Are you sure you want to deactivate "${name}"? Their profile will be hidden from searches.`,
      onConfirm: async () => {
        setModal((m) => ({ ...m, isOpen: false }));
        try {
          await axios.delete(`${API}/admin/provider/${id}`, { headers: authHeaders() });
          setAllProviders((prev) => prev.filter((p) => p.id !== id));
          showToast("Provider removed successfully");
        } catch (err) {
          showToast("Failed: " + (err.response?.data?.message || err.message), "error");
        }
      },
    });
  };

  const handleReactivateUser = async (id) => {
    try {
      await axios.put(`${API}/admin/users/${id}/reactivate`, {}, { headers: authHeaders() });
      setDeletedUsers((prev) => prev.filter((u) => u.id !== id));
      showToast("User reactivated successfully");
    } catch (err) {
      showToast("Failed: " + (err.response?.data?.message || err.message), "error");
    }
  };

  const handleReactivateProvider = async (id) => {
    try {
      await axios.put(`${API}/admin/providers/${id}/reactivate`, {}, { headers: authHeaders() });
      setDeletedProviders((prev) => prev.filter((p) => p.id !== id));
      showToast("Provider reactivated successfully");
    } catch (err) {
      showToast("Failed: " + (err.response?.data?.message || err.message), "error");
    }
  };

  // ── Filtered Lists ────────────────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    if (!q) return true;
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const filteredProviders = allProviders.filter((p) => {
    const q = providerSearch.toLowerCase();
    if (!q) return true;
    return (
      p.businessName?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.pincode?.includes(q)
    );
  });

  // ── Helpers ──────────────────────────────────────────────────────────────
  const statusColor = (status) => {
    if (status === "ACTIVE") return "bg-green-500/10 text-green-300 border-green-500/20";
    if (status === "PENDING") return "bg-amber-500/10 text-amber-300 border-amber-500/20";
    return "bg-red-500/10 text-red-300 border-red-500/20";
  };

  const TABS = [
    { key: "pending", icon: "hourglass_top", label: "Pending" },
    { key: "stats", icon: "bar_chart", label: "Stats" },
    { key: "users", icon: "group", label: "Users" },
    { key: "providers", icon: "store", label: "Providers" },
    { key: "appointments", icon: "calendar_month", label: "Appointments" },
    { key: "newusers", icon: "person_add", label: "New Users" },
    { key: "newproviders", icon: "storefront", label: "New Providers" },
    { key: "deactivatedusers", icon: "person_off", label: "Deleted Users" },
    { key: "deactivatedproviders", icon: "domain_disabled", label: "Deleted Providers" },
  ];

  const EmptyState = ({ icon, text }) => (
    <div className="glass-panel rounded-3xl p-16 text-center">
      <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-4 block">{icon}</span>
      <p className="font-headline text-lg font-bold text-on-surface-variant/50">{text}</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-8">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal((m) => ({ ...m, isOpen: false }))}
      />

      <div className="max-w-6xl mx-auto pt-8 space-y-8">
        {/* Header */}
        <header>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-8 bg-gradient-to-b from-primary-container to-secondary rounded-full" />
            <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-on-surface-variant text-sm ml-5">
            Manage providers, users, and view platform analytics.
          </p>
        </header>

        {/* Tab Nav — scrollable on mobile */}
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-2 bg-surface-container-low p-1.5 rounded-2xl border border-outline-variant/10 w-fit min-w-full sm:min-w-0">
            {TABS.map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-headline font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
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
        </div>

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* ════════════ PENDING TAB ════════════ */}
            {tab === "pending" && (
              <>
                {providers.length === 0 ? (
                  <EmptyState icon="check_circle" text="No pending applications — all caught up!" />
                ) : (
                  <div className="space-y-4">
                    {providers.map((p) => (
                      <div key={p.id} className="glass-card rounded-3xl p-6 md:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                          <div>
                            <h3 className="text-xl font-headline font-bold text-on-surface">{p.businessName}</h3>
                            <p className="text-on-surface-variant text-sm mt-1">
                              {resolveName(p.categoryId)} › {resolveName(p.subCategoryId)}
                            </p>
                          </div>
                          <span className="self-start sm:self-auto px-3 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-full text-xs font-black tracking-widest uppercase">
                            PENDING
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                          {[
                            { icon: "star", label: "Experience", value: `${p.experienceYears} Years` },
                            { icon: "location_on", label: "Location", value: `${p.city}, ${p.area} (${p.pincode})` },
                            { icon: "build", label: "Services", value: p.services?.join(", ") || "—" },
                            { icon: "description", label: "Description", value: p.description || "—" },
                          ].map(({ icon, label, value }) => (
                            <div key={label} className="flex items-start gap-3 bg-surface-container-low/50 p-3.5 rounded-xl">
                              <span className="material-symbols-outlined text-on-surface-variant text-sm pt-0.5">{icon}</span>
                              <div>
                                <div className="text-xs text-on-surface-variant font-label tracking-widest uppercase mb-0.5">{label}</div>
                                <div className="text-sm text-on-surface font-medium">{value}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(p.id)}
                            className="flex-1 py-3 rounded-xl bg-green-500/20 text-green-300 border border-green-500/30 font-headline font-bold text-sm hover:bg-green-500/30 transition-all flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(p.id)}
                            className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 font-headline font-bold text-sm hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ════════════ STATS TAB ════════════ */}
            {tab === "stats" && (
              <div className="space-y-6">
                {/* Total Stats */}
                {stats && (
                  <>
                    <h2 className="text-lg font-headline font-bold text-on-surface-variant uppercase tracking-widest text-sm">
                      Platform Overview
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {[
                        { icon: "group", label: "Total Users", value: stats.totalUsers, color: "text-blue-300" },
                        { icon: "store", label: "Total Providers", value: stats.totalProviders, color: "text-violet-300" },
                        { icon: "verified", label: "Active Providers", value: stats.activeProviders, color: "text-green-300" },
                        { icon: "block", label: "Inactive Providers", value: stats.inactiveProviders, color: "text-amber-300" },
                        { icon: "calendar_month", label: "All Appointments", value: stats.totalAppointments, color: "text-secondary" },
                      ].map((s) => (
                        <div key={s.label} className="glass-card rounded-2xl p-6 text-center hover:scale-[1.02] transition-transform">
                          <span className={`material-symbols-outlined text-3xl ${s.color} mb-2 block`}>{s.icon}</span>
                          <div className={`text-4xl font-headline font-black ${s.color} mb-1`}>{s.value}</div>
                          <div className="text-xs font-label text-on-surface-variant uppercase tracking-widest">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Weekly Stats */}
                {weeklyStats && (
                  <>
                    <h2 className="text-sm font-headline font-bold text-on-surface-variant uppercase tracking-widest mt-4">
                      Last 7 Days Activity
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { icon: "calendar_month", label: "Appointments", value: weeklyStats.appointmentsLastWeek, color: "text-cyan-300", bg: "from-cyan-500/10 to-blue-500/5" },
                        { icon: "person_add", label: "New Users", value: weeklyStats.newUsers, color: "text-violet-300", bg: "from-violet-500/10 to-purple-500/5" },
                        { icon: "storefront", label: "New Providers", value: weeklyStats.newProviders, color: "text-emerald-300", bg: "from-emerald-500/10 to-green-500/5" },
                      ].map((s) => (
                        <div key={s.label} className={`glass-card rounded-2xl p-8 bg-gradient-to-br ${s.bg} flex items-center gap-5 hover:scale-[1.02] transition-transform`}>
                          <span className={`material-symbols-outlined text-4xl ${s.color}`}>{s.icon}</span>
                          <div>
                            <div className={`text-5xl font-headline font-black ${s.color}`}>{s.value}</div>
                            <div className="text-xs font-label text-on-surface-variant uppercase tracking-widest mt-1">{s.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ════════════ USERS TAB ════════════ */}
            {tab === "users" && (
              <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-headline font-bold text-on-surface">Active Users</h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">Showing only USER role accounts</p>
                  </div>
                  <span className="text-xs font-label tracking-widest text-on-surface-variant uppercase bg-white/5 px-4 py-2 rounded-full">
                    {filteredUsers.length} / {users.length}
                  </span>
                </div>
                <SearchBar
                  value={userSearch}
                  onChange={setUserSearch}
                  placeholder="Search by name or email..."
                />
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-left">
                        {["Name", "Email", "Pincode", "Joined", "Action"].map((h) => (
                          <th key={h} className="pb-2 px-4 text-xs font-label uppercase tracking-widest text-on-surface-variant">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-on-surface-variant/50 text-sm">
                            No users match your search.
                          </td>
                        </tr>
                      ) : filteredUsers.map((u) => (
                        <tr key={u.id} className="bg-surface-container-low hover:bg-surface-container-high transition-colors">
                          <td className="py-3 px-4 rounded-l-xl text-sm font-bold text-on-surface">{u.fullName}</td>
                          <td className="py-3 px-4 text-sm text-on-surface-variant">{u.email}</td>
                          <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{u.pincode || "—"}</td>
                          <td className="py-3 px-4 text-xs text-on-surface-variant">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="py-3 px-4 rounded-r-xl">
                            <button
                              onClick={() => confirmDeleteUser(u.id, u.fullName)}
                              className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">person_off</span>
                              Deactivate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ════════════ PROVIDERS TAB ════════════ */}
            {tab === "providers" && (
              <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-headline font-bold text-on-surface">Active Providers</h2>
                  <span className="text-xs font-label tracking-widest text-on-surface-variant uppercase bg-white/5 px-4 py-2 rounded-full">
                    {filteredProviders.length} / {allProviders.length}
                  </span>
                </div>
                <SearchBar
                  value={providerSearch}
                  onChange={setProviderSearch}
                  placeholder="Search by business name, city, pincode..."
                />
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-left">
                        {["Business", "City", "Pincode", "Rating", "Status", "Action"].map((h) => (
                          <th key={h} className="pb-2 px-4 text-xs font-label uppercase tracking-widest text-on-surface-variant">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProviders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-on-surface-variant/50 text-sm">
                            No providers match your search.
                          </td>
                        </tr>
                      ) : filteredProviders.map((p) => (
                        <tr key={p.id} className="bg-surface-container-low hover:bg-surface-container-high transition-colors">
                          <td className="py-3 px-4 rounded-l-xl text-sm font-bold text-on-surface">{p.businessName}</td>
                          <td className="py-3 px-4 text-sm text-on-surface-variant">{p.city}</td>
                          <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{p.pincode}</td>
                          <td className="py-3 px-4 text-sm text-yellow-300 font-bold">
                            ★ {p.rating?.toFixed(1) || "0.0"}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor(p.status)}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 rounded-r-xl">
                            <button
                              onClick={() => confirmDeleteProvider(p.id, p.businessName)}
                              className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">store_remove</span>
                              Deactivate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ════════════ DEACTIVATED USERS TAB ════════════ */}
            {tab === "deactivatedusers" && (
              <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-headline font-bold text-on-surface">Deactivated Users</h2>
                  <span className="text-xs font-label tracking-widest text-on-surface-variant uppercase bg-white/5 px-4 py-2 rounded-full">
                    {deletedUsers.length} Users
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-left">
                        {["Name", "Email", "Reason", "Action"].map((h) => (
                          <th key={h} className="pb-2 px-4 text-xs font-label uppercase tracking-widest text-on-surface-variant">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {deletedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-on-surface-variant/50 text-sm">
                            No deactivated users.
                          </td>
                        </tr>
                      ) : deletedUsers.map((u) => (
                        <tr key={u.id} className="bg-surface-container-low hover:bg-surface-container-high transition-colors">
                          <td className="py-3 px-4 rounded-l-xl text-sm font-bold text-on-surface opacity-60">{u.fullName}</td>
                          <td className="py-3 px-4 text-sm text-on-surface-variant opacity-60">{u.email}</td>
                          <td className="py-3 px-4 text-sm text-on-surface-variant opacity-60 italic">{u.deactivationReason || "—"}</td>
                          <td className="py-3 px-4 rounded-r-xl">
                            <button
                              onClick={() => handleReactivateUser(u.id)}
                              className="flex items-center gap-1 text-xs font-bold text-green-400 hover:text-green-300 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">person_add</span>
                              Reactivate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ════════════ DEACTIVATED PROVIDERS TAB ════════════ */}
            {tab === "deactivatedproviders" && (
              <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-headline font-bold text-on-surface">Deactivated Providers</h2>
                  <span className="text-xs font-label tracking-widest text-on-surface-variant uppercase bg-white/5 px-4 py-2 rounded-full">
                    {deletedProviders.length} Providers
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                      <tr className="text-left">
                        {["Business", "City", "Reason", "Action"].map((h) => (
                          <th key={h} className="pb-2 px-4 text-xs font-label uppercase tracking-widest text-on-surface-variant">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {deletedProviders.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-on-surface-variant/50 text-sm">
                            No deactivated providers.
                          </td>
                        </tr>
                      ) : deletedProviders.map((p) => (
                        <tr key={p.id} className="bg-surface-container-low hover:bg-surface-container-high transition-colors">
                          <td className="py-3 px-4 rounded-l-xl text-sm font-bold text-on-surface opacity-60">{p.businessName}</td>
                          <td className="py-3 px-4 text-sm text-on-surface-variant opacity-60">{p.city}</td>
                          <td className="py-3 px-4 text-sm text-on-surface-variant opacity-60 italic">{p.deactivationReason || "—"}</td>
                          <td className="py-3 px-4 rounded-r-xl">
                            <button
                              onClick={() => handleReactivateProvider(p.id)}
                              className="flex items-center gap-1 text-xs font-bold text-green-400 hover:text-green-300 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">domain_verification</span>
                              Reactivate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ════════════ APPOINTMENTS LAST WEEK ════════════ */}
            {tab === "appointments" && (
              <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-headline font-bold text-on-surface">Appointments — Last 7 Days</h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">All bookings from the past week</p>
                  </div>
                  <span className="text-xs font-label tracking-widest text-on-surface-variant uppercase bg-white/5 px-4 py-2 rounded-full">
                    {appointmentsLastWeek.length} total
                  </span>
                </div>
                {appointmentsLastWeek.length === 0 ? (
                  <EmptyState icon="event_busy" text="No appointments in the last 7 days" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-left">
                          {["Customer", "Provider", "Service", "Date", "Time", "Status"].map((h) => (
                            <th key={h} className="pb-2 px-4 text-xs font-label uppercase tracking-widest text-on-surface-variant">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {appointmentsLastWeek.map((a, i) => (
                          <tr key={i} className="bg-surface-container-low hover:bg-surface-container-high transition-colors">
                            <td className="py-3 px-4 rounded-l-xl text-sm font-bold text-on-surface">{a.userName}</td>
                            <td className="py-3 px-4 text-sm text-on-surface-variant">{a.providerName}</td>
                            <td className="py-3 px-4 text-sm text-primary">{a.serviceName}</td>
                            <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{a.date}</td>
                            <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{a.time}</td>
                            <td className="py-3 px-4 rounded-r-xl">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor(a.status)}`}>
                                {a.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ════════════ NEW USERS LAST WEEK ════════════ */}
            {tab === "newusers" && (
              <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-headline font-bold text-on-surface">New Users — Last 7 Days</h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">Recently registered user accounts</p>
                  </div>
                  <span className="text-xs font-label tracking-widest text-on-surface-variant uppercase bg-white/5 px-4 py-2 rounded-full">
                    {newUsers.length} new
                  </span>
                </div>
                {newUsers.length === 0 ? (
                  <EmptyState icon="person_off" text="No new users in the last 7 days" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-left">
                          {["Name", "Email", "Registered"].map((h) => (
                            <th key={h} className="pb-2 px-4 text-xs font-label uppercase tracking-widest text-on-surface-variant">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {newUsers.map((u, i) => (
                          <tr key={i} className="bg-surface-container-low hover:bg-surface-container-high transition-colors">
                            <td className="py-3 px-4 rounded-l-xl text-sm font-bold text-on-surface">{u.name}</td>
                            <td className="py-3 px-4 text-sm text-on-surface-variant">{u.email}</td>
                            <td className="py-3 px-4 rounded-r-xl text-xs text-on-surface-variant font-mono">
                              {u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ════════════ NEW PROVIDERS LAST WEEK ════════════ */}
            {tab === "newproviders" && (
              <div className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-headline font-bold text-on-surface">New Providers — Last 7 Days</h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">Recently applied provider accounts</p>
                  </div>
                  <span className="text-xs font-label tracking-widest text-on-surface-variant uppercase bg-white/5 px-4 py-2 rounded-full">
                    {newProviders.length} new
                  </span>
                </div>
                {newProviders.length === 0 ? (
                  <EmptyState icon="store" text="No new providers in the last 7 days" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-left">
                          {["Business", "City", "Status", "Applied"].map((h) => (
                            <th key={h} className="pb-2 px-4 text-xs font-label uppercase tracking-widest text-on-surface-variant">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {newProviders.map((p, i) => (
                          <tr key={i} className="bg-surface-container-low hover:bg-surface-container-high transition-colors">
                            <td className="py-3 px-4 rounded-l-xl text-sm font-bold text-on-surface">{p.businessName}</td>
                            <td className="py-3 px-4 text-sm text-on-surface-variant">{p.city}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor(p.status)}`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 rounded-r-xl text-xs text-on-surface-variant font-mono">
                              {p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
