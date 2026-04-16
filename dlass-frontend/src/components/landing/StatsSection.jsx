import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

function Counter({ value, duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const numericValue = parseInt(value);
  const suffix = value.replace(numericValue, "");

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = numericValue;
      const increment = end / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [isInView, numericValue, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const STATS = [
  { icon: "event_available", value: "50K+", label: "Appointments Booked" },
  { icon: "verified_user", value: "2K+", label: "Verified Experts" },
  { icon: "location_city", value: "120+", label: "Cities Covered" },
  { icon: "avg_pace", value: "98%", label: "Satisfaction Rate" },
];

export default function StatsSection() {
  return (
    <section className="py-20 px-6 border-y border-white/5 bg-[#0a0a0a]">
      <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:border-primary/50 transition-colors shadow-xl">
              <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">
                {stat.icon}
              </span>
            </div>
            <h3 className="text-4xl md:text-5xl font-headline font-black text-textPrimary mb-2">
              <Counter value={stat.value} />
            </h3>
            <p className="text-xs font-label tracking-[0.2em] text-textSecondary uppercase font-bold">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
