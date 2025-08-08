"use client";

import { useState } from "react";

interface NavBarProps {
  onLanguageChange: (language: string) => void;
  currentLanguage: string;
}

export default function NavBar({ onLanguageChange, currentLanguage }: NavBarProps) {
  return (
    <>
      <div className="flex flex-row justify-between items-center max-w-[1600px] m-auto p-8 bg-white/80 backdrop-blur-sm rounded-b-xl shadow-sm border-b border-gray-200">
        <div className="flex flex-row items-center gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text">
            <p className="text-3xl font-bold text-transparent">
              Virtual Meeting Assistant
            </p>
          </div>
        </div>
        <div className="flex flex-row items-center gap-8">
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-white text-gray-900 px-6 py-3 text-lg rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>
    </>
  );
}
