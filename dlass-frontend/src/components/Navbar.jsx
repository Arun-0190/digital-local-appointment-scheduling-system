import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { logout, getToken, getUserRole, getUsername } from "../services/authService";

/**
 * Navbar – reactive auth state.
 * Listens to a custom "auth-change" event so it re-renders instantly
 * when login/logout happens without a full page reload.
 */
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(getToken());
  const [role, setRole] = useState(getUserRole());
  const [email, setEmail] = useState(getUsername());

  // Sync state whenever a login or logout fires the custom event
  useEffect(() => {
    const syncAuth = () => {
      setToken(getToken());
      setRole(getUserRole());
      setEmail(getUsername());
    };
    window.addEventListener("auth-change", syncAuth);
    return () => window.removeEventListener("auth-change", syncAuth);
  }, []);

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login");
  };

  const dashboardPath =
    role === "PROVIDER"
      ? "/provider-dashboard"
      : role === "ADMIN"
      ? "/admin"
      : "/dashboard";

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `font-headline font-bold tracking-tight text-sm transition-all duration-300 hover:scale-105 ${
      isActive(path)
        ? "text-secondary border-b-2 border-secondary pb-0.5"
        : "text-slate-300 hover:text-white"
    }`;

  return (
    <nav className="fixed top-0 w-full z-50 rounded-b-2xl bg-white/10 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div className="flex justify-between items-center px-6 md:px-8 h-16 max-w-7xl mx-auto">
        {/* Brand */}
        <Link
          to="/"
          className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-400 font-headline uppercase select-none"
        >
          DLASS
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className={navLinkClass("/")}>Home</Link>
          <Link to="/search" className={navLinkClass("/search")}>Search</Link>
          {token && (
            <Link to={dashboardPath} className={navLinkClass(dashboardPath)}>
              Dashboard
            </Link>
          )}
        </div>

        {/* Right side auth actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {token ? (
            <>
              <span className="hidden sm:block text-xs text-slate-400 font-label tracking-widest truncate max-w-[180px]">
                {email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 bg-gradient-to-r from-primary-container to-secondary-container rounded-lg text-white font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-slate-300 hover:text-white font-headline font-bold text-sm transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 bg-gradient-to-r from-primary-container to-secondary-container rounded-lg text-white font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
