import { motion } from "framer-motion";

export default function Checkbox({ checked, onChange, label, className = "" }) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer group ${className}`}>
      <div className="relative flex items-center justify-center w-5 h-5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <motion.div
           initial={false}
           animate={{
             backgroundColor: checked ? 'rgb(20 184 166)' : 'rgba(0,0,0,0)',
             borderColor: checked ? 'rgb(20 184 166)' : 'rgba(148, 163, 184, 0.4)'
           }}
           className="w-full h-full rounded border-2 flex items-center justify-center transition-colors group-hover:border-primary"
        >
          <motion.svg
            initial={false}
            animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-3.5 h-3.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        </motion.div>
      </div>
      {label && <span className="text-sm font-medium text-textPrimary select-none group-hover:text-primary transition-colors">{label}</span>}
    </label>
  );
}
