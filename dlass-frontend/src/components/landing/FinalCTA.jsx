import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

export default function FinalCTA() {
  return (
    <section className="py-40 px-6 relative overflow-hidden bg-[#0D0D0D]">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -z-10" />
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="p-12 md:p-24 rounded-[64px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-headline font-black text-textPrimary tracking-tight mb-8"
          >
            Elevate Your <span className="text-primary">Schedule.</span>
          </motion.h2>
          <p className="text-textSecondary text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Join the elite circle of users who value their time. 
            Experience local services with unmatched convenience and quality.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="!px-12 !py-6 text-xl shadow-[0_0_50px_rgba(255,191,0,0.2)]">
                  Get Started Free
                </Button>
              </motion.div>
            </Link>
            <Link to="/search">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="!px-12 !py-6 text-xl">
                  Browse Services
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer-ish text */}
      <div className="mt-24 text-center">
        <p className="text-textSecondary/40 text-xs font-bold tracking-[0.4em] uppercase">
          DLASS — The Future of Local Services
        </p>
      </div>
    </section>
  );
}
