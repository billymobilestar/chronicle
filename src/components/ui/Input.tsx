"use client";

import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-xs font-display font-bold uppercase tracking-widest text-cobalt/60">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full px-4 py-3 rounded-2xl border-2 border-cobalt/10 bg-white text-cobalt font-body",
          "focus:outline-none focus:ring-0 focus:border-accent",
          "placeholder:text-cobalt/30 transition-all duration-200",
          error && "border-red-400 focus:border-red-400",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-body">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-xs font-display font-bold uppercase tracking-widest text-cobalt/60">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "w-full px-4 py-3 rounded-2xl border-2 border-cobalt/10 bg-white text-cobalt font-body",
          "focus:outline-none focus:ring-0 focus:border-accent",
          "placeholder:text-cobalt/30 transition-all duration-200 resize-y min-h-[120px]",
          error && "border-red-400 focus:border-red-400",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-body">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className, id, ...props }: SelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-xs font-display font-bold uppercase tracking-widest text-cobalt/60">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "w-full px-4 py-3 rounded-2xl border-2 border-cobalt/10 bg-white text-cobalt font-body",
          "focus:outline-none focus:ring-0 focus:border-accent",
          "transition-all duration-200",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 font-body">{error}</p>}
    </div>
  );
}
