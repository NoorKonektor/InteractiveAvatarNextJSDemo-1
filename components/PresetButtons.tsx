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
  icon: string;
  category: "query" | "location" | "service";
}

const PRESET_BUTTONS: PresetButton[] = [
  {
    id: "appointment",
    textEn: "Schedule Neural Session",
    textEs: "Programar Sesión Neural",
    message: "How can I book an appointment?",
    icon: "📅",
    category: "query"
  },
  {
    id: "dentist-location",
    textEn: "Facility Navigation",
    textEs: "Navegación de Instalaciones",
    message: "Where is the dentist room situated in the building?",
    mediaType: "map",
    mediaUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.4555!2d-74.0059413!3d40.7127837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316e7fcc1f%3A0x4b3ba7f23b567d2c!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1234567890",
    icon: "🗺️",
    category: "location"
  },
  {
    id: "office-hours",
    textEn: "Access Protocols",
    textEs: "Protocolos de Acceso",
    message: "What are your office hours and how can I contact you?",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop&auto=format",
    icon: "⏰",
    category: "query"
  },
  {
    id: "parking",
    textEn: "Vehicle Docking",
    textEs: "Estacionamiento de Vehículos",
    message: "Where can I park and what are the parking fees?",
    mediaType: "map",
    mediaUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.4555!2d-74.0059413!3d40.7127837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316e7fcc1f%3A0x4b3ba7f23b567d2c!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1234567890",
    icon: "🚗",
    category: "location"
  },
  {
    id: "services",
    textEn: "Service Matrix",
    textEs: "Matriz de Servicios",
    message: "What services do you offer and what are the costs?",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&auto=format",
    icon: "⚕️",
    category: "service"
  },
  {
    id: "insurance",
    textEn: "Coverage Protocol",
    textEs: "Protocolo de Cobertura",
    message: "Do you accept my insurance plan and what does it cover?",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&auto=format",
    icon: "🛡️",
    category: "service"
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "query":
      return {
        border: "border-cyan-500/30",
        bg: "from-cyan-500/10 to-blue-500/10",
        text: "text-cyan-400",
        glow: "hover:shadow-cyan-500/20"
      };
    case "location":
      return {
        border: "border-purple-500/30",
        bg: "from-purple-500/10 to-pink-500/10",
        text: "text-purple-400",
        glow: "hover:shadow-purple-500/20"
      };
    case "service":
      return {
        border: "border-green-500/30",
        bg: "from-green-500/10 to-emerald-500/10",
        text: "text-green-400",
        glow: "hover:shadow-green-500/20"
      };
    default:
      return {
        border: "border-cyan-500/30",
        bg: "from-cyan-500/10 to-blue-500/10",
        text: "text-cyan-400",
        glow: "hover:shadow-cyan-500/20"
      };
  }
};

export default function PresetButtons({ onSendMessage, language }: PresetButtonsProps) {
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

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
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-cyan-400 rounded-full pulse-glow"></div>
        <h3 className="text-white font-orbitron font-semibold text-lg uppercase tracking-wide">
          {language === "es" ? "Protocolos de Consulta Rápida" : "Rapid Query Protocols"}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRESET_BUTTONS.map((button) => {
          const colors = getCategoryColor(button.category);
          const isSelected = selectedButton === button.id;
          const isHovered = hoveredButton === button.id;
          
          return (
            <div
              key={button.id}
              className="relative group"
              onMouseEnter={() => setHoveredButton(button.id)}
              onMouseLeave={() => setHoveredButton(null)}
            >
              {/* Glow effect background */}
              <div className={`
                absolute -inset-1 bg-gradient-to-r ${colors.bg} rounded-lg opacity-0 
                group-hover:opacity-100 transition-opacity duration-300 blur-sm
              `}></div>
              
              {/* Main button */}
              <button
                onClick={() => handleButtonClick(button)}
                className={`
                  relative w-full p-6 rounded-lg font-medium text-left
                  transition-all duration-300 transform
                  glass-dark ${colors.border}
                  ${isSelected ? 'scale-95 neon-glow' : 'hover:scale-105'}
                  ${isHovered ? colors.glow + ' shadow-2xl' : ''}
                  ${isSelected ? 'animate-pulse' : ''}
                  group
                `}
              >
                {/* Content container */}
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`
                    text-2xl p-3 rounded-lg bg-gradient-to-br ${colors.bg}
                    ${colors.border} border transform transition-transform duration-300
                    ${isHovered ? 'scale-110 rotate-12' : ''}
                  `}>
                    {button.icon}
                  </div>
                  
                  {/* Text content */}
                  <div className="flex-1 space-y-2">
                    <h4 className={`
                      font-orbitron font-semibold text-sm uppercase tracking-wide
                      ${isSelected ? 'neon-text animate-pulse' : colors.text}
                      transition-colors duration-300
                    `}>
                      {language === "es" ? button.textEs : button.textEn}
                    </h4>
                    
                    {/* Category badge */}
                    <div className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-full
                      text-xs font-mono uppercase tracking-wide
                      ${colors.border} border ${colors.bg} bg-gradient-to-r
                      ${colors.text} opacity-60
                    `}>
                      <div className="w-1 h-1 bg-current rounded-full"></div>
                      {button.category}
                    </div>
                  </div>
                </div>
                
                {/* Scan line effect */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                  transform -skew-x-12 opacity-0 group-hover:opacity-100
                  transition-opacity duration-300 pointer-events-none
                `}></div>
                
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full pulse-glow"></div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Status indicator */}
      <div className="flex items-center justify-center gap-3 text-sm text-gray-400 font-mono">
        <div className="w-2 h-2 bg-green-400 rounded-full pulse-glow"></div>
        <span className="uppercase tracking-wide">
          {language === "es" 
            ? "Todos los protocolos están en línea" 
            : "All protocols online"
          }
        </span>
      </div>
    </div>
  );
}
