"use client";

import { useState } from "react";
import InteractiveAvatar from "@/components/InteractiveAvatar";
import NavBar from "@/components/NavBar";

export default function App() {
  const [language, setLanguage] = useState("es");

  return (
    <div className="min-h-screen w-full cyber-grid relative overflow-hidden">
      {/* Matrix Rain Background */}
      <div className="matrix-bg">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="matrix-char"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            {String.fromCharCode(0x30A0 + Math.random() * 96)}
          </div>
        ))}
      </div>

      {/* Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-500 rounded-full opacity-10 blur-xl float"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500 rounded-full opacity-15 blur-xl float" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-blue-500 rounded-full opacity-10 blur-xl float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-pink-500 rounded-full opacity-15 blur-xl float" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <NavBar onLanguageChange={setLanguage} currentLanguage={language} />
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[1600px] mx-auto">
            <InteractiveAvatar language={language} />
          </div>
        </div>

        {/* Bottom Glow Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Scan Lines Overlay */}
      <div className="fixed inset-0 pointer-events-none scan-lines opacity-30 z-5"></div>
    </div>
  );
}
