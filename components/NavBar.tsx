"use client";

import { useState } from "react";

interface NavBarProps {
  onLanguageChange: (language: string) => void;
  currentLanguage: string;
}

export default function NavBar({ onLanguageChange, currentLanguage }: NavBarProps) {
  return (
    <>
      <div className="flex flex-row justify-between items-center w-[1000px] m-auto p-6">
        <div className="flex flex-row items-center gap-4">
          <div className="bg-gradient-to-br from-blue-400 to-purple-600 bg-clip-text">
            <p className="text-xl font-semibold text-transparent">
              Virtual Meeting Assistant
            </p>
          </div>
        </div>
        <div className="flex flex-row items-center gap-6">
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-zinc-800 text-white px-3 py-1 rounded border border-zinc-600"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>
    </>
  );
}
