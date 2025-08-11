"use client";

import { useState } from "react";
import InteractiveAvatar from "@/components/InteractiveAvatar";
import NavBar from "@/components/NavBar";

export default function App() {
  const [language, setLanguage] = useState("es");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Matrix Rain Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-green-400 font-mono text-sm"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              animation: 'matrix-rain 3s linear infinite'
            }}
          >
            {String.fromCharCode(0x30A0 + Math.random() * 96)}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar onLanguageChange={setLanguage} currentLanguage={language} />
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[1600px] mx-auto">
            <InteractiveAvatar language={language} />
          </div>
        </div>
      </div>
    </div>
  );
}
