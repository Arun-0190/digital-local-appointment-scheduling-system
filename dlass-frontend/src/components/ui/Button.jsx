import { motion } from 'framer-motion';

export default function Button({ children, variant = 'primary', className = '', isLoading = false, ...props }) {
  const baseStyle = "px-6 py-3 rounded-xl font-headline font-bold transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden";
  
  const variants = {
    primary: "bg-primary-gradient text-deep-navy shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]",
    secondary: "bg-cardHover text-textPrimary hover:bg-glassBorder",
    outline: "border border-glassBorder text-textSecondary hover:border-primary hover:text-primary",
    ghost: "text-textPrimary hover:bg-glassBorder",
    danger: "bg-coral/20 text-coral hover:bg-coral/30"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(20, 184, 166, 0.4)" }}
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
