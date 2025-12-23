import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          `
          flex w-full
          h-12
          rounded-xl
          border border-gray-200
          bg-gray-50
          px-4
          text-sm text-gray-900
          placeholder:text-gray-400
          
          transition-all duration-200
          
          focus:bg-white
          focus:border-emerald-500
          focus:ring-2 focus:ring-emerald-200
          focus:outline-none
          
          disabled:cursor-not-allowed
          disabled:opacity-50
          `,
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
