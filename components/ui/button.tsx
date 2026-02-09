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
          // Variant styles
          variant === "default" && "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md focus:ring-blue-500 active:scale-[0.98]",
          variant === "outline" && "border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-500 active:scale-[0.98]",
          variant === "ghost" && "hover:bg-gray-100 focus:ring-gray-500 active:scale-[0.98]",
          variant === "secondary" && "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 active:scale-[0.98]",
          variant === "destructive" && "bg-red-600 text-white hover:bg-red-700 hover:shadow-md focus:ring-red-500 active:scale-[0.98]",
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
