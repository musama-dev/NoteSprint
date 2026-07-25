import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

function AppleRadialSpinner({ className = "h-8 w-8 text-amber-500" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 100 100" fill="currentColor">
      {[...Array(12)].map((_, i) => (
        <rect
          key={i}
          x="46"
          y="10"
          width="8"
          height="24"
          rx="4"
          transform={`rotate(${i * 30} 50 50)`}
          opacity={0.15 + (i / 12) * 0.85}
        />
      ))}
    </svg>
  );
}

function LoadingScreen() {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-white px-4">
      <motion.img
        src={logo}
        alt="NoteSprint AI"
        className="h-10 w-auto"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <AppleRadialSpinner className="h-8 w-8 text-amber-500" />
      {showHint && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xs text-center text-sm font-medium text-slate-500"
        >
          Connecting to NoteSprint AI server… thanks for your patience!
        </motion.p>
      )}
    </div>
  );
}

export default LoadingScreen;
