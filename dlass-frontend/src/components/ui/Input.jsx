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
          className={`w-full bg-inputBg border ${error ? 'border-coral text-coral focus:ring-coral/20' : 'border-inputBorder text-gray-900 dark:text-white focus:border-primary focus:ring-primary/20'} rounded-xl px-4 py-3.5 ${icon ? 'pl-11' : ''} focus:ring-4 outline-none transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-coral mt-1">{error}</span>}
    </div>
  );
}
