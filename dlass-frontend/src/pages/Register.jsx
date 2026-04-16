import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";
import PageWrapper from "../components/ui/PageWrapper";
import GlassCard from "../components/ui/GlassCard";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    pincode: "",
    phone: "+91",
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
    if (!form.phone.trim()) return "Phone number is required.";
    if (!/^\+91\d{10}$/.test(form.phone.trim()))
      return "Phone must be in format +91XXXXXXXXXX (10 digits after +91).";
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

  return (
    <PageWrapper className="justify-center items-center">
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg z-10 pt-10 pb-10">
        <GlassCard className="shadow-2xl">
          <div className="mb-8 text-center flex flex-col items-center">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4 text-primary">
              <span className="material-symbols-outlined text-3xl">person_add</span>
            </span>
            <h1 className="text-3xl font-headline font-extrabold tracking-tight text-textPrimary">
              Create Account
            </h1>
            <p className="text-textSecondary text-sm mt-1">
              Join DLASS — find or offer local services
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-coral/10 border border-coral/20 text-coral text-sm">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm">
              <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="FULL NAME"
              id="fullName"
              type="text"
              name="fullName"
              placeholder="John Doe"
              value={form.fullName}
              onChange={handleChange}
              disabled={loading}
              icon="badge"
            />

            <Input
              label="EMAIL"
              id="reg-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
              icon="mail"
            />

            <Input
              label="PASSWORD"
              id="reg-password"
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="new-password"
              icon="key"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="PINCODE"
                id="pincode"
                type="text"
                name="pincode"
                placeholder="6-digit pincode"
                value={form.pincode}
                onChange={handleChange}
                maxLength={6}
                disabled={loading}
                icon="location_on"
              />

              <div>
                <Input
                  label="PHONE NUMBER"
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="+91XXXXXXXXXX"
                  value={form.phone}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (!val.startsWith("+91")) val = "+91";
                    setForm((prev) => ({ ...prev, phone: val }));
                  }}
                  maxLength={13}
                  disabled={loading}
                  icon="phone"
                />
                <p className="text-[10px] text-textSecondary uppercase tracking-wider mt-1 ml-1">Format: +91 and 10 digits</p>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full mt-4"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-textSecondary mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </div>
    </PageWrapper>
  );
}

export default Register;