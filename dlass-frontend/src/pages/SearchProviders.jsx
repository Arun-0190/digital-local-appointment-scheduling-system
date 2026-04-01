import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { getCategories, getSubCategories } from "../services/catalogService";
import { getToken } from "../services/authService";
import DynamicHeader from "../components/DynamicHeader";
import PageWrapper from "../components/ui/PageWrapper";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";
import Dropdown from "../components/ui/Dropdown";

const API_BASE = "http://localhost:8080/api";

const SORT_OPTIONS = [
  { value: "", label: "Relevance (Default)" },
  { value: "rating,desc", label: "Rating: High → Low" },
  { value: "rating,asc", label: "Rating: Low → High" },
  { value: "experience,desc", label: "Experience: High → Low" },
  { value: "experience,asc", label: "Experience: Low → High" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20];

function StarRating({ rating }) {
  const full = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-sm text-indigo-500"
          style={{ fontVariationSettings: i < full ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </span>
      ))}
      <span className="ml-1 text-xs text-textSecondary">({rating.toFixed(1)})</span>
    </span>
  );
}

function SearchProviders() {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [userName, setUserName] = useState("Guest");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [fromPincode, setFromPincode] = useState(false);
  const [autoSearchPending, setAutoSearchPending] = useState(false);

  // Pagination + sorting
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Advanced Filters
  const [minExperience, setMinExperience] = useState("");
  const [minRating, setMinRating] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [availableToday, setAvailableToday] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catName = params.get("category");
    const pin = params.get("pincode");
    if (pin) { setPincode(pin); setFromPincode(true); }
    if (catName) {
      sessionStorage.setItem("_pendingCategory", catName);
      if (pin) setAutoSearchPending(true);
    }
  }, [location.search]);

  useEffect(() => {
    const token = getToken();
    if (token) {
      axios.get(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUserName(res.data.fullName || "User"))
        .catch(() => {});
    }

    getCategories().then((cats) => {
      setCategories(cats);
      const pending = sessionStorage.getItem("_pendingCategory");
      if (pending) {
        sessionStorage.removeItem("_pendingCategory");
        const match = cats.find((c) => c.name.toLowerCase() === pending.toLowerCase());
        if (match) setSelectedCategory(match.id);
      }
    }).catch(() => setError("Failed to load categories."));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      getSubCategories(selectedCategory).then(setSubCategories).catch(console.error);
      setSelectedSubCategory("");
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory]);

  const performSearch = useCallback(async (catId, subCatId, cityVal, pincodeVal, pageNum, pageSz, sortParam, minExp, minRt, minPr, maxPr, avToday) => {
    if (!catId || !subCatId) return;
    setError("");
    setLoading(true);
    setHasSearched(true);

    try {
      const params = {
        categoryId: catId,
        subCategoryId: subCatId,
        page: pageNum,
        size: pageSz,
      };
      if (cityVal?.trim()) params.city = cityVal.trim();
      if (pincodeVal?.trim()) params.pincode = pincodeVal.trim();
      if (sortParam) params.sort = sortParam;
      if (minExp) params.minExperience = minExp;
      if (minRt) params.minRating = minRt;
      if (minPr) params.minPrice = minPr;
      if (maxPr) params.maxPrice = maxPr;
      if (avToday) params.availableToday = true;

      const res = await axios.get(`${API_BASE}/providers/search`, { params });
      const data = res.data;
      setResults(data.content ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotalElements(data.totalElements ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoSearchPending && selectedSubCategory && selectedCategory && pincode) {
      setAutoSearchPending(false);
      performSearch(selectedCategory, selectedSubCategory, "", pincode, 0, pageSize, sort, minExperience, minRating, minPrice, maxPrice, availableToday);
    }
  }, [autoSearchPending, selectedSubCategory, selectedCategory, pincode, performSearch, pageSize, sort, minExperience, minRating, minPrice, maxPrice, availableToday]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !selectedSubCategory) {
      setError("Category and Subcategory are required");
      return;
    }
    setPage(0);
    await performSearch(selectedCategory, selectedSubCategory, city, pincode, 0, pageSize, sort, minExperience, minRating, minPrice, maxPrice, availableToday);
  };

  const goToPage = (newPage) => {
    setPage(newPage);
    performSearch(selectedCategory, selectedSubCategory, city, pincode, newPage, pageSize, sort, minExperience, minRating, minPrice, maxPrice, availableToday);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    if (hasSearched) {
      setPage(0);
      performSearch(selectedCategory, selectedSubCategory, city, pincode, 0, pageSize, newSort, minExperience, minRating, minPrice, maxPrice, availableToday);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    if (hasSearched) {
      setPage(0);
      performSearch(selectedCategory, selectedSubCategory, city, pincode, 0, newSize, sort, minExperience, minRating, minPrice, maxPrice, availableToday);
    }
  };

  const selectClass = "w-full pl-10 pr-4 py-3.5 bg-inputBg border border-inputBorder rounded-xl text-textPrimary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm appearance-none";
  const smallInputClass = "w-full px-4 py-3 bg-inputBg border border-inputBorder rounded-xl text-textPrimary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm";

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <DynamicHeader userName={userName} context="search" />
          <p className="text-textSecondary text-lg max-w-xl">
            Connect with top-tier service providers. Refined scheduling for modern life.
          </p>

          {categories.length > 0 && (
            <div className="mt-8">
              <span className="text-xs font-label text-textSecondary uppercase tracking-widest font-bold mb-3 block">Popular Categories</span>
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 5).map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all shadow-sm ${
                      selectedCategory === cat.id 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20" 
                        : "bg-white dark:bg-gray-800 border-inputBorder text-textSecondary hover:border-primary hover:text-primary"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {fromPincode && pincode && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl text-indigo-600 dark:text-indigo-400 text-sm font-bold">
              <span className="material-symbols-outlined text-base">location_on</span>
              Showing providers near pincode <span className="font-mono">{pincode}</span>
              <button type="button" onClick={() => { setPincode(""); setFromPincode(false); }} className="ml-2 text-xs opacity-70 hover:opacity-100 transition-opacity">
                ✕ Clear
              </button>
            </div>
          )}
        </header>

        <form onSubmit={handleSearch}>
          <GlassCard className="mb-12 shadow-2xl">
            {error && (
              <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-xl bg-coral/10 border border-coral/20 text-coral text-sm">
                <span className="material-symbols-outlined text-base shrink-0">error</span>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Dropdown
                label="Category *"
                icon="category"
                options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
                placeholder="Select Category"
              />

              <Dropdown
                label="Subcategory *"
                icon="workspaces"
                options={subCategories.map(sc => ({ value: sc.id, label: sc.name }))}
                value={selectedSubCategory}
                onChange={(val) => setSelectedSubCategory(val)}
                placeholder={selectedCategory ? "Select Subcategory" : "Select a category first"}
              />

              <div>
                <label className="block text-xs font-label font-bold text-textSecondary uppercase tracking-widest mb-2">City</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary text-lg">location_city</span>
                  <input id="city-input" type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" className="w-full pl-10 pr-4 py-3.5 bg-inputBg border border-inputBorder rounded-xl text-textPrimary placeholder:text-textSecondary/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-label font-bold text-textSecondary uppercase tracking-widest mb-2">Pincode</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary text-lg">location_on</span>
                  <input id="pincode-input" type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="e.g. 400001" maxLength={6} className="w-full pl-10 pr-4 py-3.5 bg-inputBg border border-inputBorder rounded-xl text-textPrimary placeholder:text-textSecondary/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm" />
                </div>
              </div>
            </div>

            <div className="mb-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-1 hover:text-indigo-800 transition-colors"
              >
                <span className="material-symbols-outlined text-base">
                  {showAdvanced ? 'expand_less' : 'expand_more'}
                </span>
                {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
              </button>
            </div>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-glassBorder">
                <div>
                  <label className="block text-xs font-label text-textSecondary uppercase tracking-wider mb-2">Min Rating</label>
                  <input type="number" step="0.5" min="0" max="5" value={minRating} onChange={(e) => setMinRating(e.target.value)} placeholder="e.g. 4.0" className={smallInputClass} />
                </div>
                <div>
                  <label className="block text-xs font-label text-textSecondary uppercase tracking-wider mb-2">Min Experience (Yrs)</label>
                  <input type="number" min="0" value={minExperience} onChange={(e) => setMinExperience(e.target.value)} placeholder="e.g. 3" className={smallInputClass} />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={availableToday} onChange={(e) => setAvailableToday(e.target.checked)} className="w-5 h-5 rounded border-inputBorder text-primary focus:ring-primary/50 bg-inputBg" />
                    <span className="text-sm font-medium text-textPrimary">Available Today</span>
                  </label>
                </div>
                <div>
                  <label className="block text-xs font-label text-textSecondary uppercase tracking-wider mb-2">Min Price (₹)</label>
                  <input type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" className={smallInputClass} />
                </div>
                <div>
                  <label className="block text-xs font-label text-textSecondary uppercase tracking-wider mb-2">Max Price (₹)</label>
                  <input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="5000" className={smallInputClass} />
                </div>
              </div>
            )}

            <Button
              type="submit"
              id="search-btn"
              isLoading={loading}
              className="w-full text-base"
            >
              <span className="material-symbols-outlined text-xl">search</span>
              Search Providers
            </Button>
          </GlassCard>
        </form>

        {hasSearched && !loading && results.length === 0 && (
          <GlassCard className="!p-16 text-center shadow-sm">
            <span className="material-symbols-outlined text-5xl text-textSecondary/30 mb-4 block">search_off</span>
            <p className="text-xl font-headline font-bold text-textSecondary mb-2">No providers found</p>
            <p className="text-sm text-textSecondary/60">Try a different city, pincode, or broader category.</p>
          </GlassCard>
        )}

        {loading && hasSearched && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <GlassCard key={i} className="!p-6 h-[320px] animate-pulse flex flex-col">
                <div className="flex justify-between">
                  <div className="w-16 h-16 rounded-2xl bg-black/10 dark:bg-white/10" />
                  <div className="w-16 h-6 rounded-full bg-black/10 dark:bg-white/10" />
                </div>
                <div className="w-3/4 h-6 mt-6 rounded bg-black/10 dark:bg-white/10" />
                <div className="w-1/2 h-4 mt-2 rounded bg-black/10 dark:bg-white/10" />
                <div className="w-1/3 h-4 mt-4 rounded bg-black/10 dark:bg-white/10" />
              </GlassCard>
            ))}
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex flex-wrap items-center gap-3 bg-glassBorder px-4 py-2 rounded-xl">
                <p className="text-textSecondary text-sm font-label tracking-wide">
                  Found <strong className="text-textPrimary">{totalElements}</strong> provider{totalElements !== 1 ? "s" : ""}
                  {totalPages > 1 && (
                    <span className="ml-2">· Page {page + 1} of {totalPages}</span>
                  )}
                </p>
                {pincode && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[10px]">near_me</span>
                    Near You
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Dropdown
                  icon="sort"
                  options={SORT_OPTIONS}
                  value={sort}
                  onChange={(val) => handleSortChange(val)}
                  className="!py-2 sm:min-w-40 text-sm hidden sm:flex"
                />
                <Dropdown
                  icon="format_list_numbered"
                  options={PAGE_SIZE_OPTIONS.map(s => ({ value: s, label: `${s} per page` }))}
                  value={pageSize}
                  onChange={(val) => handlePageSizeChange(Number(val))}
                  className="!py-2 min-w-32 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {results.map((provider) => (
                <GlassCard
                  key={provider.id}
                  onClick={() => navigate(`/provider/${provider.id}`)}
                  className="!p-0 group hover:shadow-[0_15px_30px_-5px_rgba(79,70,229,0.15)] flex flex-col border border-transparent hover:border-indigo-500/30 overflow-hidden"
                >
                  <div className="bg-white dark:bg-gray-800/80 p-6 h-full flex flex-col transition-colors group-hover:bg-indigo-50/10 dark:group-hover:bg-indigo-900/5">
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                        <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">business_center</span>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold tracking-wider border border-indigo-200 dark:border-indigo-800 uppercase">
                          {provider.experienceYears}+ yrs exp
                        </span>
                        {pincode && provider.pincode === pincode && (
                          <span className="flex items-center gap-1 text-[10px] text-accent font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[10px]">near_me</span>
                            Near You
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-headline text-lg font-bold text-textPrimary mb-1 group-hover:text-indigo-600 transition-colors">{provider.businessName}</h3>
                    <p className="text-textSecondary text-xs mb-4 flex items-center gap-1 opacity-80">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {provider.area ? `${provider.area}, ` : ""}{provider.city}
                    </p>

                    <div className="mb-4">
                      <StarRating rating={provider.rating} />
                      <p className="text-[10px] text-textSecondary/60 mt-1 uppercase tracking-widest font-bold">
                        {provider.reviewCount} total review{provider.reviewCount !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {provider.services && provider.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {provider.services.slice(0, 3).map((svc) => (
                          <span key={svc} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-textSecondary text-[10px] font-semibold rounded-md border border-gray-200 dark:border-gray-600">
                            {svc}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-700">
                       <span className="text-xs font-bold text-indigo-600/60 dark:text-indigo-400/60 tracking-wider uppercase">View Availability</span>
                       <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300 shadow-md shadow-indigo-500/30">
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                       </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 0 || loading}
                  className="!py-2.5 !text-sm"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i;
                    } else if (page < 4) {
                      pageNum = i < 6 ? i : totalPages - 1;
                    } else if (page > totalPages - 5) {
                      pageNum = i === 0 ? 0 : totalPages - 7 + i;
                    } else {
                      const offsets = [-3, -2, -1, 0, 1, 2, 3];
                      pageNum = page + offsets[i];
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                          pageNum === page
                            ? "bg-primary text-deep-navy shadow-md"
                            : "text-textSecondary hover:bg-glassBorder hover:text-textPrimary"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages - 1 || loading}
                  className="!py-2.5 !text-sm"
                >
                  Next
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PageWrapper>
  );
}

export default SearchProviders;