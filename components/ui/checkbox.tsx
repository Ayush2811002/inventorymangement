"use client";
import * as React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={`h-5 w-5 accent-blue-500 cursor-pointer ${className}`}
        {...props}
      />
    );
  }
);
Checkbox.displayName = "Checkbox";
