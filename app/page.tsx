"use client";

import { useState } from "react";
import InteractiveAvatar from "@/components/InteractiveAvatar";
import NavBar from "@/components/NavBar";
import Instructions from "@/components/Instructions";

export default function App() {
  const [language, setLanguage] = useState("en");

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavBar onLanguageChange={setLanguage} currentLanguage={language} />
      <div className="max-w-7xl flex flex-col items-start justify-start gap-6 mx-auto pt-6 pb-20 px-4">
        <Instructions language={language} />
        <div className="w-full">
          <InteractiveAvatar language={language} />
        </div>
      </div>
    </div>
  );
}
