import React from "react";

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, onClick, ...props }) => {
  // Check if custom styling is provided, use cyberpunk defaults if not
  const hasCustomStyling = className && (
    className.includes('bg-') ||
    className.includes('text-') ||
    className.includes('border-')
  );

  const baseClasses = hasCustomStyling
    ? "px-6 py-3 rounded-lg disabled:opacity-50 h-fit transition-all duration-300"
    : `
      cyber-button font-orbitron font-semibold
      px-8 py-4 rounded-lg text-sm uppercase tracking-wider
      disabled:opacity-30 disabled:cursor-not-allowed
      h-fit transform transition-all duration-300
      relative overflow-hidden
      hover:shadow-2xl hover:shadow-cyan-500/50
      active:scale-95
      border-2
    `;

  return (
    <button
      className={`${baseClasses} ${className || ''}`}
      onClick={props.disabled ? undefined : onClick}
      {...props}
    >
      {/* Background glow effect */}
      {!hasCustomStyling && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      )}
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      
      {/* Scan line effect */}
      {!hasCustomStyling && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
      )}
    </button>
  );
};
