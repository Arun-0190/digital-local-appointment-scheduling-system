import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { logout, getToken, getUserRole, getUsername } from "../services/authService";

/**
 * Navbar – reactive auth state.
 * Listens to a custom "auth-change" event so it re-renders instantly
 * when login/logout happens without a full page reload.
 */
function Navbar() {
  const navigate = useNavigate();

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

  const dashboardPath = role === "PROVIDER" 
    ? "/provider-dashboard" 
    : role === "ADMIN" 
      ? "/admin" 
      : "/dashboard";

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">DLASS</Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>

        {token ? (
          <>
            <Link to={dashboardPath} className="nav-dashboard-link">
              Dashboard
            </Link>
            <span className="nav-user-email">{email}</span>
            <button className="nav-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-auth-link">Login</Link>
            <Link to="/register" className="nav-auth-link nav-register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
