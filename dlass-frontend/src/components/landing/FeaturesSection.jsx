import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: "verified",
    title: "Vetted Professionals",
    desc: "Rigorous 5-step verification process for every service provider on our platform."
  },
  {
    icon: "speed",
    title: "Instant Booking",
    desc: "Confirm your appointment in under 60 seconds with real-time availability sync."
  },
  {
    icon: "security",
    title: "Secure Payments",
    desc: "Encrypted transactions and fraud protection for complete peace of mind."
  },
  {
    icon: "support_agent",
    title: "24/7 Concierge",
    desc: "Our dedicated support team is always available to assist with your bookings."
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4 block"
            >
              Why DLASS
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-headline font-black text-textPrimary tracking-tight mb-8"
            >
              Excellence in <br />
              <span className="text-primary">Every Interaction.</span>
            </motion.h2>
            <p className="text-textSecondary text-lg leading-relaxed mb-12 max-w-lg">
              We've redesigned the local service experience from the ground up, 
              focusing on quality, speed, and absolute reliability.
            </p>
            
            <div className="flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0D0D0D] overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-textPrimary">
                Joined by <span className="text-primary">12,000+</span> users this month
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-black transition-all">
                  <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-headline font-bold text-textPrimary mb-3">{feature.title}</h3>
                <p className="text-textSecondary text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
