import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getCategories, getSubCategories } from "../services/catalogService";

const API_BASE = "http://localhost:8080/api";

const StarRating = ({ rating }) => {
  return (
    <span style={{ color: "#facc15", fontSize: "1rem" }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
      <span style={{ color: "#888", fontSize: ".85rem", marginLeft: "6px" }}>({rating.toFixed(1)})</span>
    </span>
  );
};

function SearchProviders() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);;
  const [subCategories, setSubCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setError("Failed to load categories."));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      getSubCategories(selectedCategory).then(setSubCategories).catch(console.error);
      setSelectedSubCategory("");
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !selectedSubCategory) {
      setError("Please select a Category and Subcategory before searching.");
      return;
    }
    setError("");
    setLoading(true);
    setHasSearched(true);

    try {
      const params = { categoryId: selectedCategory, subCategoryId: selectedSubCategory };
      if (city.trim()) params.city = city.trim();
      if (pincode.trim()) params.pincode = pincode.trim();

      const res = await axios.get(`${API_BASE}/providers/search`, { params });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1.5px solid #334155",
    background: "#1e293b",
    color: "#f1f5f9",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    flex: "1 1 calc(50% - 12px)",
    minWidth: "220px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", padding: "40px 24px", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Header */}
      <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 40px" }}>
        <h1 style={{ fontSize: "2.4rem", fontWeight: "800", color: "#f1f5f9", marginBottom: "12px" }}>
          Find Service Providers
        </h1>
        <p style={{ color: "#64748b", fontSize: "1.05rem" }}>
          Search for trusted, vetted professionals near you.
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        style={{
          maxWidth: "860px",
          margin: "0 auto 48px",
          background: "#1e293b",
          borderRadius: "20px",
          padding: "32px",
          border: "1px solid #334155",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {error && (
          <div style={{ background: "#450a0a", color: "#fca5a5", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", border: "1px solid #7f1d1d" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {/* Category */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Category *</label>
            <select
              style={inputStyle}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Subcategory *</label>
            <select
              style={{ ...inputStyle, opacity: !selectedCategory ? 0.5 : 1 }}
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={!selectedCategory}
              required
            >
              <option value="">Select Subcategory</option>
              {subCategories.map((sc) => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div style={fieldStyle}>
            <label style={labelStyle}>City</label>
            <input
              type="text"
              style={inputStyle}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai"
            />
          </div>

          {/* Pincode */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Pincode</label>
            <input
              type="text"
              style={inputStyle}
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="e.g. 400001"
              maxLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "24px",
            width: "100%",
            padding: "14px",
            background: loading ? "#334155" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.03em",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Searching..." : "🔍 Search Providers"}
        </button>
      </form>

      {/* Results */}
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        {hasSearched && !loading && results.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔍</div>
            <p style={{ fontSize: "1.15rem" }}>No providers found for your search criteria.</p>
            <p style={{ fontSize: "0.9rem", marginTop: "8px" }}>Try a broader pincode or different city.</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <p style={{ color: "#64748b", marginBottom: "20px", fontSize: "0.9rem" }}>
              Found <strong style={{ color: "#94a3b8" }}>{results.length}</strong> provider{results.length !== 1 ? "s" : ""}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {results.map((provider) => (
                <div
                  key={provider.id}
                  style={{
                    background: "#1e293b",
                    borderRadius: "16px",
                    padding: "24px",
                    border: "1px solid #334155",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    transition: "border-color 0.2s, transform 0.2s",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/provider/${provider.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#6366f1";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#334155";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <h3 style={{ margin: 0, color: "#f1f5f9", fontSize: "1.2rem", fontWeight: "700" }}>
                        {provider.businessName}
                      </h3>
                      <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.9rem" }}>
                        📍 {provider.area ? `${provider.area}, ` : ""}{provider.city}
                        {provider.pincode ? ` – ${provider.pincode}` : ""}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <StarRating rating={provider.rating} />
                      <p style={{ margin: "4px 0 0", color: "#475569", fontSize: "0.8rem" }}>
                        {provider.reviewCount} review{provider.reviewCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                    <span style={{ background: "#0f172a", color: "#818cf8", padding: "4px 12px", borderRadius: "9999px", fontSize: "0.8rem", border: "1px solid #312e81", fontWeight: "600" }}>
                      {provider.experienceYears} yr{provider.experienceYears !== 1 ? "s" : ""} exp.
                    </span>
                    {provider.services && provider.services.slice(0, 4).map((srv) => (
                      <span key={srv} style={{ background: "#1e3a5f", color: "#93c5fd", padding: "4px 12px", borderRadius: "9999px", fontSize: "0.8rem", border: "1px solid #1e40af" }}>
                        {srv}
                      </span>
                    ))}
                    {provider.services && provider.services.length > 4 && (
                      <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
                        +{provider.services.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SearchProviders;