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
  helperText?: string;
  helperTextPos?: "e" | "s" | "n" | "w";
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
  helperText,
  helperTextPos = "w",
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
      {helperText ? (
        <div
          className={twMerge(
            "absolute scale-50 rounded bg-[#202020] px-2 py-1 text-white opacity-0 transition group-hover/button:scale-100 group-hover/button:opacity-100",
            helperTextPos === "e" ? "" : "",
            helperTextPos === "n"
              ? "right-0 top-[-5px] -translate-y-[100%]"
              : "",
            helperTextPos === "w"
              ? "-left-3 top-[50%] -translate-x-[100%] -translate-y-[50%]"
              : "",
          )}
        >
          <p className="whitespace-nowrap text-sm">{helperText}</p>
        </div>
      ) : null}
      <div
        className={`transition-width absolute bottom-0 left-0 w-full transform rounded bg-accent duration-100`}
        style={{ height: active ? "4px" : "0px" }}
      />
      <span>{label || children}</span>
    </button>
  );
}

const buttonVariant = tv({
  base: "group/button hover:shadow-lg transition relative box-border text-accent hover:bg-hover active:bg-active rounded",
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
