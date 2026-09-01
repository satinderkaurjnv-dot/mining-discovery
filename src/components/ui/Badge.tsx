import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "navy" | "gold" | "subtle" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "subtle",
  size = "sm",
  className = "",
}) => {
  const baseStyles = "inline-flex items-center font-semibold tracking-wider uppercase rounded-full";

  const variants = {
    navy: "bg-[#0B1F3A] text-white",
    gold: "bg-[#FAF5E8] text-[#B8860B] border border-[#B8860B]/30",
    subtle: "bg-[#F4F4F2] text-[#57595E] border border-[#E5E5E3]",
    outline: "bg-transparent text-[#0B1F3A] border border-[#E5E5E3]",
  };

  const sizes = {
    sm: "text-[10px] px-2.5 py-0.5",
    md: "text-xs px-3 py-1",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
