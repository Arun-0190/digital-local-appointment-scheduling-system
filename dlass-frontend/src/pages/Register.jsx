import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    pincode: "",
    role: "USER",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.email) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email address.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (!form.pincode.trim()) return "Pincode is required.";
    if (!/^\d{6}$/.test(form.pincode)) return "Pincode must be exactly 6 digits.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await register(form);
      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "";
      if (msg.toLowerCase().includes("email") || err.response?.status === 409) {
        setError("This email is already registered. Please log in.");
      } else {
        setError(msg || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:bg-surface-bright transition-all text-sm";
  const labelClass =
    "block text-xs font-label font-bold text-on-surface-variant uppercase tracking-widest mb-2";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="glass-card rounded-3xl p-8 md:p-10 shadow-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary-container/20 mb-4">
              <span className="material-symbols-outlined text-3xl text-secondary">person_add</span>
            </span>
            <h1 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">
              Create Account
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Join DLASS — find or offer local services
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm">
              <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className={labelClass}>Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">badge</span>
                <input id="fullName" type="text" name="fullName" placeholder="John Doe"
                  value={form.fullName} onChange={handleChange} disabled={loading}
                  className={inputClass} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className={labelClass}>Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">mail</span>
                <input id="reg-email" type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} disabled={loading} autoComplete="email"
                  className={inputClass} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className={labelClass}>Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">key</span>
                <input id="reg-password" type="password" name="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange} disabled={loading} autoComplete="new-password"
                  className={inputClass} />
              </div>
            </div>

            {/* Pincode */}
            <div>
              <label htmlFor="pincode" className={labelClass}>Pincode</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">location_on</span>
                <input id="pincode" type="text" name="pincode" placeholder="6-digit pincode"
                  value={form.pincode} onChange={handleChange} maxLength={6} disabled={loading}
                  className={inputClass} />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-headline font-bold text-sm uppercase tracking-wider shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-secondary font-bold hover:underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;