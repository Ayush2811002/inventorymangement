"use client";
import * as React from "react";

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      className={`h-5 w-5 accent-blue-500 cursor-pointer ${className}`}
      {...props}
    />
  );
});

Checkbox.displayName = "Checkbox";
