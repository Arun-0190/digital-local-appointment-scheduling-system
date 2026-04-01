import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { logout, getToken, getUserRole, getUsername } from "../services/authService";
import ThemeToggle from "./ui/ThemeToggle";
import Button from "./ui/Button";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(getToken());
  const [role, setRole] = useState(getUserRole());
  const [email, setEmail] = useState(getUsername());

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
    `font-headline font-bold tracking-tight text-sm transition-all duration-300 hover:text-primary ${
      isActive(path)
        ? "text-primary border-b-2 border-primary pb-1"
        : "text-textSecondary hover:text-textPrimary"
    }`;

  return (
    <nav className="fixed top-0 w-full z-50 bg-glassBg backdrop-blur-xl border-b border-glassBorder shadow-sm transition-colors duration-400">
      <div className="flex justify-between items-center px-6 md:px-12 h-20 max-w-[1440px] mx-auto">
        {/* Brand */}
        <Link
          to="/"
          className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-primary-gradient font-headline uppercase select-none"
        >
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
          
          <div className="h-6 w-px bg-glassBorder hidden sm:block"></div>
          
          {token ? (
            <>
              <span className="hidden sm:block text-xs text-textSecondary font-label tracking-widest truncate max-w-[180px]">
                {email}
              </span>
              <Button onClick={handleLogout} variant="ghost" className="!px-4 !py-2 !text-sm border border-outline-variant hover:border-coral hover:text-coral transition-colors">
                Logout
              </Button>
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
