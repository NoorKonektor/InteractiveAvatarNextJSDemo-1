"use client";

import { useState } from "react";

interface NavBarProps {
  onLanguageChange: (language: string) => void;
  currentLanguage: string;
}

export default function NavBar({ onLanguageChange, currentLanguage }: NavBarProps) {
  return (
    <>
      <div className="flex flex-row justify-between items-center max-w-7xl m-auto p-6 bg-white/80 backdrop-blur-sm rounded-b-xl shadow-sm border-b border-gray-200">
        <div className="flex flex-row items-center gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 bg-clip-text">
            <p className="text-2xl font-bold text-transparent">
              Virtual Meeting Assistant
            </p>
          </div>
        </div>
        <div className="flex flex-row items-center gap-6">
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-white text-gray-900 px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>
    </>
  );
}
