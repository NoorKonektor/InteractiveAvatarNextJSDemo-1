"use client";

import { useState } from "react";
import InteractiveAvatar from "@/components/InteractiveAvatar";
import NavBar from "@/components/NavBar";

export default function App() {
  const [language, setLanguage] = useState("es");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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
