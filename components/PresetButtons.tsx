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
  color: string;
}

const PRESET_BUTTONS: PresetButton[] = [
  {
    id: "appointment",
    textEn: "Book Appointment",
    textEs: "Reservar Cita",
    message: "How can I book an appointment?",
    icon: "📅",
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "dentist-location",
    textEn: "Office Location",
    textEs: "Ubicación del Consultorio",
    message: "Where is the dentist room situated in the building?",
    mediaType: "map",
    mediaUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.4555!2d-74.0059413!3d40.7127837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316e7fcc1f%3A0x4b3ba7f23b567d2c!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1234567890",
    icon: "🗺️",
    color: "from-emerald-500 to-emerald-600"
  },
  {
    id: "directions",
    textEn: "How to Get There",
    textEs: "Cómo Llegar",
    message: "How do I get to the dental clinic? Can you show me directions?",
    mediaType: "directions",
    icon: "🧭",
    color: "from-purple-500 to-purple-600"
  },
  {
    id: "office-hours",
    textEn: "Office Hours",
    textEs: "Horarios",
    message: "What are your office hours and how can I contact you?",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop&auto=format",
    icon: "⏰",
    color: "from-orange-500 to-orange-600"
  },
  {
    id: "parking",
    textEn: "Parking Info",
    textEs: "Estacionamiento",
    message: "Where can I park and what are the parking fees?",
    mediaType: "map",
    mediaUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.4555!2d-74.0059413!3d40.7127837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316e7fcc1f%3A0x4b3ba7f23b567d2c!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1234567890",
    icon: "🚗",
    color: "from-teal-500 to-teal-600"
  },
  {
    id: "services",
    textEn: "Our Services",
    textEs: "Nuestros Servicios",
    message: "What services do you offer and what are the costs?",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&auto=format",
    icon: "⚕️",
    color: "from-pink-500 to-pink-600"
  },
  {
    id: "insurance",
    textEn: "Insurance",
    textEs: "Seguro",
    message: "Do you accept my insurance plan and what does it cover?",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&auto=format",
    icon: "🛡️",
    color: "from-indigo-500 to-indigo-600"
  }
];

export default function PresetButtons({ onSendMessage, language }: PresetButtonsProps) {
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const handleButtonClick = (button: PresetButton, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedButton(button.id);
    onSendMessage(button.message, button.mediaType, button.mediaUrl);

    // Reset selection after 2 seconds
    setTimeout(() => {
      setSelectedButton(null);
    }, 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Enhanced Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-white/80 to-blue-50/80 px-6 py-3 rounded-2xl border border-white/50 shadow-lg backdrop-blur-md mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg animate-float">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {language === "es" ? "Preguntas Frecuentes" : "Quick Questions"}
          </h3>
        </div>
        
        <p className="text-gray-600 font-medium">
          {language === "es" 
            ? "Selecciona una pregunta para obtener información instantánea" 
            : "Select a question to get instant information"
          }
        </p>
      </div>
      
      {/* Enhanced Button Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 px-2 md:px-0">
        {PRESET_BUTTONS.map((button, index) => {
          const isSelected = selectedButton === button.id;
          const isHovered = hoveredButton === button.id;
          
          return (
            <div
              key={button.id}
              className="group relative isolate"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow Effect */}
              <div className={`
                absolute -inset-1 bg-gradient-to-r ${button.color} rounded-2xl opacity-0 
                group-hover:opacity-20 transition-opacity duration-500 blur-lg
                ${isSelected ? 'opacity-40 animate-pulse' : ''}
              `}></div>
              
              {/* Main Button */}
              <button
                onClick={(e) => handleButtonClick(button, e)}
                onMouseEnter={() => setHoveredButton(button.id)}
                onMouseLeave={() => setHoveredButton(null)}
                className={`
                  relative w-full p-6 rounded-2xl font-medium text-left
                  transition-all duration-500 transform group-hover:scale-105
                  shadow-lg hover:shadow-2xl backdrop-blur-md cursor-pointer
                  ${isSelected
                    ? `bg-gradient-to-br ${button.color} text-white scale-95 shadow-2xl animate-pulse`
                    : 'bg-gradient-to-br from-white/90 to-gray-50/90 hover:from-white hover:to-blue-50/50 text-gray-700 border border-white/60'
                  }
                  animate-slideInUp
                  z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                `}
                style={{ pointerEvents: 'all' }}
              >
                {/* Background Pattern */}
                <div className={`
                  absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
                  ${isSelected ? 'opacity-30' : ''}
                  bg-gradient-to-br from-white/10 via-transparent to-white/5
                `}></div>
                
                {/* Content */}
                <div className="relative flex items-center gap-4">
                  {/* Animated Icon */}
                  <div className={`
                    text-3xl p-4 rounded-xl transition-all duration-500 shadow-lg
                    ${isSelected 
                      ? 'bg-white/20 transform rotate-12 scale-110' 
                      : `bg-gradient-to-br ${button.color.replace('500', '100').replace('600', '200')} group-hover:scale-110 group-hover:rotate-6`
                    }
                    ${isHovered ? 'animate-bounce' : ''}
                  `}>
                    <span className="block transform transition-transform duration-300">
                      {button.icon}
                    </span>
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1 space-y-2">
                    <h4 className={`
                      font-bold text-lg leading-tight transition-colors duration-300
                      ${isSelected ? 'text-white' : 'text-gray-800 group-hover:text-gray-900'}
                    `}>
                      {language === "es" ? button.textEs : button.textEn}
                    </h4>
                    
                    {/* Category Badge */}
                    <div className={`
                      inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                      transition-all duration-300
                      ${isSelected 
                        ? 'bg-white/20 text-white/90' 
                        : `bg-gradient-to-r ${button.color} text-white shadow-md`
                      }
                    `}>
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></div>
                      {language === "es" ? "Consulta rápida" : "Quick query"}
                    </div>
                  </div>
                </div>
                
                {/* Shimmer Effect */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                  transform -skew-x-12 opacity-0 group-hover:opacity-100 
                  transition-all duration-700 translate-x-[-100%] group-hover:translate-x-[100%]
                  ${isSelected ? 'animate-shimmer' : ''}
                `}></div>
                
                {/* Success Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 animate-bounceIn">
                    <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Enhanced Status Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 rounded-2xl border border-green-200/50 shadow-lg backdrop-blur-md">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <span className="text-green-700 font-medium text-sm">
            {language === "es" 
              ? "Todos los servicios están disponibles" 
              : "All services are available"
            }
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes bounceIn {
          from { opacity: 0; transform: scale(0.3); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
