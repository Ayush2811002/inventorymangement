// ✅ This version supports `onCheckedChange` properly
"use client";
import * as React from "react";

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    onCheckedChange?: (checked: boolean) => void; // 👈 custom prop
  }
>(({ className, onCheckedChange, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      className={`h-5 w-5 accent-blue-500 cursor-pointer ${className}`}
      onChange={(e) => {
        onCheckedChange?.(e.target.checked); // ✅ call custom handler
        props.onChange?.(e);                 // ✅ still support default
      }}
      {...props}
    />
  );
});

Checkbox.displayName = "Checkbox";
