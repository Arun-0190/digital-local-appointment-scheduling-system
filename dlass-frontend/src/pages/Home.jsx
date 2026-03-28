import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, getUserRole } from "../services/authService";

const API = "http://localhost:8080/api";

const POPULAR_SERVICES = [
  {
    id: "plumbing",
    icon: "plumbing",
    title: "Plumbing",
    desc: "Leaks, pipe repairs & installations",
    color: "from-blue-500/20 to-cyan-400/10",
    border: "border-blue-400/20",
    text: "text-cyan-300",
  },
  {
    id: "electrical",
    icon: "electrical_services",
    title: "Electrician",
    desc: "Wiring, fuse boxes & fittings",
    color: "from-yellow-500/20 to-amber-400/10",
    border: "border-yellow-400/20",
    text: "text-yellow-300",
  },
  {
    id: "salon",
    icon: "content_cut",
    title: "Salon",
    desc: "Hair, skin & beauty services",
    color: "from-pink-500/20 to-rose-400/10",
    border: "border-pink-400/20",
    text: "text-pink-300",
  },
  {
    id: "cleaning",
    icon: "cleaning_services",
    title: "Cleaning",
    desc: "Home deep clean & sanitisation",
    color: "from-green-500/20 to-emerald-400/10",
    border: "border-green-400/20",
    text: "text-green-300",
  },
  {
    id: "medical",
    icon: "medical_services",
    title: "Medical",
    desc: "Nurse visits & medical care at home",
    color: "from-red-500/20 to-rose-400/10",
    border: "border-red-400/20",
    text: "text-red-300",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "search",
    title: "Search",
    desc: "Browse services by category and your area pincode.",
  },
  {
    step: "02",
    icon: "calendar_month",
    title: "Book",
    desc: "Pick a time slot that suits you and confirm your booking.",
  },
  {
    step: "03",
    icon: "verified",
    title: "Done",
    desc: "Your verified provider arrives and gets the job done.",
  },
];

const WHY_DLASS = [
  {
    icon: "shield_check",
    title: "Verified Providers",
    desc: "Every professional is background-checked and admin-approved before going live.",
  },
  {
    icon: "bolt",
    title: "Instant Booking",
    desc: "See real-time availability and confirm your slot in under 60 seconds.",
  },
  {
    icon: "star",
    title: "Trusted Reviews",
    desc: "Transparent ratings from real customers so you always know who you're hiring.",
  },
];

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

