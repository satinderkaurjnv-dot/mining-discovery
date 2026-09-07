import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "navy" | "gold" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "navy",
  size = "md",
  children,
  fullWidth = false,
  className = "",
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    navy: "bg-[#081121] text-white hover:bg-[#162E50] active:bg-[#061224] focus:ring-[#081121] shadow-sm",
    gold: "bg-[#B8860B] text-white hover:bg-[#9E7208] active:bg-[#845E06] focus:ring-[#B8860B] shadow-sm",
    outline: "border border-[#081121] text-[#081121] hover:bg-[#081121]/5 active:bg-[#081121]/10 focus:ring-[#081121]",
    ghost: "text-[#1A1D21] hover:bg-[#F4F4F2] hover:text-[#081121] focus:ring-[#081121]",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 rounded-sm gap-1.5",
    md: "text-sm px-4 py-2.5 rounded-sm gap-2",
    lg: "text-base px-6 py-3 rounded-md gap-2.5",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
