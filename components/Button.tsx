import React from "react";

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, onClick, ...props }) => {
  // Check if custom styling is provided, use minimal defaults if so
  const hasCustomStyling = className && (
    className.includes('bg-') ||
    className.includes('text-') ||
    className.includes('border-')
  );

  const baseClasses = hasCustomStyling
    ? "px-6 py-3 rounded-lg disabled:opacity-50 h-fit transition-all"
    : "bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-3 rounded-lg disabled:opacity-50 h-fit shadow-sm transition-all";

  return (
    <button
      className={`${baseClasses} ${className || ''}`}
      onClick={props.disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
};
