import React from "react";

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, onClick, ...props }) => {
  // Check if custom styling is provided, use minimal defaults if not
  const hasCustomStyling = className && (
    className.includes('bg-') ||
    className.includes('text-') ||
    className.includes('border-')
  );

  const baseClasses = hasCustomStyling
    ? "px-6 py-3 rounded-lg disabled:opacity-50 h-fit transition-all duration-200"
    : `
      bg-blue-600 hover:bg-blue-700 text-white
      px-6 py-3 rounded-lg text-sm font-medium
      disabled:opacity-50 disabled:cursor-not-allowed
      h-fit transition-all duration-200
      hover:shadow-lg active:scale-95
      border-0
    `;

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
