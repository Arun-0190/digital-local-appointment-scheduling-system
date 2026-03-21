import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getCategories, getSubCategories } from "../services/catalogService";
import { applyAsProvider } from "../services/providerService";
import { getToken } from "../services/authService";

function ProviderApply() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Category/Subcategory data from API
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);

  // Form State
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

  // Fetch categories on mount
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch subcategories when category changes
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

  // Update available services when subcategory changes
  useEffect(() => {
    if (formData.subCategoryId) {
      const sub = subCategories.find(sc => sc.id === formData.subCategoryId);
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

  const handleServiceChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedServices(value);
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
        services: selectedServices
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

  if (success) {
    return (
      <div className="page-container">
        <div className="alert alert-success" style={{textAlign: "center", marginTop: "40px"}}>
          <h2>Application Submitted! 🎉</h2>
          <p>Your provider application is currently PENDING. An admin will review it shortly.</p>
          <p>Redirecting you back to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Become a Service Provider</h1>
      <p className="page-subtitle">Fill out the form below to offer your services on DLASS.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="profile-form" onSubmit={handleSubmit} style={{ maxWidth: "600px", margin: "0 auto" }}>
        
        <div className="form-group">
          <label htmlFor="businessName">Business Name *</label>
          <input
            type="text"
            id="businessName"
            name="businessName"
            required
            value={formData.businessName}
            onChange={handleChange}
            placeholder="e.g. Acme Plumbing Co."
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            required
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell us about your services..."
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Category *</label>
          <select id="categoryId" name="categoryId" required value={formData.categoryId} onChange={handleChange}>
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="subCategoryId">Subcategory *</label>
          <select 
            id="subCategoryId" 
            name="subCategoryId" 
            required 
            value={formData.subCategoryId} 
            onChange={handleChange}
            disabled={!formData.categoryId}
          >
            <option value="">-- Select Subcategory --</option>
            {subCategories.map((sc) => (
              <option key={sc.id} value={sc.id}>{sc.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="services">Services Offered (Select Multiple) *</label>
          <select 
            id="services" 
            name="services" 
            multiple 
            required 
            value={selectedServices} 
            onChange={handleServiceChange}
            disabled={!formData.subCategoryId}
            style={{ height: "120px" }}
          >
            {availableServices.map((srv) => (
              <option key={srv} value={srv}>{srv}</option>
            ))}
          </select>
          <small>Hold Ctrl (Windows) or Cmd (Mac) to select multiple.</small>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label htmlFor="experienceYears">Experience (Years) *</label>
            <input
              type="number"
              id="experienceYears"
              name="experienceYears"
              min="0"
              required
              value={formData.experienceYears}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="pincode">Pincode *</label>
            <input
              type="text"
              id="pincode"
              name="pincode"
              maxLength="10"
              required
              value={formData.pincode}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="area">Area/Neighborhood *</label>
            <input
              type="text"
              id="area"
              name="area"
              required
              value={formData.area}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: "1rem" }}>
          {loading ? "Submitting..." : "Submit Application"}
        </button>

      </form>
    </div>
  );
}

export default ProviderApply;
