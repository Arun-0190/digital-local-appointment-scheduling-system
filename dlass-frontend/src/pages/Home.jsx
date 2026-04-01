import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken, getUserRole } from "../services/authService";
import PageWrapper from "../components/ui/PageWrapper";
import GlassCard from "../components/ui/GlassCard";
import Button from "../components/ui/Button";

const API = "http://localhost:8080/api";

const POPULAR_SERVICES = [
  {
    id: "plumbing",
    icon: "plumbing",
    title: "Plumbing",
    desc: "Leaks, pipe repairs & installations",
    color: "from-blue-500/20 to-cyan-400/10",
    border: "border-blue-400/20",
    text: "text-cyan-400",
  },
  {
    id: "electrical",
    icon: "electrical_services",
    title: "Electrician",
    desc: "Wiring, fuse boxes & fittings",
    color: "from-yellow-500/20 to-amber-400/10",
    border: "border-yellow-400/20",
    text: "text-yellow-400",
  },
  {
    id: "salon",
    icon: "content_cut",
    title: "Salon",
    desc: "Hair, skin & beauty services",
    color: "from-coral/20 to-rose-400/10",
    border: "border-coral/20",
    text: "text-coral",
  },
  {
    id: "cleaning",
    icon: "cleaning_services",
    title: "Cleaning",
    desc: "Home deep clean & sanitisation",
    color: "from-primary/20 to-emerald-400/10",
    border: "border-primary/20",
    text: "text-primary",
  },
  {
    id: "medical",
    icon: "medical_services",
    title: "Medical",
    desc: "Nurse visits & medical care at home",
    color: "from-red-500/20 to-rose-400/10",
    border: "border-red-400/20",
    text: "text-red-400",
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

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${API}/users/me`, { headers: authHeaders() })
      .then((res) => {
        const pincode = res.data.pincode;
        setUserPincode(pincode);
      })
      .catch(() => {});
  }, [token]);

  return (
    <PageWrapper className="!px-0 !max-w-full !pt-16">
      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 relative">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-label font-bold tracking-widest uppercase mb-8">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Digital Local Appointment Scheduling
          </span>

          <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter mb-6 leading-tight text-textPrimary">
            Your services,
            <br />
            <span className="text-transparent bg-clip-text bg-primary-gradient">
              effortlessly scheduled.
            </span>
          </h1>

          <p className="text-textSecondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Connect with trusted local professionals — plumbers, electricians, cleaners,
            and more — all near you. Book in seconds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/search">
              <Button className="!px-8 !py-4 text-base shadow-xl">
                <span className="material-symbols-outlined text-xl">search</span>
                Find Providers
              </Button>
            </Link>

            {token ? (
              <Link to={dashboardPath}>
                <Button variant="outline" className="!px-8 !py-4 text-base backdrop-blur-sm bg-white/5">
                  <span className="material-symbols-outlined text-xl">dashboard</span>
                  My Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button variant="outline" className="!px-8 !py-4 text-base backdrop-blur-sm bg-white/5">
                  Get Started Free →
                </Button>
              </Link>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-12 mt-20">
            {[
              { icon: "verified", value: "500+", label: "Verified Providers" },
              { icon: "star", value: "4.9★", label: "Average Rating" },
              { icon: "calendar_month", value: "10k+", label: "Bookings Made" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-3xl">{stat.icon}</span>
                <span className="text-3xl font-headline font-black text-textPrimary">{stat.value}</span>
                <span className="text-xs text-textSecondary font-label tracking-widest uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR SERVICES ──────────────────────────────────── */}
      <section className="px-6 py-20 bg-black/5 dark:bg-white/5 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-textPrimary mb-3">
              Popular Services
            </h2>
            <p className="text-textSecondary text-base max-w-lg mx-auto">
              Tap a category to instantly find providers near you.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {POPULAR_SERVICES.map((svc) => (
              <GlassCard
                key={svc.id}
                hoverEffect
                onClick={() => {
                  const params = new URLSearchParams({ category: svc.title });
                  if (userPincode) params.set("pincode", userPincode);
                  navigate(`/search?${params.toString()}`);
                }}
                className={`group !p-6 flex flex-col items-center gap-3 bg-gradient-to-br ${svc.color} border ${svc.border}`}
              >
                <div className={`w-14 h-14 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors`}>
                  <span className={`material-symbols-outlined text-3xl ${svc.text}`}>{svc.icon}</span>
                </div>
                <div className="text-center">
                  <div className="font-headline font-bold text-textPrimary text-sm">{svc.title}</div>
                  <div className="text-xs text-textSecondary mt-1 leading-snug">{svc.desc}</div>
                </div>
                {userPincode && (
                  <span className="absolute top-3 right-3 text-[9px] font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full border border-secondary/20 uppercase tracking-wider">
                    Near you
                  </span>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECOMMENDED / HOW IT WORKS ───────────────────────── */}
      <section className="px-6 py-20 max-w-7xl mx-auto w-full">
        <GlassCard className="!p-8 md:!p-12 relative overflow-hidden mb-20">
          <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative z-10 w-full max-w-3xl">
            {token ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-secondary text-3xl">location_on</span>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-textPrimary">
                      Recommended for You
                    </h2>
                    {userPincode && (
                      <p className="text-textSecondary text-sm mt-1">
                        Based on your area: <span className="text-secondary font-bold">{userPincode}</span>
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-textSecondary mb-8 text-lg">
                  We've matched service providers close to your registered pincode. Browse and book below.
                </p>
                <Button
                  onClick={() => navigate(`/search${userPincode ? `?pincode=${userPincode}` : ""}`)}
                  className="shadow-lg"
                >
                  <span className="material-symbols-outlined text-xl">near_me</span>
                  Find Providers Near Me
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-2xl md:text-3xl font-headline font-extrabold text-textPrimary mb-4">
                  Top Providers Near You
                </h2>
                <p className="text-textSecondary mb-8 text-lg">
                  Sign in to see personalised provider suggestions based on your pincode and booking history.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/register"><Button>Create Account</Button></Link>
                  <Link to="/login"><Button variant="outline">Sign In</Button></Link>
                </div>
              </>
            )}
          </div>
        </GlassCard>

        {/* HOW IT WORKS */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-textPrimary mb-3">
            How It Works
          </h2>
          <p className="text-textSecondary text-base">Three simple steps to get any job done.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={item.step} className="relative">
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:block absolute top-[40px] left-[60%] w-[80%] h-px bg-gradient-to-r from-glassBorder to-transparent z-0" />
              )}
              <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-lg">
                  <span className="material-symbols-outlined text-primary text-3xl">{item.icon}</span>
                </div>
                <div className="text-xs font-label tracking-widest text-textSecondary uppercase mb-2">
                  Step {item.step}
                </div>
                <h3 className="text-xl font-headline font-bold text-textPrimary mb-3">{item.title}</h3>
                <p className="text-textSecondary text-sm leading-relaxed max-w-[250px]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      {!token && (
        <section className="px-6 py-20 max-w-7xl mx-auto w-full">
          <GlassCard className="!p-10 md:!p-16 text-center">
            <h2 className="text-3xl md:text-5xl font-headline font-extrabold text-textPrimary mb-4">
              Ready to get started?
            </h2>
            <p className="text-textSecondary text-lg max-w-xl mx-auto mb-8">
              Join thousands of users who book trusted local services through DLASS every day.
            </p>
            <Link to="/register">
              <Button className="mx-auto shadow-2xl !px-10 !py-5 text-lg">
                Create Your Free Account →
              </Button>
            </Link>
          </GlassCard>
        </section>
      )}
    </PageWrapper>
  );
}

export default Home;