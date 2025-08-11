"use client";

import { useState } from "react";

interface NavBarProps {
  onLanguageChange: (language: string) => void;
  currentLanguage: string;
}

export default function NavBar({ onLanguageChange, currentLanguage }: NavBarProps) {
  return (
    <div className="relative z-20 w-full">
      <div className="bg-black/20 backdrop-blur-md border-b border-gray-600/30">
        <div className="relative max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo/Title Section */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="text-white font-bold text-lg">VA</div>
              </div>

              <div className="flex flex-col">
                <h1 className="font-semibold text-xl lg:text-2xl text-white">
                  Virtual Assistant
                </h1>
                <div className="text-xs text-gray-400">
                  AI-Powered Meeting Support
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-4">
              <select
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="
                  bg-gray-800/50 text-gray-200
                  px-4 py-2 pr-8 rounded-lg
                  border border-gray-600/50 
                  backdrop-blur-md
                  focus:border-blue-400 focus:outline-none
                  transition-all duration-300
                  appearance-none cursor-pointer
                "
              >
                <option value="en" className="bg-gray-800">🇺🇸 English</option>
                <option value="es" className="bg-gray-800">🇪🇸 Español</option>
              </select>
              
              {/* Custom dropdown arrow */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
