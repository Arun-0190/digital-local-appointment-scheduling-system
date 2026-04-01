import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  containerClassName = "",
  label,
  icon = "calendar_month",
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse current value or use today
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) setCurrentMonth(new Date(value));
  }, [value]);

  // Logic for generating calendar days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxSelectableDate = new Date(today);
  maxSelectableDate.setDate(today.getDate() + 28);

  // Month navigation
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Generate 42 days (6 weeks) for the current month view
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const calendarDays = [];
  
  // Previous month padding
  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDays - i);
    calendarDays.push({ date: d, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    calendarDays.push({ date: d, isCurrentMonth: true });
  }

  // Next month padding
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    const d = new Date(year, month + 1, i);
    calendarDays.push({ date: d, isCurrentMonth: false });
  }

  const isDateSelectable = (d) => {
    d.setHours(0, 0, 0, 0);
    return d >= today && d <= maxSelectableDate;
  };

  const isSameDate = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getDate() === d2.getDate();
  };

  const handleSelectDate = (d) => {
    if (!isDateSelectable(d)) return;
    const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    onChange(dateString);
    setIsOpen(false);
  };

  // Display formatting
  const formattedValue = value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "";
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
        <span className={value ? "text-gray-900 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"}>
          {formattedValue || placeholder}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full z-[70] w-full min-w-[280px] mt-2 bg-glassBg backdrop-blur-2xl border border-glassBorder rounded-2xl shadow-2xl p-4 overflow-hidden"
          >
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-4">
              <button type="button" onClick={prevMonth} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-textSecondary transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <h4 className="font-bold text-sm text-textPrimary tracking-wide">
                {monthNames[month]} {year}
              </h4>
              <button type="button" onClick={nextMonth} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-textSecondary transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-textSecondary/70 uppercase tracking-widest py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((calDay, i) => {
                const selectable = isDateSelectable(calDay.date);
                const selected = isSameDate(calDay.date, value ? new Date(value) : null);
                const current = isSameDate(calDay.date, today);

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!selectable}
                    onClick={() => handleSelectDate(calDay.date)}
                    className={`
                      relative flex items-center justify-center h-8 w-full rounded-lg text-sm transition-all duration-200
                      ${!calDay.isCurrentMonth ? 'opacity-30' : ''}
                      ${!selectable ? 'opacity-20 cursor-not-allowed saturate-0' : 'hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer'}
                      ${current && !selected ? 'border border-primary text-primary font-bold' : ''}
                      ${selected ? 'bg-primary text-deep-navy font-bold shadow-md shadow-primary/30 transform scale-105' : 'text-textPrimary'}
                    `}
                  >
                    {calDay.date.getDate()}
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
