"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "neon";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: "bg-cobalt text-white hover:bg-accent hover:scale-105",
  secondary: "bg-pale-sky/50 text-cobalt hover:bg-cobalt hover:text-white",
  outline: "border-2 border-cobalt text-cobalt hover:bg-cobalt hover:text-white",
  ghost: "text-cobalt hover:bg-cobalt/5",
  danger: "bg-red-600 text-white hover:bg-red-700",
  neon: "bg-neon text-cobalt-dark hover:scale-105",
};

const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-display font-bold uppercase tracking-wider rounded-full transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}
