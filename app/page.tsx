"use client";

import { useState } from "react";
import InteractiveAvatar from "@/components/InteractiveAvatar";
import NavBar from "@/components/NavBar";

export default function App() {
  const [language, setLanguage] = useState("es");

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <NavBar onLanguageChange={setLanguage} currentLanguage={language} />
      <div className="max-w-[1600px] flex flex-col items-start justify-start gap-8 mx-auto pt-8 pb-24 px-6">
        <div className="w-full">
          <InteractiveAvatar language={language} />
        </div>
      </div>
    </div>
  );
}
