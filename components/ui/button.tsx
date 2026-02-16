import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          // Size variants
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2.5 text-sm",
          size === "lg" && "px-6 py-3 text-base",
          // Variant styles - Modern color scheme
          variant === "default" && "bg-[#2563EB] text-white hover:bg-[#1E3A8A] hover:shadow-md focus:ring-[#2563EB] active:scale-[0.98]",
          variant === "outline" && "border-2 border-[#E2E8F0] bg-white hover:bg-[#F1F5F9] hover:border-[#2563EB] focus:ring-[#2563EB] active:scale-[0.98]",
          variant === "ghost" && "hover:bg-[#F1F5F9] focus:ring-[#2563EB] active:scale-[0.98]",
          variant === "secondary" && "bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0] focus:ring-[#2563EB] active:scale-[0.98]",
          variant === "destructive" && "bg-[#DC2626] text-white hover:bg-[#B91C1C] hover:shadow-md focus:ring-[#DC2626] active:scale-[0.98]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
