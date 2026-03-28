import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getCategories, getSubCategories } from "../services/catalogService";

const API_BASE = "http://localhost:8080/api";

function StarRating({ rating }) {
  const full = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-sm text-secondary"
          style={{ fontVariationSettings: i < full ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
      <span className="ml-1 text-xs text-on-surface-variant">({rating.toFixed(1)})</span>
    </span>
  );
}

function SearchProviders() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
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

  const selectClass =
    "w-full pl-10 pr-4 py-3.5 bg-surface-container-highest/50 border border-outline-variant/20 rounded-2xl text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:bg-surface-bright transition-all text-sm appearance-none";

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <header className="mb-10 pt-8">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-3">
            Find your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              expert
            </span>
            .
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl">
            Connect with top-tier service providers. Refined scheduling for modern life.
          </p>
        </header>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="glass-card rounded-3xl p-6 md:p-8 mb-12 shadow-2xl"
        >
          {error && (
            <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Category *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                  category
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                  className={selectClass}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Subcategory *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                  workspaces
                </span>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  disabled={!selectedCategory}
                  required
                  className={`${selectClass} ${!selectedCategory ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">Select Subcategory</option>
                  {subCategories.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                City
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                  location_city
                </span>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full pl-10 pr-4 py-3.5 bg-surface-container-highest/50 border border-outline-variant/20 rounded-2xl text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:bg-surface-bright transition-all text-sm"
                />
              </div>
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Pincode
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                  location_on
                </span>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 400001"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3.5 bg-surface-container-highest/50 border border-outline-variant/20 rounded-2xl text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:bg-surface-bright transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-headline font-black text-base shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-xl">search</span>
                Search Providers
              </span>
            )}
          </button>
        </form>

        {/* Results */}
        {hasSearched && !loading && results.length === 0 && (
          <div className="glass-panel rounded-3xl p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">
              search_off
            </span>
            <p className="text-xl font-headline font-bold text-on-surface-variant/50 mb-2">
              No providers found
            </p>
            <p className="text-sm text-on-surface-variant/40">
              Try a different city, pincode, or broader category.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <p className="text-on-surface-variant text-sm mb-6 font-label tracking-wide">
              Found{" "}
              <strong className="text-white">
                {results.length}
              </strong>{" "}
              provider{results.length !== 1 ? "s" : ""}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((provider) => (
                <div
                  key={provider.id}
                  onClick={() => navigate(`/provider/${provider.id}`)}
                  className="glass-card rounded-2xl p-1 group hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(93,230,255,0.15)] transition-all duration-500 cursor-pointer"
                >
                  <div className="bg-surface-container-low rounded-xl overflow-hidden p-6 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center ring-2 ring-white/10 group-hover:ring-secondary/40 transition-all shrink-0">
                        <span className="material-symbols-outlined text-3xl text-white">
                          business_center
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-widest uppercase border border-primary/20">
                        {provider.experienceYears}+ yrs
                      </span>
                    </div>

                    <h3 className="font-headline text-lg font-bold text-white mb-1">
                      {provider.businessName}
                    </h3>
                    <p className="text-on-surface-variant text-sm mb-4 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-secondary">
                        location_on
                      </span>
                      {provider.area ? `${provider.area}, ` : ""}
                      {provider.city}
                      {provider.pincode ? ` – ${provider.pincode}` : ""}
                    </p>

                    <StarRating rating={provider.rating} />
                    <p className="text-xs text-on-surface-variant/60 mt-1 mb-4">
                      {provider.reviewCount} review{provider.reviewCount !== 1 ? "s" : ""}
                    </p>

                    {provider.services && provider.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {provider.services.slice(0, 3).map((svc) => (
                          <span
                            key={svc}
                            className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-label tracking-widest uppercase rounded-full"
                          >
                            {svc}
                          </span>
                        ))}
                        {provider.services.length > 3 && (
                          <span className="text-xs text-on-surface-variant/50">
                            +{provider.services.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-end border-t border-white/5">
                      <button className="text-secondary font-headline font-bold text-sm hover:underline underline-offset-4 decoration-2 transition-all flex items-center gap-1">
                        View Profile
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
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