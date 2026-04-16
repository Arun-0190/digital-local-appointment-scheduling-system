import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export default function CursorEffect() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const springX = useSpring(mousePos.x, { stiffness: 100, damping: 20 });
  const springY = useSpring(mousePos.y, { stiffness: 100, damping: 20 });

  if (isMobile) return null;

  return (
    <motion.div
      style={{
        left: springX,
        top: springY,
      }}
      className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/10 rounded-full blur-[60px]"
    />
  );
}
