import React from "react";

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, onClick, ...props }) => {
  return (
    <button
      className={`bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-3 rounded-lg disabled:opacity-50 h-fit shadow-sm transition-all ${className}`}
      onClick={props.disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
};
