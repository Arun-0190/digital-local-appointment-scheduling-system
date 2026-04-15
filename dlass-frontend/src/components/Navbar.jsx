import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { logout, getToken, getUserRole, getUsername } from "../services/authService";
import ThemeToggle from "./ui/ThemeToggle";
import Button from "./ui/Button";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(getToken());
  const [role, setRole] = useState(getUserRole());
  const [email, setEmail] = useState(getUsername());
  const [menuOpen, setMenuOpen] = useState(false);

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
    setMenuOpen(false);
    navigate("/login");
  };

  const dashboardPath =
    role === "PROVIDER"
      ? "/provider-dashboard"
      : role === "ADMIN"
      ? "/admin"
      : "/dashboard";

  const isActive = (path) => location.pathname === path;
  const settingsPath = role === "ADMIN" ? "/admin" : dashboardPath;

  const navLinkClass = (path) =>
    `font-headline font-bold tracking-tight text-sm transition-all duration-300 hover:text-primary ${
      isActive(path)
        ? "text-primary border-b-2 border-primary pb-1"
        : "text-textSecondary hover:text-textPrimary"
    }`;

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center px-6 md:px-12 h-16 max-w-[1440px] mx-auto">
        {/* Brand */}
        <Link
          to="/"
          className="text-2xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400 font-headline uppercase select-none flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center text-white text-sm shadow-md shadow-indigo-500/20">D</div>
          DLASS
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 translate-x-4">
          <Link to="/" className={navLinkClass("/")}>Home</Link>
          <Link to="/search" className={navLinkClass("/search")}>Search</Link>
          {token && (
            <Link to={dashboardPath} className={navLinkClass(dashboardPath)}>
              Dashboard
            </Link>
          )}
        </div>

        {/* Right side auth actions & Theme Toggle */}
        <div className="flex items-center gap-4 md:gap-6">
          <ThemeToggle />
          
          {token && <NotificationBell />}
          
          <div className="h-6 w-px bg-glassBorder hidden sm:block"></div>
          
          {token ? (
            <>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-slate-900/70 px-3 py-1.5 text-textPrimary transition-colors hover:border-primary/40"
                >
                  <span className="material-symbols-outlined text-lg">account_circle</span>
                  <span className="hidden sm:block text-xs text-textSecondary font-label tracking-widest truncate max-w-[140px]">
                    {email}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-12 z-[70] w-56 rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-2xl">
                    {[
                      { label: "My Profile", path: dashboardPath },
                      { label: "Dashboard", path: dashboardPath },
                      { label: "Notifications", path: dashboardPath },
                      { label: "Settings", path: settingsPath },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          setMenuOpen(false);
                          navigate(item.path);
                        }}
                        className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-gray-200 transition-colors hover:bg-white/5"
                      >
                        {item.label}
                      </button>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-rose-300 transition-colors hover:bg-rose-500/10"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-textSecondary hover:text-primary font-headline font-bold text-sm transition-colors"
              >
                Login
              </Link>
              <Link to="/register">
                <Button className="!px-5 !py-2 !text-sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
