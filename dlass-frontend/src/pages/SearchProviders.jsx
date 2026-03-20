import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchProviders } from "../services/providerService";
import { CATEGORY_MAP } from "../services/categoryMap";

// ── Star rating component ─────────────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <span className="stars" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? "star filled" : "star"}>
          ★
        </span>
      ))}
      <span className="rating-num">({rating?.toFixed(1) ?? "N/A"})</span>
    </span>
  );
}

// ── Provider card ─────────────────────────────────────────────────────────────
function ProviderCard({ provider }) {
  const navigate = useNavigate();
  return (
    <div className="provider-card">
      <div className="provider-card-header">
        <h3 className="provider-name">{provider.businessName}</h3>
        <span className="provider-exp">{provider.experienceYears} yrs exp.</span>
      </div>
      <p className="provider-location">
        📍 {provider.area}, {provider.city} – <strong>{provider.pincode}</strong>
      </p>
      <div className="provider-rating">
        <StarRating rating={provider.rating} />
        <span className="review-count">{provider.reviewCount || 0} reviews</span>
      </div>
      <button
        className="btn-secondary"
        onClick={() => navigate(`/search?categoryId=${provider.categoryId}&subCategoryId=${provider.subCategoryId}&pincode=${provider.pincode}`)}
      >
        View Area
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
function SearchProviders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "");
  const [subCategoryId, setSubCategoryId] = useState(searchParams.get("subCategoryId") || "");
  const [pincode, setPincode] = useState(searchParams.get("pincode") || "");
  
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Derive subcategories based on selected category
  const selectedCategoryObj = CATEGORY_MAP.find((c) => c.name === categoryId);
  const subCategories = selectedCategoryObj ? selectedCategoryObj.subcategories : [];

  // Reset subcategory when category changes
  useEffect(() => {
    if (!selectedCategoryObj) {
      setSubCategoryId("");
    } else if (subCategoryId && !subCategories.find((sc) => sc.name === subCategoryId)) {
      setSubCategoryId("");
    }
  }, [categoryId]);

  const doSearch = useCallback(async (catId, subCatId, pin) => {
    const trimmedPin = pin.trim();
    if (!catId) {
      setError("Please select a category.");
      return;
    }
    if (!subCatId) {
      setError("Please select a subcategory.");
      return;
    }
    if (!trimmedPin) {
      setError("Please enter a pincode.");
      return;
    }
    if (!/^\d{4,10}$/.test(trimmedPin)) {
      setError("Pincode must be 4–10 digits.");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);
    setProviders([]);

    try {
      const data = await searchProviders(catId, subCatId, trimmedPin);
      setProviders(data);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "";
      setError(msg || "Failed to fetch providers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search if parameters are in URL on mount
  useEffect(() => {
    const urlCat = searchParams.get("categoryId");
    const urlSubCat = searchParams.get("subCategoryId");
    const urlPincode = searchParams.get("pincode");
    if (urlCat && urlSubCat && urlPincode) {
      setCategoryId(urlCat);
      setSubCategoryId(urlSubCat);
      setPincode(urlPincode);
      doSearch(urlCat, urlSubCat, urlPincode);
    }
  }, []); // run once on mount

  const handleSearch = () => {
    if (categoryId && subCategoryId && pincode.trim()) {
      setSearchParams({ categoryId, subCategoryId, pincode: pincode.trim() });
    }
    doSearch(categoryId, subCategoryId, pincode);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Find Service Providers</h1>
      <p className="page-subtitle">Select a category and enter a pincode to discover providers near you</p>

      <div className="search-bar" style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "stretch", maxWidth: "600px", margin: "0 auto 2rem auto" }}>
        <select 
          value={categoryId} 
          onChange={(e) => setCategoryId(e.target.value)} 
          className="search-input"
          style={{ width: "100%" }}
        >
          <option value="">-- Select Category --</option>
          {CATEGORY_MAP.map((cat) => (
            <option key={cat.name} value={cat.name}>{cat.name}</option>
          ))}
        </select>

        <select 
          value={subCategoryId} 
          onChange={(e) => setSubCategoryId(e.target.value)} 
          className="search-input"
          disabled={!categoryId}
          style={{ width: "100%" }}
        >
          <option value="">-- Select Subcategory --</option>
          {subCategories.map((sc) => (
            <option key={sc.name} value={sc.name}>{sc.name}</option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            id="pincode-input"
            placeholder="e.g. 400001"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={10}
            disabled={loading}
            className="search-input"
            style={{ flex: 1 }}
          />
          <button
            id="search-btn"
            onClick={handleSearch}
            disabled={loading}
            className="btn-primary"
            style={{ whiteSpace: "nowrap" }}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <div className="alert alert-error" style={{ maxWidth: "600px", margin: "0 auto 1rem auto" }}>{error}</div>}

      {/* Loading skeleton */}
      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Finding providers in <strong>{pincode}</strong>…</p>
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && providers.length === 0 && !error && (
        <div className="empty-state">
          <p>😕 No active providers found for <strong>{subCategoryId}</strong> in pincode <strong>{pincode}</strong>.</p>
          <p>Try a nearby pincode or check for typos.</p>
        </div>
      )}

      {!loading && providers.length > 0 && (
        <>
          <p className="result-count">
            Found <strong>{providers.length}</strong> active provider{providers.length !== 1 ? "s" : ""}
          </p>
          <div className="provider-grid">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SearchProviders;