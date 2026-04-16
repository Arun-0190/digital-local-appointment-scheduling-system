import { useState, useEffect } from "react";

const Avatar = ({ 
  src, 
  name = "User", 
  size = "md", 
  className = "", 
  glow = false,
  fallbackBg = "bg-primary/20",
  fallbackColor = "text-primary"
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Generate initials from name or business name
  const getInitials = (str) => {
    if (!str) return "U";
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-9 h-9 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-24 h-24 text-xl",
    xl: "w-32 h-32 md:w-40 md:h-40 text-4xl"
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  // Reset state when src changes
  useEffect(() => {
    setImageLoaded(false);
    setError(false);
  }, [src]);

  const initials = getInitials(name);

  return (
    <div className={`relative flex items-center justify-center rounded-full overflow-hidden shrink-0 transition-all duration-500 
      ${currentSizeClass} 
      ${glow ? "shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] ring-2 ring-primary/20" : "border border-glassBorder"} 
      ${className}`}
    >
      {src && !error ? (
        <>
          {!imageLoaded && (
            <div className={`absolute inset-0 flex items-center justify-center ${fallbackBg} ${fallbackColor} font-bold animate-pulse`}>
              {initials}
            </div>
          )}
          <img
            src={src}
            alt={name}
            className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setError(true)}
          />
        </>
      ) : (
        <div className={`w-full h-full flex items-center justify-center ${fallbackBg} ${fallbackColor} font-black tracking-tighter`}>
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar;
