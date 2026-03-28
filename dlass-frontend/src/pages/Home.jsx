import { Link } from "react-router-dom";
import { getToken, getUserRole } from "../services/authService";

function Home() {
  const token = getToken();
  const role = getUserRole();
  const dashboardPath = role === "PROVIDER" ? "/provider-dashboard" : "/dashboard";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 pb-10 relative overflow-hidden">
      {/* decorative nebula glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/20 border border-primary/20 text-primary text-xs font-label font-bold tracking-widest uppercase mb-8">
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          Digital Local Appointment Scheduling
        </span>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter mb-6 leading-none">
          <span className="text-white">Your services,</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-primary to-secondary">
            effortlessly scheduled.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-on-surface-variant text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-10">
          Connect with trusted local professionals — plumbers, electricians, cleaners,
          and more — all near you. Book in seconds.
        </p>

        {/* CTAs */}
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
    </div>
  );
}

export default Home;