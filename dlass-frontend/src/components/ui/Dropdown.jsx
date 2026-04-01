import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  containerClassName = "",
  label,
  icon
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value)) || null;

  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`} ref={containerRef}>
      {label && <label className="font-label text-sm text-textSecondary font-medium tracking-wide flex items-center gap-1">{label}</label>}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between bg-inputBg border ${isOpen ? 'border-primary ring-2 ring-primary/50 shadow-[0_0_15px_rgba(20,184,166,0.2)] -translate-y-[1px]' : 'border-inputBorder'} text-gray-900 dark:text-white rounded-xl px-4 py-3.5 outline-none transition-all duration-300 ${icon ? 'pl-12' : ''} ${className}`}
        >
          {icon && (
            <span className="material-symbols-outlined absolute left-4 text-textSecondary pointer-events-none">
              {icon}
            </span>
          )}
          <span className={selectedOption ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
            {selectedOption ? selectedOption.label : placeholder}
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
              className="absolute z-[60] w-full mt-2 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-2xl border border-glassBorder rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-glassBorder scrollbar-track-transparent">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      String(value) === String(opt.value)
                        ? 'bg-primary/20 text-primary font-bold'
                        : 'text-gray-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
