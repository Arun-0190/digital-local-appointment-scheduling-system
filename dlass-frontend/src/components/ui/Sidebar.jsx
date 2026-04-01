import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ items = [], onNavigate, isOpen, setIsOpen }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarContent = (
    <div className="h-full flex flex-col py-6 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-glassBorder scrollbar-track-transparent">
       {!isMobile && (
         <div className="flex justify-end mb-6">
           <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95 group">
              <span className="material-symbols-outlined text-textSecondary group-hover:text-primary transition-colors">
                {isOpen ? 'menu_open' : 'menu'}
              </span>
           </button>
         </div>
       )}

       <div className="flex-1 space-y-3 flex flex-col">
         {items.map((item) => (
           <button
             key={item.id}
             onClick={() => { onNavigate(item.id); if (isMobile) setIsOpen(false); }}
             className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
               item.active 
                 ? "text-primary font-bold shadow-sm" 
                 : "text-textSecondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-textPrimary"
             }`}
           >
             {item.active && (
               <motion.div 
                 layoutId="sidebar-active" 
                 className="absolute inset-0 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-2xl z-0" 
                 transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
               />
             )}
             
             <div className="relative z-10 flex items-center gap-4 w-full">
               <motion.span 
                 whileHover={{ rotate: [0, -12, 12, -4, 0], scale: 1.15 }}
                 transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
                 className={`material-symbols-outlined text-2xl transition-transform duration-300 ${item.active ? 'scale-110 text-primary drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'text-textSecondary group-hover:text-primary group-hover:scale-110'}`}
               >
                 {item.icon}
               </motion.span>
               
               <AnimatePresence mode="popLayout">
                 {(isOpen || isMobile) && (
                   <motion.div 
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -10 }}
                     transition={{ duration: 0.2 }}
                     className="whitespace-nowrap tracking-wide text-[15px] origin-left flex-1 text-left"
                   >
                     {item.label}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
           </button>
         ))}
       </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
               onClick={() => setIsOpen(false)}
            />
            <motion.div
               initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
               transition={{ type: "spring", stiffness: 350, damping: 30 }}
               className="fixed left-0 top-0 bottom-0 w-[280px] bg-glassBg backdrop-blur-3xl border-r border-glassBorder z-[210] shadow-2xl"
            >
              {/* Mobile Header Logo */}
              <div className="flex items-center justify-between p-6 border-b border-glassBorder mb-2">
                <div className="font-headline font-black text-2xl tracking-tighter text-textPrimary flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                    D
                  </div>
                  DLASS
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 bg-black/5 dark:bg-white/5 rounded-full">
                  <span className="material-symbols-outlined text-textPrimary text-sm">close</span>
                </button>
              </div>
              
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.div 
      initial={false}
      animate={{ width: isOpen ? 280 : 88 }}
      transition={{ type: "spring", stiffness: 400, damping: 40 }}
      className="hidden lg:block shrink-0 h-[calc(100vh-80px)] top-[80px] sticky bg-glassBg/40 backdrop-blur-2xl border-r border-glassBorder overflow-x-hidden rounded-tr-3xl shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
    >
      {sidebarContent}
    </motion.div>
  );
}
