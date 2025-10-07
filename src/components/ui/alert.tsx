"use client";

import * as React from "react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error";
  title?: string;
  children?: React.ReactNode;
}

export function Alert({ variant = "default", title, children, className = "", ...props }: AlertProps) {
  const variantStyles: Record<string, string> = {
    default: "border-gray-300 bg-gray-50 text-gray-800",
    success: "border-green-400 bg-green-50 text-green-800",
    warning: "border-yellow-400 bg-yellow-50 text-yellow-800",
    error: "border-red-400 bg-red-50 text-red-800",
  };

  return (
    <div
      className={`border rounded-lg p-4 mb-4 ${variantStyles[variant]} ${className}`}
      role="alert"
      {...props}
    >
      {title && <strong className="block font-semibold mb-1">{title}</strong>}
      <div>{children}</div>
    </div>
  );
}
