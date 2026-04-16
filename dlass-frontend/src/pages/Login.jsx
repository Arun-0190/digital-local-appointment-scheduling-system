import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import Button from "../components/ui/Button";
import GlassCard from "../components/ui/GlassCard";
import Input from "../components/ui/Input";
import PageWrapper from "../components/ui/PageWrapper";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.email || !form.password) return "All fields are required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email address.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      window.dispatchEvent(new Event("auth-change"));
      if (data.role === "PROVIDER") {
        navigate("/provider-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "";
      setError(msg || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="justify-center items-center">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md z-10 px-4">
        <GlassCard className="shadow-2xl">
          <div className="mb-8 text-center flex flex-col items-center">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4 text-primary">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </span>
            <h1 className="text-3xl font-headline font-extrabold tracking-tight text-textPrimary">
              Welcome Back
            </h1>
            <p className="text-textSecondary text-sm mt-1">
              Sign in to your DLASS account
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-error-container/20 border border-error/20 text-error text-sm">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="EMAIL"
              id="email"
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
              id="password"
              type="password"
              name="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
              icon="key"
            />

            <Button
              type="submit"
              isLoading={loading}
              className="w-full mt-4"
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-textSecondary mt-6">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline"
            >
              Register here
            </Link>
          </p>
        </GlassCard>
      </div>
    </PageWrapper>
  );
}

export default Login;