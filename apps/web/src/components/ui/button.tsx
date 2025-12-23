import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `
  inline-flex items-center justify-center gap-2
  whitespace-nowrap
  rounded-xl
  text-sm font-semibold
  transition-all duration-200
  focus-visible:outline-none
  focus-visible:ring-2 focus-visible:ring-emerald-300
  disabled:pointer-events-none disabled:opacity-50
  active:scale-[0.98]

  [&_svg]:pointer-events-none
  [&_svg]:h-4 [&_svg]:w-4
  `,
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white shadow-md hover:bg-emerald-700 hover:shadow-lg",
        destructive: "bg-red-600 text-white shadow-md hover:bg-red-700",
        outline:
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
        secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        ghost: "text-gray-700 hover:bg-gray-100",
        link: "text-emerald-600 underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:from-emerald-600 hover:to-teal-700",
      },
      size: {
        default: "h-12 px-6",
        sm: "h-10 px-4 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
