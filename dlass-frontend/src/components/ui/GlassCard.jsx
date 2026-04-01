import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hoverEffect = false, interactive = false, ...props }) {
  const isInteractive = hoverEffect || interactive;
  
  return (
    <motion.div 
      whileHover={isInteractive ? { y: -4, boxShadow: "0 10px 30px -10px rgba(34, 211, 238, 0.3)", borderColor: "rgba(34, 211, 238, 0.4)" } : {}}
      whileTap={isInteractive ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`glass-card rounded-2xl p-6 md:p-8 ${className}`} 
      {...props}
    >
      {children}
    </motion.div>
  );
}
