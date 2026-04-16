import { motion } from "framer-motion";

const STEPS = [
  {
    step: "01",
    icon: "explore",
    title: "Discover",
    desc: "Explore a curated list of professionals in your immediate vicinity."
  },
  {
    step: "02",
    icon: "event_note",
    title: "Schedule",
    desc: "Choose a precise time slot that aligns perfectly with your lifestyle."
  },
  {
    step: "03",
    icon: "workspace_premium",
    title: "Experience",
    desc: "Receive world-class service from verified and rated experts."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4 block"
          >
            The Process
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-headline font-black text-textPrimary tracking-tight"
          >
            How it <span className="text-primary">Works</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="relative group"
            >
              {/* Connector Line */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+60px)] w-full h-[2px] bg-gradient-to-r from-primary/30 to-transparent -z-10" />
              )}

              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-3xl bg-primary/5 border border-primary/20 backdrop-blur-xl flex items-center justify-center mb-8 relative group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500 shadow-2xl">
                  <span className="material-symbols-outlined text-4xl text-primary">{step.icon}</span>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center text-xs font-black shadow-lg">
                    {step.step}
                  </div>
                </div>
                
                <h3 className="text-2xl font-headline font-bold text-textPrimary mb-4">{step.title}</h3>
                <p className="text-textSecondary leading-relaxed text-sm md:text-base max-w-[280px]">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
