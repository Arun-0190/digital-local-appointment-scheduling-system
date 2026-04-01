import { motion } from 'framer-motion';

export default function Button({ children, variant = 'primary', className = '', isLoading = false, ...props }) {
  const baseStyle = "px-6 py-3 rounded-xl font-headline font-bold transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden";
  
  const variants = {
    primary: "bg-primary-gradient text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.5)]",
    secondary: "bg-white dark:bg-white/10 text-primary border border-indigo-500/20 hover:bg-indigo-500/5",
    outline: "border border-indigo-500/20 text-textSecondary hover:border-primary hover:text-primary hover:bg-primary/5",
    ghost: "text-textPrimary hover:bg-black/5 dark:hover:bg-white/5",
    danger: "bg-coral/10 text-coral border border-coral/20 hover:bg-coral/20"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={variant === 'primary' ? { y: -2 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`${baseStyle} ${variants[variant]} ${className} ${isLoading || props.disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined animate-spin spinner"></span>
      ) : children}
    </motion.button>
  );
}
