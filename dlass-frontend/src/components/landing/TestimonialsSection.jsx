import { motion } from "framer-motion";

const TESTIMONIALS = [
  { name: "Arjun Mehta", role: "Business Owner", text: "The most seamless service booking experience I've had. The gold-standard of local scheduling.", avatar: "https://i.pravatar.cc/150?u=1" },
  { name: "Sarah Khan", role: "Designer", text: "Verified professionals who actually show up on time. Highly recommended for busy individuals.", avatar: "https://i.pravatar.cc/150?u=2" },
  { name: "Rajesh Iyer", role: "Software Engineer", text: "The UI is stunning and the booking process is incredibly fast. Instant confirmation is a game changer.", avatar: "https://i.pravatar.cc/150?u=3" },
  { name: "Priya Sharma", role: "Marketing Lead", text: "Finally, a platform that takes quality seriously. I use DLASS for everything from salon to home care.", avatar: "https://i.pravatar.cc/150?u=4" }
];

export default function TestimonialsSection() {
  return (
    <section className="py-32 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-headline font-black text-white mb-4"
        >
          Trusted by <span className="text-primary">Thousands</span>
        </motion.h2>
        <p className="text-white/40 max-w-lg mx-auto">
          See what our community has to say about their DLASS experience.
        </p>
      </div>

      <div className="flex select-none">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-6 whitespace-nowrap"
        >
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <div 
              key={i}
              className="w-[450px] p-8 rounded-[32px] bg-white/[0.03] border border-white/5 backdrop-blur-3xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-2xl object-cover border border-primary/20" />
                <div>
                  <h4 className="font-headline font-bold text-white text-lg">{t.name}</h4>
                  <p className="text-primary text-xs font-bold uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
              <p className="text-white/60 leading-relaxed italic whitespace-normal">
                "{t.text}"
              </p>
              <div className="flex gap-1 mt-6">
                {[1,2,3,4,5].map(star => (
                   <span key={star} className="material-symbols-outlined text-primary text-sm fill-current">star</span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
