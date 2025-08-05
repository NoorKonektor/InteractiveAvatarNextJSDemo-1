"use client";

import { Button } from "./Button";
import { useState } from "react";

interface PresetButtonsProps {
  onSendMessage: (message: string, mediaType?: string, mediaUrl?: string) => void;
  language: string;
}

interface PresetButton {
  id: string;
  textEn: string;
  textEs: string;
  message: string;
  mediaType?: "video" | "image" | "map";
  mediaUrl?: string;
}

const PRESET_BUTTONS: PresetButton[] = [
  {
    id: "appointment",
    textEn: "How to book an appointment",
    textEs: "Cómo reservar una cita",
    message: "How can I book an appointment?",
    mediaType: "video",
    mediaUrl: "/videos/booking-tutorial.mp4"
  },
  {
    id: "dentist-location",
    textEn: "Where is the dentist room?",
    textEs: "¿Dónde está el consultorio del dentista?",
    message: "Where is the dentist room situated in the building?",
    mediaType: "map",
    mediaUrl: "https://maps.google.com/embed?pb=!1m18!1m12!1m3!1d3024.123456789!2d-74.0059!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjEiTiA3NMKwMDAnMjEuMyJX!5e0!3m2!1sen!2sus!4v1234567890123"
  },
  {
    id: "office-hours",
    textEn: "Office hours & contact",
    textEs: "Horarios y contacto",
    message: "What are your office hours and how can I contact you?",
    mediaType: "image",
    mediaUrl: "/images/office-hours.jpg"
  },
  {
    id: "parking",
    textEn: "Parking information",
    textEs: "Información de estacionamiento",
    message: "Where can I park and what are the parking fees?",
    mediaType: "map",
    mediaUrl: "https://maps.google.com/embed?pb=!1m18!1m12!1m3!1d3024.123456789!2d-74.0059!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjEiTiA3NMKwMDAnMjEuMyJX!5e0!3m2!1sen!2sus!4v1234567890123"
  },
  {
    id: "services",
    textEn: "Our services",
    textEs: "Nuestros servicios",
    message: "What services do you offer and what are the costs?",
    mediaType: "video",
    mediaUrl: "/videos/services-overview.mp4"
  },
  {
    id: "insurance",
    textEn: "Insurance coverage",
    textEs: "Cobertura de seguro",
    message: "Do you accept my insurance plan and what does it cover?",
    mediaType: "image",
    mediaUrl: "/images/insurance-info.jpg"
  }
];

export default function PresetButtons({ onSendMessage, language }: PresetButtonsProps) {
  const [selectedButton, setSelectedButton] = useState<string | null>(null);

  const handleButtonClick = (button: PresetButton) => {
    setSelectedButton(button.id);
    onSendMessage(button.message, button.mediaType, button.mediaUrl);
    
    // Reset selection after 2 seconds
    setTimeout(() => {
      setSelectedButton(null);
    }, 2000);
  };

  return (
    <div className="w-full bg-zinc-800 rounded-lg p-4">
      <h3 className="text-white text-lg font-semibold mb-4">
        {language === "es" ? "Preguntas frecuentes" : "Quick Questions"}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PRESET_BUTTONS.map((button) => (
          <Button
            key={button.id}
            onClick={() => handleButtonClick(button)}
            className={`text-sm p-3 h-auto whitespace-normal transition-all ${
              selectedButton === button.id 
                ? "bg-blue-600 scale-95" 
                : "bg-zinc-700 hover:bg-zinc-600"
            }`}
          >
            {language === "es" ? button.textEs : button.textEn}
          </Button>
        ))}
      </div>
    </div>
  );
}
