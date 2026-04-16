import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { logout, getToken, getUserRole, getUsername } from "../services/authService";
import ThemeToggle from "./ui/ThemeToggle";
import Button from "./ui/Button";
import Avatar from "./ui/Avatar";
import NotificationBell from "./NotificationBell";

import { API_BASE_URL } from "../services/apiUtils";

const BASE_URL = API_BASE_URL;

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(getToken());
  const [role, setRole] = useState(getUserRole());
  const [email, setEmail] = useState(getUsername());
  const [userProfile, setUserProfile] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchUserProfile = async (authToken) => {
    if (!authToken) return;
    try {
      const axios = (await import("axios")).default;
      const res = await axios.get(`${BASE_URL}/api/users/me`, { 
        headers: { Authorization: `Bearer ${authToken}` } 
      });
      setUserProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  useEffect(() => {
    const syncAuth = () => {
      const newToken = getToken();
      setToken(newToken);
      setRole(getUserRole());
      setEmail(getUsername());
      if (newToken) fetchUserProfile(newToken);
    };

    const handleProfileUpdate = () => {
      if (token) fetchUserProfile(token);
    };

    window.addEventListener("auth-change", syncAuth);
    window.addEventListener("profile-update", handleProfileUpdate);
    
    if (token) {
      fetchUserProfile(token);
    } else {
      setUserProfile(null);
    }

    return () => {
      window.removeEventListener("auth-change", syncAuth);
      window.removeEventListener("profile-update", handleProfileUpdate);
    };
  }, [token]);

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event("auth-change"));
    navigate("/login");
  };

  const dashboardPath =
    role === "PROVIDER" ? "/provider-dashboard" : role === "ADMIN" ? "/admin" : "/dashboard";

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `relative font-headline font-bold tracking-tight text-sm transition-colors duration-300 group py-2 ${
      isActive(path) ? "text-primary" : "text-textSecondary hover:text-textPrimary"
    }`;

  const navUnderline = (path) => (
    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100 ${isActive(path) ? 'scale-x-100' : ''}`} />
  );

  const getProfileImageUrl = () => {
    if (!userProfile?.profileImageUrl) return null;
    // Append unique timestamp for cache-busting
    const separator = userProfile.profileImageUrl.includes('?') ? '&' : '?';
    const baseUrlFormatted = `${BASE_URL}${userProfile.profileImageUrl.startsWith('/') ? '' : '/'}${userProfile.profileImageUrl}`;
    return `${baseUrlFormatted}${separator}t=${Date.now()}`;
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? "bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-b border-white/10 dark:border-primary/10 py-3 shadow-2xl shadow-black/10" 
        : "bg-transparent py-5"
    }`}>
      <div className="flex justify-between items-center px-6 md:px-12 max-w-[1440px] mx-auto">
        <Link to="/" className="text-2xl font-black tracking-tighter text-primary font-headline uppercase select-none flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center text-black text-lg shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-500 ease-out">D</div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-textPrimary to-textPrimary/70 group-hover:from-primary group-hover:to-accent transition-all duration-300">DLASS</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className={navLinkClass("/")}>Home{navUnderline("/")}</Link>
          <Link to="/search" className={navLinkClass("/search")}>Search{navUnderline("/search")}</Link>
          {token && <Link to={dashboardPath} className={navLinkClass(dashboardPath)}>Dashboard{navUnderline(dashboardPath)}</Link>}
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <ThemeToggle />
          {token && <NotificationBell />}
          <div className="h-6 w-px bg-glassBorder hidden sm:block"></div>
          
          {token ? (
            <div className="relative group">
              <button className="flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded-full transition-all border border-transparent hover:border-black/10 dark:hover:border-primary/20">
                  <Avatar 
                    src={getProfileImageUrl()} 
                    name={userProfile?.fullName || "User"} 
                    size="sm" 
                    className="!rounded-full object-cover transition-opacity hover:opacity-90"
                  />
                <span className="hidden sm:block text-sm font-headline font-bold text-textPrimary">{userProfile?.fullName || "User"}</span>
                <span className="material-symbols-outlined text-textSecondary text-sm group-hover:rotate-180 transition-transform duration-300">expand_more</span>
              </button>
              
              <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl border border-gray-200 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
                <div className="p-4 bg-primary/5 border-b border-gray-100 dark:border-white/5">
                  <p className="text-sm font-bold text-textPrimary truncate">{userProfile?.fullName || "User"}</p>
                  <p className="text-xs text-textSecondary truncate opacity-60">{email}</p>
                </div>
                <div className="p-2 space-y-1">
                  {[
                    { to: dashboardPath, icon: 'person', label: 'My Dashboard', state: { tab: 'profile' } },
                    { to: dashboardPath, icon: 'notifications', label: 'Notifications', state: { tab: 'appointments' } },
                    { to: dashboardPath, icon: 'settings', label: 'Settings', state: { tab: 'profile' } }
                  ].map((item) => (
                    <Link key={item.label} to={item.to} state={item.state} className="flex items-center gap-3 px-3 py-2.5 text-sm text-textSecondary hover:text-primary hover:bg-primary/5 rounded-xl transition-all group/item">
                      <span className="material-symbols-outlined text-[20px] group-hover/item:scale-110 transition-transform">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="p-2 border-t border-gray-100 dark:border-white/5 mt-1 bg-black/5 dark:bg-white/5">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose hover:bg-rose/10 rounded-xl transition-all font-bold group/logout">
                    <span className="material-symbols-outlined text-[20px] group-hover/logout:translate-x-1 transition-transform">logout</span>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-textSecondary hover:text-primary font-headline font-bold text-sm transition-colors hidden sm:block">Login</Link>
              <Link to="/register">
                <Button className="!px-6 !py-2.5 !text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