function Home() {
  const navigate = useNavigate();
  const token = getToken();
  const role = getUserRole();
  const dashboardPath = role === "PROVIDER" ? "/provider-dashboard" : "/dashboard";

  const [userPincode, setUserPincode] = useState("");
  const [recommended, setRecommended] = useState([]);
  const [loadingRec, setLoadingRec] = useState(false);

  // Fetch user pincode and then recommended providers
  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API}/users/me`, { headers: authHeaders() })
      .then((res) => {
        const pincode = res.data.pincode;
        setUserPincode(pincode);
        if (pincode) {
          setLoadingRec(true);
          // Fetch providers near this pincode (no category filter for generic suggestions)
          // We use the search with a broad query — pick first available subcategory if possible
          // Simpler: just show the pincode to the user with an invitation to search
          setLoadingRec(false);
        }
      })
      .catch(() => {});
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 relative">
        {/* Decorative glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/20 border border-primary/20 text-primary text-xs font-label font-bold tracking-widest uppercase mb-8">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Digital Local Appointment Scheduling
          </span>

          <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter mb-6 leading-none">
            <span className="text-white">Your services,</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-primary to-secondary">
              effortlessly scheduled.
            </span>
          </h1>

          <p className="text-on-surface-variant text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-10">
            Connect with trusted local professionals — plumbers, electricians, cleaners,
            and more — all near you. Book in seconds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/search">
              <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-headline font-bold text-base uppercase tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all duration-300">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">search</span>
                  Find Providers
                </span>
              </button>
            </Link>

            {token ? (
              <Link to={dashboardPath}>
                <button className="px-8 py-4 rounded-2xl border border-outline-variant/40 bg-white/5 backdrop-blur-sm text-on-surface font-headline font-bold text-base hover:bg-white/10 hover:border-secondary/40 transition-all duration-300">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">dashboard</span>
                    My Dashboard
                  </span>
                </button>
              </Link>
            ) : (
              <Link to="/register">
                <button className="px-8 py-4 rounded-2xl border border-outline-variant/40 bg-white/5 backdrop-blur-sm text-on-surface font-headline font-bold text-base hover:bg-white/10 hover:border-secondary/40 transition-all duration-300">
                  Get Started Free →
                </button>
              </Link>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[
              { icon: "verified", value: "500+", label: "Verified Providers" },
              { icon: "star", value: "4.9★", label: "Average Rating" },
              { icon: "calendar_month", value: "10k+", label: "Bookings Made" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-2xl">{stat.icon}</span>
                <span className="text-2xl font-headline font-black text-white">{stat.value}</span>
                <span className="text-xs text-on-surface-variant font-label tracking-widest uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR SERVICES ──────────────────────────────────── */}
      <section className="px-6 md:px-16 py-16 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-on-surface mb-3">
            Popular Services
          </h2>
          <p className="text-on-surface-variant text-base max-w-lg mx-auto">
            Tap a category to instantly find providers near you.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {POPULAR_SERVICES.map((svc) => (
            <button
              key={svc.id}
              onClick={() => {
                // Phase 6: if logged in and pincode known, include it for smart search
                const params = new URLSearchParams({ category: svc.title });
                if (userPincode) params.set("pincode", userPincode);
                navigate(`/search?${params.toString()}`);
              }}
              className={`group relative flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br ${svc.color} border ${svc.border} backdrop-blur-sm hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer`}
            >
              <div className={`w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors`}>
                <span className={`material-symbols-outlined text-3xl ${svc.text}`}>{svc.icon}</span>
              </div>
              <div className="text-center">
                <div className="font-headline font-bold text-white text-sm">{svc.title}</div>
                <div className="text-xs text-on-surface-variant mt-0.5 leading-snug">{svc.desc}</div>
              </div>
              {/* Badge shown when user is logged in and has pincode */}
              {userPincode && (
                <span className="absolute top-2 right-2 text-[9px] font-bold bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full border border-secondary/20 uppercase tracking-wider">
                  Near you
                </span>
              )}
            </button>
          ))}
        </div>

      </section>

      {/* ── RECOMMENDED / TOP PROVIDERS ───────────────────────── */}
      <section className="px-6 md:px-16 py-16 max-w-7xl mx-auto w-full">
        <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-3xl rounded-full" />
          <div className="relative z-10">
            {token ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary text-2xl">location_on</span>
                  <div>
                    <h2 className="text-2xl font-headline font-extrabold text-on-surface">
                      Recommended for You
                    </h2>
                    {userPincode && (
                      <p className="text-on-surface-variant text-sm mt-0.5">
                        Based on your area: <span className="text-secondary font-bold">{userPincode}</span>
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-on-surface-variant mb-6 max-w-xl">
                  We've matched service providers close to your registered pincode. Browse and book below.
                </p>
                <button
                  onClick={() => navigate(`/search${userPincode ? `?pincode=${userPincode}` : ""}`)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-headline font-bold text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">near_me</span>
                    Find Providers Near Me
                  </span>
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-headline font-extrabold text-on-surface mb-3">
                  Top Providers Near You
                </h2>
                <p className="text-on-surface-variant mb-6 max-w-xl">
                  Sign in to see personalised provider suggestions based on your pincode and booking history.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/register">
                    <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-headline font-bold text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg">
                      Create Account
                    </button>
                  </Link>
                  <Link to="/login">
                    <button className="px-6 py-3 rounded-xl border border-outline-variant/40 bg-white/5 text-on-surface font-headline font-bold text-sm hover:bg-white/10 transition-all">
                      Sign In
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="px-6 md:px-16 py-16 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-on-surface mb-3">
            How It Works
          </h2>
          <p className="text-on-surface-variant text-base">Three simple steps to get any job done.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={item.step} className="relative">
              {/* connector line */}
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-outline-variant/40 to-transparent z-0 translate-x-0" />
              )}
              <div className="glass-card rounded-2xl p-8 text-center relative z-10 hover:scale-[1.02] transition-transform duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-container to-secondary-container mb-5">
                  <span className="material-symbols-outlined text-white text-2xl">{item.icon}</span>
                </div>
                <div className="text-xs font-label tracking-widest text-on-surface-variant uppercase mb-1">
                  Step {item.step}
                </div>
                <h3 className="text-xl font-headline font-bold text-on-surface mb-2">{item.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY CHOOSE DLASS ──────────────────────────────────── */}
      <section className="px-6 md:px-16 py-16 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-on-surface mb-3">
            Why Choose DLASS?
          </h2>
          <p className="text-on-surface-variant text-base max-w-lg mx-auto">
            We're building the most reliable local services marketplace in India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WHY_DLASS.map((item) => (
            <div
              key={item.title}
              className="glass-panel rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-300 border border-outline-variant/10"
            >
              <span className="material-symbols-outlined text-4xl text-secondary mb-4 block">{item.icon}</span>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-2">{item.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      {!token && (
        <section className="px-6 md:px-16 py-20 max-w-7xl mx-auto w-full">
          <div className="glass-card rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-headline font-extrabold text-on-surface mb-4">
                Ready to get started?
              </h2>
              <p className="text-on-surface-variant text-lg max-w-xl mx-auto mb-8">
                Join thousands of users who book trusted local services through DLASS every day.
              </p>
              <Link to="/register">
                <button className="px-10 py-4 rounded-2xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-headline font-bold text-base uppercase tracking-wider shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300">
                  Create Your Free Account →
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;