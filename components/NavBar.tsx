"use client";

import { useState } from "react";

interface NavBarProps {
  onLanguageChange: (language: string) => void;
  currentLanguage: string;
}

export default function NavBar({ onLanguageChange, currentLanguage }: NavBarProps) {
  return (
    <div className="relative z-20 w-full">
      <div className="bg-white/90 backdrop-blur-md border-b border-white/50 shadow-lg">
        <div className="relative max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo/Title Section */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="text-white font-bold text-xl">VA</div>
              </div>

              <div className="flex flex-col">
                <h1 className="font-bold text-2xl lg:text-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Virtual Assistant
                </h1>
                <div className="text-sm text-gray-600 font-medium">
                  AI-Powered Meeting Support
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={currentLanguage}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="
                    bg-white/80 text-gray-700 font-medium
                    px-6 py-3 pr-10 rounded-xl
                    border border-gray-200 shadow-lg
                    backdrop-blur-md
                    focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20
                    transition-all duration-300
                    appearance-none cursor-pointer
                    hover:shadow-xl hover:bg-white
                  "
                >
                  <option value="en" className="bg-white">🇺🇸 English</option>
                  <option value="es" className="bg-white">🇪🇸 Español</option>
                </select>
                
                {/* Custom dropdown arrow */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
