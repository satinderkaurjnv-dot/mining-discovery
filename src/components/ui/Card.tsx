import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> & {
  Header: React.FC<{ children: React.ReactNode; className?: string }>;
  Content: React.FC<{ children: React.ReactNode; className?: string }>;
  Footer: React.FC<{ children: React.ReactNode; className?: string }>;
} = ({ children, className = "", hoverEffect = false, bordered = true }) => {
  const borderStyle = bordered ? "border border-[#E5E5E3]" : "";
  const hoverStyle = hoverEffect
    ? "transition-all duration-300 hover:shadow-md hover:border-[#0B1F3A]/30 hover:-translate-y-0.5"
    : "";

  return (
    <div
      className={`bg-white rounded-md p-6 ${borderStyle} ${hoverStyle} ${className}`}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => <div className={`mb-4 ${className}`}>{children}</div>;

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => <div className={`${className}`}>{children}</div>;

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`mt-6 pt-4 border-t border-[#E5E5E3] ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;
