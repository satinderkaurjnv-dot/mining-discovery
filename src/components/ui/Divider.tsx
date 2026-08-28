import React from "react";

export interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ label, className = "" }) => {
  if (label) {
    return (
      <div className={`relative flex items-center py-6 ${className}`}>
        <div className="flex-grow border-t border-[#E5E5E3]"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold uppercase tracking-widest text-[#57595E] bg-[#FAFAF9] px-2">
          {label}
        </span>
        <div className="flex-grow border-t border-[#E5E5E3]"></div>
      </div>
    );
  }

  return (
    <div className={`w-full border-t border-[#E5E5E3] my-6 ${className}`} />
  );
};
