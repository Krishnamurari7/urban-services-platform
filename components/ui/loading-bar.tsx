"use client";

import { useEffect, useState } from "react";

interface LoadingBarProps {
  text?: string;
  className?: string;
  compact?: boolean;
  variant?: "default" | "outline";
}

export function LoadingBar({ text = "Vera Company", className = "", compact = false, variant = "default" }: LoadingBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          return prev; // Stop at 90% until loading completes
        }
        return prev + Math.random() * 15; // Increment by random amount
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  if (compact) {
    const textColor = variant === "outline" ? "text-gray-700" : "text-white";
    const barBg = variant === "outline" ? "bg-gray-200" : "bg-white/30";
    const barFill = variant === "outline" ? "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" : "bg-white";
    
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`text-sm font-semibold ${textColor} animate-pulse`}>
          {text}
        </div>
        <div className={`flex-1 h-1.5 ${barBg} rounded-full overflow-hidden`}>
          <div
            className={`h-full ${barFill} rounded-full transition-all duration-300 ease-out relative`}
            style={{
              width: `${Math.min(progress, 100)}%`,
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${variant === "outline" ? "via-white/30" : "via-white/50"} to-transparent animate-shimmer`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="text-sm font-semibold text-gray-700 animate-pulse">
        {text}
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full transition-all duration-300 ease-out relative"
          style={{
            width: `${Math.min(progress, 100)}%`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}
