"use client";

import * as React from "react";

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Switch({ label, className = "", ...props }: SwitchProps) {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        className={`peer relative w-10 h-5 bg-gray-300 rounded-full appearance-none cursor-pointer transition-colors 
          checked:bg-blue-500 focus:outline-none ${className}`}
        {...props}
      />
      <span
        className="absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform 
        peer-checked:translate-x-5 peer-focus:ring-2 peer-focus:ring-blue-400"
      />
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}
