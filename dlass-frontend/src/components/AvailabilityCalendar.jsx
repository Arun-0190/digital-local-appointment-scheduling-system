import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function AvailabilityCalendar({ availability, appointments, onDateSelect, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  };

  const isSelected = (day) => {
    return selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
  };

  const hasAvailability = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    return availability.some(a => a.dayOfWeek === dayName);
  };

  const hasAppointments = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.some(app => app.date === dateStr);
  };

  return (
    <div className="glass-card rounded-3xl p-6 shadow-2xl border border-glassBorder select-none">
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h3 className="text-xl font-headline font-black text-textPrimary flex items-center gap-2">
            {MONTHS[currentMonth]} <span className="text-primary font-normal">{currentYear}</span>
          </h3>
        </div>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-textSecondary hover:text-primary transition-all">
            <span className="material-symbols-outlined text-xl">chevron_left</span>
          </button>
          <button onClick={() => { setCurrentMonth(new Date().getMonth()); setCurrentYear(new Date().getFullYear()); }} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/20 transition-all">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 rounded-xl bg-black/5 dark:bg-white/5 text-textSecondary hover:text-primary transition-all">
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center py-2 text-[10px] font-label font-bold text-textSecondary/40 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square p-2 opacity-0" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const active = hasAvailability(day);
          const busy = hasAppointments(day);
          const selected = isSelected(day);
          const today = isToday(day);

          return (
            <motion.div
              key={day}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDateSelect(new Date(currentYear, currentMonth, day))}
              className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all border
                ${selected ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 z-10' : 
                  today ? 'bg-indigo-500/10 text-primary border-primary/30' : 
                  'bg-black/5 dark:bg-white/5 border-transparent hover:border-glassBorder/50'}
              `}
            >
              <span className={`text-sm font-headline font-bold ${selected ? 'text-white' : today ? 'text-primary' : 'text-textPrimary'}`}>
                {day}
              </span>
              
              <div className="absolute bottom-2 flex gap-1">
                {active && !selected && <div className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" />}
                {busy && !selected && <div className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />}
              </div>

              {selected && (
                <motion.div 
                  layoutId="calendar-selection" 
                  className="absolute inset-0 border-2 border-white/20 rounded-2xl" 
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-label font-bold text-textSecondary uppercase tracking-widest">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[10px] font-label font-bold text-textSecondary uppercase tracking-widest">Has Bookings</span>
        </div>
        <div className="flex items-center gap-2 border-l border-glassBorder pl-4">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[10px] font-label font-bold text-textSecondary uppercase tracking-widest">Selected</span>
        </div>
      </div>
    </div>
  );
}
