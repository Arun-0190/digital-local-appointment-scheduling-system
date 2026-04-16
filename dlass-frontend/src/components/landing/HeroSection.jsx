import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

export default function HeroSection({ token, dashboardPath }) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[#0D0D0D]">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#0D0D0D_70%)]" />
      </div>

      <motion.div 
        style={{ y: y1, opacity }}
        className="relative z-10 max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-primary text-xs font-bold tracking-[0.2em] uppercase mb-10 shadow-2xl"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Digital Local Appointment Scheduling
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-[100px] font-headline font-black tracking-tight mb-8 leading-[0.9] text-textPrimary"
        >
          Your Time,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary bg-[length:200%_auto] animate-gradient-x px-2">
            Refined.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-textSecondary text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed mb-12 font-medium"
        >
          Connect with elite local professionals near you. 
          Experience seamless scheduling for all your essential services.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6"
        >
          <Link to="/search">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="!px-10 !py-5 text-lg shadow-[0_0_30px_rgba(255,191,0,0.3)] group hover:shadow-[0_0_50px_rgba(255,191,0,0.5)] transition-all">
                <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">search</span>
                Find Providers
              </Button>
            </motion.div>
          </Link>

          {token ? (
            <Link to={dashboardPath}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="!px-10 !py-5 text-lg backdrop-blur-xl bg-white/5 border-white/20 hover:border-primary/50 transition-colors">
                  <span className="material-symbols-outlined text-2xl">dashboard</span>
                  Dashboard
                </Button>
              </motion.div>
            </Link>
          ) : (
            <Link to="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="!px-10 !py-5 text-lg backdrop-blur-xl bg-white/5 border-white/20 hover:border-primary/50 transition-colors">
                  Get Started →
                </Button>
              </motion.div>
            </Link>
          )}
        </motion.div>
      </motion.div>

      {/* Floating Elements (Subtle) */}
      <motion.div 
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-40 right-[10%] w-24 h-24 bg-primary/5 rounded-2xl border border-primary/10 backdrop-blur-3xl -z-10 hidden xl:flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-primary/40 text-4xl">calendar_today</span>
      </motion.div>

      <motion.div 
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-40 left-[10%] w-32 h-32 bg-amber-500/5 rounded-full border border-primary/10 backdrop-blur-3xl -z-10 hidden xl:flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-primary/30 text-5xl">verified</span>
      </motion.div>
    </section>
  );
}
