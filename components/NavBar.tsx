"use client";

import { useState } from "react";

interface NavBarProps {
  onLanguageChange: (language: string) => void;
  currentLanguage: string;
}

export default function NavBar({ onLanguageChange, currentLanguage }: NavBarProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative z-20 w-full">
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
      
      <div className="glass-dark backdrop-blur-xl border-b border-cyan-500/20 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 animate-pulse"></div>
        </div>

        <div className="relative max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo/Title Section */}
            <div 
              className="flex items-center gap-4 group cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Holographic Logo */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-purple-500 to-blue-500 rounded-lg flex items-center justify-center neon-border">
                  <div className="text-white font-orbitron font-bold text-xl">VA</div>
                </div>
                {isHovered && (
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-500 to-blue-500 rounded-lg blur-md opacity-75 animate-pulse"></div>
                )}
              </div>

              {/* Title with Glitch Effect */}
              <div className="flex flex-col">
                <h1 className="font-orbitron font-bold text-2xl lg:text-3xl text-white relative group-hover:neon-text transition-all duration-300">
                  VIRTUAL MEETING
                  <span className="block text-cyan-400 text-lg lg:text-xl font-medium">
                    ASSISTANT
                  </span>
                </h1>
                {/* Subtitle */}
                <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">
                  AI-POWERED • MULTILINGUAL • FUTURE-READY
                </div>
              </div>
            </div>

            {/* Controls Section */}
            <div className="flex items-center gap-6">
              {/* Status Indicator */}
              <div className="hidden md:flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full pulse-glow"></div>
                <span className="text-gray-300 font-mono">SYSTEM ONLINE</span>
              </div>

              {/* Language Selector */}
              <div className="relative group">
                <select
                  value={currentLanguage}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="
                    bg-black/50 text-cyan-400 font-mono font-medium
                    px-6 py-3 pr-10 rounded-lg
                    border border-cyan-500/30 
                    backdrop-blur-md
                    focus:border-cyan-400 focus:neon-glow
                    transition-all duration-300
                    appearance-none cursor-pointer
                    hover:bg-cyan-500/10
                    group-hover:neon-border
                  "
                >
                  <option value="en" className="bg-black text-cyan-400">🇺🇸 ENGLISH</option>
                  <option value="es" className="bg-black text-cyan-400">🇪🇸 ESPAÑOL</option>
                </select>
                
                {/* Custom dropdown arrow */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* AI Status Indicator */}
              <div className="hidden lg:flex items-center gap-3 bg-black/30 px-4 py-2 rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-mono text-gray-300 uppercase tracking-wide">AI READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent line with animation */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse opacity-50"></div>
        </div>
      </div>
    </div>
  );
}
