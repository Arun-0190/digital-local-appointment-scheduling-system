import { motion } from 'framer-motion';

export default function PageWrapper({ children, className = '' }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`min-h-screen pt-24 pb-16 px-6 md:px-12 lg:px-24 mx-auto w-full max-w-[1440px] flex flex-col ${className}`}
    >
      {children}
    </motion.main>
  );
}
