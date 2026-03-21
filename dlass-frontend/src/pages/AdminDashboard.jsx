import { useState, useEffect } from "react";
import { getPendingProviders, approveProvider, rejectProvider } from "../services/providerService";
import { getCategories } from "../services/catalogService";

function AdminDashboard() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Map of ID → name for categories and subcategories
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

  // Load category / subcategory name map on mount
  useEffect(() => {
    getCategories().then((cats) => {
      const map = {};
      cats.forEach((c) => {
        map[c.id] = c.name;
        (c.subcategories || []).forEach((sc) => {
          map[sc.id] = sc.name;
        });
      });
      setNameMap(map);
    }).catch(console.error);
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

  if (loading) return (
    <div className="page-container">
      <p>Loading pending applications...</p>
    </div>
  );

  return (
    <div className="page-container">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">Review pending provider applications.</p>

      {error && <div className="alert alert-error">{error}</div>}

      {providers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h3>No pending applications</h3>
          <p>All caught up!</p>
        </div>
      ) : (
        <div className="provider-list">
          {providers.map((p) => (
            <div key={p.id} className="provider-card" style={{ marginBottom: "1rem" }}>
              <div className="provider-header">
                <h3>{p.businessName}</h3>
                <span className="badge">PENDING</span>
              </div>
              <div className="provider-body">
                <p><strong>Category:</strong> {resolveName(p.categoryId)} › {resolveName(p.subCategoryId)}</p>
                <p><strong>Services:</strong> {p.services?.join(", ")}</p>
                <p><strong>Experience:</strong> {p.experienceYears} Years</p>
                <p><strong>Location:</strong> {p.city}, {p.area} ({p.pincode})</p>
                <p><strong>Description:</strong> {p.description}</p>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button
                  onClick={() => handleApprove(p.id)}
                  className="btn-primary"
                  style={{ flex: 1, backgroundColor: "#28a745" }}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(p.id)}
                  className="btn-secondary"
                  style={{ flex: 1, backgroundColor: "#dc3545", color: "white", borderColor: "#dc3545" }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
