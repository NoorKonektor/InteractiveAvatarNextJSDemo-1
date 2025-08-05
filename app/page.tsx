"use client";

import { useState } from "react";
import InteractiveAvatar from "@/components/InteractiveAvatar";
import NavBar from "@/components/NavBar";
import Instructions from "@/components/Instructions";

export default function App() {
  const [language, setLanguage] = useState("en");

  return (
    <div className="w-screen h-screen flex flex-col bg-black">
      <NavBar onLanguageChange={setLanguage} currentLanguage={language} />
      <div className="w-[900px] flex flex-col items-start justify-start gap-5 mx-auto pt-4 pb-20">
        <Instructions language={language} />
        <div className="w-full">
          <InteractiveAvatar language={language} />
        </div>
      </div>
    </div>
  );
}
