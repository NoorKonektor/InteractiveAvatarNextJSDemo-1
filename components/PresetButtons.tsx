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
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop&auto=format"
  },
  {
    id: "dentist-location",
    textEn: "Where is the dentist room?",
    textEs: "¿Dónde está el consultorio del dentista?",
    message: "Where is the dentist room situated in the building?",
    mediaType: "map",
    mediaUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.4555!2d-74.0059413!3d40.7127837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316e7fcc1f%3A0x4b3ba7f23b567d2c!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1234567890"
  },
  {
    id: "office-hours",
    textEn: "Office hours & contact",
    textEs: "Horarios y contacto",
    message: "What are your office hours and how can I contact you?",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop&auto=format"
  },
  {
    id: "parking",
    textEn: "Parking information",
    textEs: "Información de estacionamiento",
    message: "Where can I park and what are the parking fees?",
    mediaType: "map",
    mediaUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.4555!2d-74.0059413!3d40.7127837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316e7fcc1f%3A0x4b3ba7f23b567d2c!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1234567890"
  },
  {
    id: "services",
    textEn: "Our services",
    textEs: "Nuestros servicios",
    message: "What services do you offer and what are the costs?",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&auto=format"
  },
  {
    id: "insurance",
    textEn: "Insurance coverage",
    textEs: "Cobertura de seguro",
    message: "Do you accept my insurance plan and what does it cover?",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&auto=format"
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
    <div className="w-full bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-gray-800 text-lg font-semibold mb-4">
        {language === "es" ? "Preguntas frecuentes" : "Quick Questions"}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PRESET_BUTTONS.map((button) => (
          <Button
            key={button.id}
            onClick={() => handleButtonClick(button)}
            className={`text-sm p-4 h-auto whitespace-normal transition-all rounded-lg font-medium ${
              selectedButton === button.id
                ? "bg-blue-600 text-white scale-95 shadow-lg"
                : "bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300"
            }`}
          >
            {language === "es" ? button.textEs : button.textEn}
          </Button>
        ))}
      </div>
    </div>
  );
}
