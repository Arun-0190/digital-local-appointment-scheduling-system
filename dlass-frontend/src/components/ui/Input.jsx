export default function Input({ label, icon, error, className = '', containerClassName = '', ...props }) {
  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      {label && <label className="font-label text-sm text-textSecondary font-medium tracking-wide">{label}</label>}
      <div className="relative flex items-center">
        {icon && (
          <span className="material-symbols-outlined absolute left-4 text-textSecondary pointer-events-none">
            {icon}
          </span>
        )}
        <input 
          className={`w-full bg-inputBg border ${error ? 'border-coral text-coral' : 'border-inputBorder text-gray-900 dark:text-white'} rounded-xl px-4 py-3.5 ${icon ? 'pl-12' : ''} focus:border-primary focus:ring-2 focus:ring-primary/50 focus:shadow-[0_0_15px_rgba(20,184,166,0.2)] focus:-translate-y-[1px] outline-none transition-all duration-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-coral mt-1">{error}</span>}
    </div>
  );
}
