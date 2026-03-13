import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {

    const response = await loginUser(email, password);

    console.log("Login Success:", response);

    // store data
    localStorage.setItem("token", response.token);
    localStorage.setItem("email", response.email);
    localStorage.setItem("role", response.role);

    // redirect based on role
    if(response.role === "USER"){
      navigate("/dashboard");
    }
    else if(response.role === "PROVIDER"){
      navigate("/provider-dashboard");
    }

  } catch(error) {

    console.error("Login Failed:", error);

  }
};

  return (
    <div style={{ padding: "40px" }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>

        <div>
          <label>Email</label><br />
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <br />

        <div>
          <label>Password</label><br />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <br />

        <button type="submit">Login</button>

      </form>
    </div>
  );
}

export default Login;