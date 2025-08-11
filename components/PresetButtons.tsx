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
  mediaType?: "video" | "image" | "map" | "directions";
  mediaUrl?: string;
  icon: string;
}

const PRESET_BUTTONS: PresetButton[] = [
  {
    id: "appointment",
    textEn: "Book Appointment",
    textEs: "Reservar Cita",
    message: "How can I book an appointment?",
    icon: "📅"
  },
  {
    id: "dentist-location",
    textEn: "Office Location",
    textEs: "Ubicación del Consultorio",
    message: "Where is the dentist room situated in the building?",
    mediaType: "map",
    mediaUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.4555!2d-74.0059413!3d40.7127837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316e7fcc1f%3A0x4b3ba7f23b567d2c!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1234567890",
    icon: "🗺️"
  },
  {
    id: "directions",
    textEn: "How to Get There",
    textEs: "Cómo Llegar",
    message: "How do I get to the dental clinic? Can you show me directions?",
    mediaType: "directions",
    icon: "🧭"
  },
  {
    id: "office-hours",
    textEn: "Office Hours",
    textEs: "Horarios",
    message: "What are your office hours and how can I contact you?",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop&auto=format",
    icon: "⏰"
  },
  {
    id: "parking",
    textEn: "Parking Info",
    textEs: "Estacionamiento",
    message: "Where can I park and what are the parking fees?",
    mediaType: "map",
    mediaUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.4555!2d-74.0059413!3d40.7127837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316e7fcc1f%3A0x4b3ba7f23b567d2c!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1234567890",
    icon: "🚗"
  },
  {
    id: "services",
    textEn: "Our Services",
    textEs: "Nuestros Servicios",
    message: "What services do you offer and what are the costs?",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&auto=format",
    icon: "⚕️"
  },
  {
    id: "insurance",
    textEn: "Insurance",
    textEs: "Seguro",
    message: "Do you accept my insurance plan and what does it cover?",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&auto=format",
    icon: "🛡️"
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
    <div className="w-full space-y-6">
      <h3 className="text-gray-800 font-bold text-xl flex items-center gap-2">
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        {language === "es" ? "Preguntas Frecuentes" : "Quick Questions"}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRESET_BUTTONS.map((button) => {
          const isSelected = selectedButton === button.id;
          
          return (
            <div key={button.id} className="group">
              <Button
                onClick={() => handleButtonClick(button)}
                className={`
                  w-full p-6 h-auto text-left rounded-xl font-medium transition-all duration-300 
                  transform group-hover:scale-105 shadow-lg hover:shadow-xl
                  ${isSelected 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-95 border-0' 
                    : 'bg-gradient-to-br from-white/80 to-gray-50/80 hover:from-blue-50 hover:to-purple-50 text-gray-700 border border-white/60 backdrop-blur-md'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    text-2xl p-3 rounded-lg transition-all duration-300
                    ${isSelected 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200'
                    }
                  `}>
                    {button.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-1">
                      {language === "es" ? button.textEs : button.textEn}
                    </h4>
                    <div className={`
                      text-xs font-medium uppercase tracking-wide
                      ${isSelected ? 'text-white/80' : 'text-gray-500'}
                    `}>
                      {language === "es" ? "Tocar para preguntar" : "Tap to ask"}
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
