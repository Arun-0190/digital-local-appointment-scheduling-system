import { useState, useEffect } from "react";
import axios from "axios";
import { getToken, getUserRole } from "../services/authService";
import PageWrapper from "../components/ui/PageWrapper";

// Landing Sections
import HeroSection from "../components/landing/HeroSection";
import StatsSection from "../components/landing/StatsSection";
import HowItWorks from "../components/landing/HowItWorks";
import ServicesGrid from "../components/landing/ServicesGrid";
import FeaturesSection from "../components/landing/FeaturesSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import FinalCTA from "../components/landing/FinalCTA";
import ScrollProgress from "../components/landing/ScrollProgress";
import CursorEffect from "../components/landing/CursorEffect";

import { API_URL } from "../services/apiUtils";

const API = API_URL;

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

function Home() {
  const token = getToken();
  const role = getUserRole();
  const dashboardPath = role === "PROVIDER" ? "/provider-dashboard" : "/dashboard";

  const [userPincode, setUserPincode] = useState("");

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API}/users/me`, { headers: authHeaders() })
      .then((res) => {
        setUserPincode(res.data.pincode);
      })
      .catch(() => {});
  }, [token]);

  return (
    <PageWrapper className="!px-0 !max-w-full !pt-0 overflow-hidden bg-[#0D0D0D]">
      <CursorEffect />
      <ScrollProgress />
      
      {/* ── HERO SECTION ── */}
      <HeroSection token={token} dashboardPath={dashboardPath} />

      {/* ── STATS SECTION ── */}
      <StatsSection />

      {/* ── SERVICES GRID ── */}
      <ServicesGrid userPincode={userPincode} />

      {/* ── HOW IT WORKS ── */}
      <HowItWorks />

      {/* ── FEATURES SECTION ── */}
      <FeaturesSection />

      {/* ── TESTIMONIALS ── */}
      <TestimonialsSection />

      {/* ── FINAL CTA ── */}
      <FinalCTA />
      
      {/* Subtle Background Motion Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      </div>
    </PageWrapper>
  );
}

export default Home;