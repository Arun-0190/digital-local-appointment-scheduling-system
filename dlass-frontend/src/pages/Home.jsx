import { Link } from "react-router-dom";
import { getToken, getUserRole } from "../services/authService";

function Home() {
  const token = getToken();
  const role = getUserRole();
  const dashboardPath = role === "PROVIDER" ? "/provider-dashboard" : "/dashboard";

  return (
    <div className="home-page">
      <h1 className="home-title">Daily Life Assistance</h1>
      <p className="home-subtitle">
        Connect with trusted local service providers — plumbers, electricians,
        cleaners, and more — all in your area.
      </p>

      <div className="home-actions">
        <Link to="/search">
          <button className="btn-primary">Find Providers</button>
        </Link>
        {token ? (
          <Link to={dashboardPath}>
            <button className="btn-secondary">My Dashboard →</button>
          </Link>
        ) : (
          <Link to="/register">
            <button className="btn-secondary">Get Started Free</button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Home;