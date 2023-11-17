import React, { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { tv, type VariantProps } from "tailwind-variants";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariant> {
  width?: number;
  children?: React.ReactNode;
  active?: boolean;
  label?: string;
}

export function Button({
  children,
  width,
  active,
  className,
  variant,
  size,
  fullWidth,
  label,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={twMerge(
        buttonVariant({ variant, size, fullWidth }),
        className,
      )}
      style={{ width: `${width}px` }}
    >
      <div
        className={`transition-width absolute bottom-0 left-0 w-full transform rounded bg-accent duration-100`}
        style={{ height: active ? "4px" : "0px" }}
      />
      <span>{label || children}</span>
    </button>
  );
}

const buttonVariant = tv({
  base: "relative box-border text-accent hover:bg-hover active:bg-active rounded",
  variants: {
    variant: {
      primary: "text-white bg-accent hover:bg-accent/90 active:bg-accent/80",
      secondary: "bg-second-accent",
    },
    size: {
      compact: "px-2 py-1",
      standard: "px-3 py-2",
      large: "px-4 py-4",
    },
    fullWidth: {
      true: "w-full",
    },
  },
  defaultVariants: {
    size: "standard",
  },
});
