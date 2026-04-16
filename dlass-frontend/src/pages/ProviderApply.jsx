import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getCategories, getSubCategories } from "../services/catalogService";
import { applyAsProvider } from "../services/providerService";
import { getToken } from "../services/authService";
import axios from "axios";
import { API_URL } from "../services/apiUtils";

const API = API_URL;

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

function ProviderApply() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [existingStatus, setExistingStatus] = useState("");

  // Category/Subcategory data
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);

  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    categoryId: "",
    subCategoryId: "",
    experienceYears: "",
    city: "",
    area: "",
    pincode: "",
  });

  const [selectedServices, setSelectedServices] = useState([]);

  // Check if user already has an application
  useEffect(() => {
    axios
      .get(`${API}/providers/my-status`, { headers: authHeaders() })
      .then((res) => {
        const status = res.data.status;
        if (status !== "NONE") {
          setAlreadyApplied(true);
          setExistingStatus(status);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingStatus(false));
  }, []);

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (formData.categoryId) {
      getSubCategories(formData.categoryId).then(setSubCategories).catch(console.error);
      setFormData((prev) => ({ ...prev, subCategoryId: "" }));
      setSelectedServices([]);
      setAvailableServices([]);
    } else {
      setSubCategories([]);
    }
  }, [formData.categoryId]);

  useEffect(() => {
    if (formData.subCategoryId) {
      const sub = subCategories.find((sc) => sc.id === formData.subCategoryId);
      setAvailableServices(sub?.services || []);
      setSelectedServices([]);
    } else {
      setAvailableServices([]);
    }
  }, [formData.subCategoryId, subCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = getToken();
      if (!token) throw new Error("You must be logged in to apply.");
      const { sub: userId } = jwtDecode(token);

      const applicationData = {
        ...formData,
        userId,
        experienceYears: parseInt(formData.experienceYears, 10),
        services: selectedServices,
      };

      await applyAsProvider(applicationData);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-4 pr-4 py-3 bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:bg-surface-bright transition-all text-sm";
  const labelClass =
    "block text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-2";

  // ── Status states ─────────────────────────────────────────────────────────
  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="spinner" />
      </div>
    );
  }

  if (alreadyApplied) {
    const isPending = existingStatus === "PENDING";
    const isActive = existingStatus === "ACTIVE";
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
        <div className="relative w-full max-w-md">
          <div className="glass-card rounded-3xl p-10 shadow-2xl text-center">
            <span className={`material-symbols-outlined text-5xl mb-4 block ${isPending ? "text-amber-400" : isActive ? "text-green-400" : "text-red-400"}`}>
              {isPending ? "hourglass_top" : isActive ? "verified" : "cancel"}
            </span>
            <h1 className="text-2xl font-headline font-extrabold text-on-surface mb-3">
              {isPending && "Application Under Review"}
              {isActive && "You're Already a Provider!"}
              {!isPending && !isActive && "Application " + existingStatus}
            </h1>
            <p className="text-on-surface-variant text-sm mb-6">
              {isPending && "Your provider application is currently being reviewed by our admin team. We'll notify you once it's processed."}
              {isActive && "Your provider profile is live. Head to your Provider Dashboard to manage services."}
              {!isPending && !isActive && "Please contact support if you believe this is an error."}
            </p>
            <button
              onClick={() => navigate(isActive ? "/provider-dashboard" : "/dashboard")}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-headline font-bold text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition-all"
            >
              {isActive ? "Go to Provider Dashboard" : "Back to Dashboard"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
        <div className="relative w-full max-w-md">
          <div className="glass-card rounded-3xl p-10 shadow-2xl text-center">
            <span className="material-symbols-outlined text-5xl text-green-400 mb-4 block">check_circle</span>
            <h1 className="text-2xl font-headline font-extrabold text-on-surface mb-3">
              Application Submitted!
            </h1>
            <p className="text-on-surface-variant text-sm">
              Your provider application is <span className="text-amber-400 font-bold">PENDING</span> review.
              An admin will review it shortly. Redirecting to dashboard…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-20 pb-10">
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto">
        <div className="glass-card rounded-3xl p-8 md:p-10 shadow-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary-container/20 mb-4">
              <span className="material-symbols-outlined text-3xl text-secondary">storefront</span>
            </span>
            <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
              Become a Provider
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Fill out the form below to offer your services on DLASS.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className={labelClass}>Business Name *</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                required
                placeholder="e.g. Acme Plumbing Co."
                value={formData.businessName}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className={labelClass}>Description *</label>
              <textarea
                id="description"
                name="description"
                required
                rows="3"
                placeholder="Tell us about your services..."
                value={formData.description}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="categoryId" className={labelClass}>Category *</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subCategoryId" className={labelClass}>Subcategory *</label>
                <select
                  id="subCategoryId"
                  name="subCategoryId"
                  required
                  value={formData.subCategoryId}
                  onChange={handleChange}
                  disabled={!formData.categoryId}
                  className={`${inputClass} disabled:opacity-50`}
                >
                  <option value="">-- Select Subcategory --</option>
                  {subCategories.map((sc) => (
                    <option key={sc.id} value={sc.id}>{sc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Services (multi-select as chip toggles) */}
            {availableServices.length > 0 && (
              <div>
                <label className={labelClass}>Services Offered *</label>
                <div className="flex flex-wrap gap-2 p-3 bg-surface-container-highest/30 rounded-xl border border-outline-variant/20">
                  {availableServices.map((srv) => {
                    const isSelected = selectedServices.includes(srv);
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() =>
                          setSelectedServices((prev) =>
                            isSelected ? prev.filter((s) => s !== srv) : [...prev, srv]
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                          isSelected
                            ? "bg-secondary text-on-secondary"
                            : "bg-surface-container-high text-on-surface-variant hover:bg-white/10"
                        }`}
                      >
                        {srv}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-on-surface-variant/60 mt-1 ml-1">
                  Tap to select the services you offer.
                </p>
              </div>
            )}

            {/* Experience + Pincode */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="experienceYears" className={labelClass}>Experience (Years) *</label>
                <input
                  type="number"
                  id="experienceYears"
                  name="experienceYears"
                  min="0"
                  required
                  value={formData.experienceYears}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="providerPincode" className={labelClass}>Pincode *</label>
                <input
                  type="text"
                  id="providerPincode"
                  name="pincode"
                  maxLength="10"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* City + Area */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className={labelClass}>City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="area" className={labelClass}>Area / Neighbourhood *</label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  required
                  value={formData.area}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-headline font-bold text-sm uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </span>
              ) : (
                "Submit Application"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProviderApply;
