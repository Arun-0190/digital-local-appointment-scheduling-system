import { useState, useEffect } from "react";
import { getPendingProviders, approveProvider, rejectProvider } from "../services/providerService";
import { getCategories } from "../services/catalogService";

function AdminDashboard() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nameMap, setNameMap] = useState({});

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const data = await getPendingProviders();
      setProviders(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load pending providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories()
      .then((cats) => {
        const map = {};
        cats.forEach((c) => {
          map[c.id] = c.name;
          (c.subcategories || []).forEach((sc) => {
            map[sc.id] = sc.name;
          });
        });
        setNameMap(map);
      })
      .catch(console.error);
    fetchProviders();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveProvider(id);
      setProviders(providers.filter((p) => p.id !== id));
      alert("Provider approved successfully");
    } catch (err) {
      alert("Failed to approve provider: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectProvider(id);
      setProviders(providers.filter((p) => p.id !== id));
      alert("Provider rejected successfully");
    } catch (err) {
      alert("Failed to reject provider: " + (err.response?.data?.message || err.message));
    }
  };

  const resolveName = (id) => nameMap[id] || id;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="spinner" />
      </div>
    );

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-5xl mx-auto pt-8 space-y-8">
        {/* Header */}
        <header>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-8 bg-gradient-to-b from-primary-container to-secondary rounded-full" />
            <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-surface">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-on-surface-variant text-sm ml-5">
            Review and manage pending provider applications.
          </p>
        </header>

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            {error}
          </div>
        )}

        {providers.length === 0 ? (
          <div className="glass-panel rounded-3xl p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/20 mb-4 block">
              check_circle
            </span>
            <p className="font-headline text-xl font-bold text-on-surface-variant/50 mb-1">
              No pending applications
            </p>
            <p className="text-on-surface-variant/40 text-sm">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map((p) => (
              <div key={p.id} className="glass-card rounded-3xl p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">
                      {p.businessName}
                    </h3>
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
                        <div className="text-xs text-on-surface-variant font-label tracking-widest uppercase mb-0.5">
                          {label}
                        </div>
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
      </div>
    </div>
  );
}

export default AdminDashboard;
