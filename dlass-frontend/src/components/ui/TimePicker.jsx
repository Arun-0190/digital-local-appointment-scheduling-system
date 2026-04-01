import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  className = "",
  containerClassName = "",
  label,
  icon = "schedule",
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format 24hr string for backend (e.g., "14:30")
  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        
        slots.push({ value: `${hh}:${mm}`, display: `${displayH}:${mm} ${ampm}` });
      }
    }
    return slots;
  };

  const times = generateTimeSlots();
  const selectedObj = times.find(t => t.value === value);

  // Auto scroll to selected value when opened
  useEffect(() => {
    if (isOpen && scrollRef.current && value) {
      const selectedEl = scrollRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        scrollRef.current.scrollTop = selectedEl.offsetTop - scrollRef.current.offsetHeight / 2 + 20;
      }
    }
  }, [isOpen, value]);

  return (
    <div className={`flex flex-col gap-2 relative ${containerClassName}`} ref={containerRef}>
      {label && <label className="font-label text-sm text-textSecondary font-medium tracking-wide flex items-center gap-1">{label}</label>}
      
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-inputBg backdrop-blur-md border ${isOpen ? 'border-primary ring-2 ring-primary/50 shadow-[0_0_15px_rgba(20,184,166,0.2)] -translate-y-[1px]' : 'border-inputBorder'} text-gray-900 dark:text-gray-200 rounded-xl px-4 py-3.5 outline-none transition-all duration-300 ${icon ? 'pl-12' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {icon && (
          <span className="material-symbols-outlined absolute left-4 text-textSecondary pointer-events-none">
            {icon}
          </span>
        )}
        <span className={selectedObj ? "text-gray-900 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"}>
          {selectedObj ? selectedObj.display : placeholder}
        </span>
        <span className={`material-symbols-outlined text-textSecondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full z-[70] w-full min-w-[200px] mt-2 bg-glassBg backdrop-blur-2xl border border-glassBorder rounded-2xl shadow-2xl p-2 overflow-hidden"
          >
            <div 
              ref={scrollRef}
              className="max-h-64 overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-glassBorder scrollbar-track-transparent flex flex-col gap-1 pb-4"
            >
              <div className="text-xs font-label uppercase tracking-widest text-textSecondary font-bold px-3 py-2">Select Time</div>
              
              {times.map((t) => {
                const isSelected = t.value === value;
                return (
                  <button
                    key={t.value}
                    data-selected={isSelected}
                    type="button"
                    onClick={() => {
                      onChange(t.value);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 font-medium
                      ${isSelected 
                        ? 'bg-primary/20 text-primary font-bold shadow-inner' 
                        : 'text-textPrimary hover:bg-black/5 dark:hover:bg-white/10'
                      }
                    `}
                  >
                    {t.display}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
