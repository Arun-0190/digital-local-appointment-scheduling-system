import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchProviders from "./pages/SearchProviders";
import UserDashboard from "./pages/UserDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderApply from "./pages/ProviderApply";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import { checkAndClearExpiredToken, getUserRole, getToken } from "./services/authService";

function App() {
  // On every app load, verify the stored token hasn't expired
  useEffect(() => {
    checkAndClearExpiredToken();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/search" element={<SearchProviders />} />

        {/* USER-only route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["USER"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/apply"
          element={
            <ProtectedRoute>
              <ProviderApply />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminDashboard /> // Add AdminRoute wrapper later if needed
          }
        />

        {/* PROVIDER-only route */}
        <Route
          path="/provider-dashboard"
          element={
            <ProtectedRoute roles={["PROVIDER"]}>
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback – redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
