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
    textEn: "Book Appointment",
    textEs: "Reservar Cita",
    message: "How can I book an appointment?"
  },
  {
    id: "dentist-location",
    textEn: "Office Location",
    textEs: "Ubicación del Consultorio",
    message: "Where is the dentist room situated in the building?",
    mediaType: "map",
    mediaUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.4555!2d-74.0059413!3d40.7127837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316e7fcc1f%3A0x4b3ba7f23b567d2c!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1234567890"
  },
  {
    id: "office-hours",
    textEn: "Office Hours",
    textEs: "Horarios",
    message: "What are your office hours and how can I contact you?",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop&auto=format"
  },
  {
    id: "parking",
    textEn: "Parking Info",
    textEs: "Estacionamiento",
    message: "Where can I park and what are the parking fees?",
    mediaType: "map",
    mediaUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.4555!2d-74.0059413!3d40.7127837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316e7fcc1f%3A0x4b3ba7f23b567d2c!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1234567890"
  },
  {
    id: "services",
    textEn: "Our Services",
    textEs: "Nuestros Servicios",
    message: "What services do you offer and what are the costs?",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&auto=format"
  },
  {
    id: "insurance",
    textEn: "Insurance",
    textEs: "Seguro",
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
    <div className="w-full space-y-4">
      <h3 className="text-white font-medium text-lg">
        {language === "es" ? "Preguntas Frecuentes" : "Quick Questions"}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRESET_BUTTONS.map((button) => {
          const isSelected = selectedButton === button.id;
          
          return (
            <Button
              key={button.id}
              onClick={() => handleButtonClick(button)}
              className={`
                p-4 h-auto text-left rounded-lg font-medium transition-all duration-200
                ${isSelected 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white scale-95 border-0' 
                  : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 border border-gray-600/30'
                }
              `}
            >
              {language === "es" ? button.textEs : button.textEn}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
