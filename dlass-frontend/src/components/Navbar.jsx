import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const token = localStorage.getItem("token");

  return (
    <nav
      style={{
        display: "flex",
        gap: "20px",
        padding: "15px",
        backgroundColor: "#f2f2f2",
      }}
    >
      <Link to="/">Home</Link>
      <Link to="/search">Search</Link>

      {!token && <Link to="/login">Login</Link>}
      {!token && <Link to="/register">Register</Link>}

      {token && <button onClick={handleLogout}>Logout</button>}
    </nav>
  );
}

export default Navbar;
