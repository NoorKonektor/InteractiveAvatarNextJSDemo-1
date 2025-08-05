import React from "react";

interface InputProps {
  value: string | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Input = (props: InputProps) => {
  return (
    <input
      className={`w-full text-gray-900 text-sm bg-white border border-gray-300 py-3 px-4 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${props.className}`}
      placeholder={props.placeholder}
      type="text"
      value={props.value || ""}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
};
