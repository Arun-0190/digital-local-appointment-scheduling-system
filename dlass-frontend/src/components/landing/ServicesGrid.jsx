import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SERVICES = [
  { id: "salon", icon: "content_cut", title: "Luxury Salon", desc: "Premium hair and beauty care.", img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800" },
  { id: "healthcare", icon: "medical_services", title: "Healthcare", desc: "Verified medical professionals.", img: "https://images.unsplash.com/photo-1505751172107-59727b00bb01?auto=format&fit=crop&q=80&w=800" },
  { id: "home", icon: "home_repair_service", title: "Home Care", desc: "Expert cleaning & maintenance.", img: "https://images.unsplash.com/photo-1581578731548-c64695ce6958?auto=format&fit=crop&q=80&w=800" },
  { id: "logistics", icon: "local_shipping", title: "Logistics", desc: "Swift & secure local delivery.", img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800" },
];

export default function ServicesGrid({ userPincode }) {
  const navigate = useNavigate();

  const handleCardClick = (title) => {
    const params = new URLSearchParams({ category: title });
    if (userPincode) params.set("pincode", userPincode);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className="py-32 px-6 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-xl">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4 block"
            >
              Categories
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-headline font-black text-textPrimary tracking-tight"
            >
              Curated <span className="text-primary">Services</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <button 
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all"
            >
              View All Services
              <span className="material-symbols-outlined">east</span>
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              onClick={() => handleCardClick(service.title)}
              className="relative group h-[400px] rounded-[32px] overflow-hidden cursor-pointer shadow-2xl"
            >
              <img 
                src={service.img} 
                alt={service.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-md border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-black transition-all">
                  <span className="material-symbols-outlined text-2xl">{service.icon}</span>
                </div>
                <h3 className="text-2xl font-headline font-bold text-white mb-2">{service.title}</h3>
                <p className="text-white/60 text-sm group-hover:text-white transition-colors">
                  {service.desc}
                </p>
                <div className="mt-6 flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  Book Appointment <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
