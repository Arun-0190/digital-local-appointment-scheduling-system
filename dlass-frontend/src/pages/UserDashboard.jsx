import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsername } from "../services/authService";

function UserDashboard() {
  const navigate = useNavigate();
  const username = getUsername();

  const [pincode, setPincode] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);

  const handleQuickSearch = () => {
    const trimmed = pincode.trim();
    if (!trimmed) return;
    // Add to local history (deduped, newest first)
    setSearchHistory((prev) => {
      const filtered = prev.filter((h) => h !== trimmed);
      return [trimmed, ...filtered].slice(0, 5); // keep last 5
    });
    navigate(`/search?pincode=${trimmed}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleQuickSearch();
  };

  return (
    <div className="page-container">
      {/* Welcome header */}
      <div className="dashboard-header">
        <h1 className="page-title">Hello, {username} 👋</h1>
        <p className="page-subtitle">Welcome back to your DLASS dashboard</p>
      </div>

      {/* Quick Search */}
      <section className="dashboard-section">
        <h2 className="section-title">Quick Search</h2>
        <p className="section-desc">Find service providers by pincode instantly.</p>
        <div className="search-bar">
          <input
            id="user-quick-pincode"
            type="text"
            placeholder="Enter pincode (e.g. 400001)"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={10}
            className="search-input"
          />
          <button
            id="user-quick-search-btn"
            onClick={handleQuickSearch}
            className="btn-primary search-btn"
          >
            Find Providers
          </button>
        </div>
      </section>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <section className="dashboard-section">
          <h2 className="section-title">Recent Searches</h2>
          <div className="history-chips">
            {searchHistory.map((pin) => (
              <button
                key={pin}
                className="chip"
                onClick={() => navigate(`/search?pincode=${pin}`)}
              >
                📍 {pin}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="dashboard-section">
        <button
          className="btn-secondary"
          onClick={() => navigate("/search")}
        >
          Browse All Providers →
        </button>
        <div className="dashboard-card action-card">
          <h3>Become a Provider</h3>
          <p>Offer your own services on DLASS to the local community.</p>
          <button
            className="btn-secondary"
            onClick={() => navigate("/apply-provider")}
          >
            Apply Now
          </button>
        </div>
      </section>
    </div>
  );
}

export default UserDashboard;