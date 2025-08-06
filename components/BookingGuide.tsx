"use client";

import { useState, useEffect } from "react";

interface BookingGuideProps {
  language: string;
  isVisible: boolean;
  onClose: () => void;
}

interface Step {
  icon: string;
  titleEn: string;
  titleEs: string;
  descriptionEn: string;
  descriptionEs: string;
  action?: string;
}

const BOOKING_STEPS: Step[] = [
  {
    icon: "📅",
    titleEn: "Choose Your Date",
    titleEs: "Elige tu Fecha",
    descriptionEn: "Select your preferred appointment date from our available calendar slots",
    descriptionEs: "Selecciona tu fecha preferida de nuestras citas disponibles en el calendario",
    action: "calendar"
  },
  {
    icon: "🕐",
    titleEn: "Select Time Slot",
    titleEs: "Selecciona la Hora",
    descriptionEn: "Pick a convenient time that fits your schedule",
    descriptionEs: "Elige una hora conveniente que se ajuste a tu horario",
    action: "time"
  },
  {
    icon: "👤",
    titleEn: "Provide Your Information",
    titleEs: "Proporciona tu Información",
    descriptionEn: "Enter your name, contact details, and reason for visit",
    descriptionEs: "Ingresa tu nombre, detalles de contacto y motivo de la visita",
    action: "form"
  },
  {
    icon: "✅",
    titleEn: "Confirm Your Appointment",
    titleEs: "Confirma tu Cita",
    descriptionEn: "Review your details and confirm your booking",
    descriptionEs: "Revisa tus detalles y confirma tu reserva",
    action: "confirm"
  }
];

export default function BookingGuide({ language, isVisible, onClose }: BookingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => {
          if (prev >= BOOKING_STEPS.length - 1) {
            return 0; // Loop back to start
          }
          return prev + 1;
        });
        setIsAnimating(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const content = {
    en: {
      title: "How to Book an Appointment",
      subtitle: "Follow these simple steps",
      bookNowButton: "Book Now",
      closeButton: "Close Guide"
    },
    es: {
      title: "Cómo Reservar una Cita",
      subtitle: "Sigue estos pasos simples",
      bookNowButton: "Reservar Ahora",
      closeButton: "Cerrar Guía"
    }
  };

  const text = content[language as keyof typeof content] || content.en;

  const getActionIcon = (action?: string) => {
    switch (action) {
      case "calendar":
        return "📅";
      case "time":
        return "⏰";
      case "form":
        return "📝";
      case "confirm":
        return "✅";
      default:
        return "📋";
    }
  };

  return (
    <div className="w-full">
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.8s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{text.title}</h3>
            <p className="text-blue-600 text-sm font-medium">{text.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            {BOOKING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  index <= currentStep
                    ? "bg-blue-600 text-white scale-110"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${((currentStep + 1) / BOOKING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current step display */}
        <div className={`transition-all duration-500 ease-in-out ${isAnimating ? "opacity-0 transform scale-95 translate-y-2" : "opacity-100 transform scale-100 translate-y-0"}`}>
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="text-4xl animate-bounce">
                  {BOOKING_STEPS[currentStep].icon}
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-800 mb-2 animate-fade-in">
                  {language === "es"
                    ? BOOKING_STEPS[currentStep].titleEs
                    : BOOKING_STEPS[currentStep].titleEn
                  }
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed animate-slide-in">
                  {language === "es"
                    ? BOOKING_STEPS[currentStep].descriptionEs
                    : BOOKING_STEPS[currentStep].descriptionEn
                  }
                </p>

                {/* Action visualization with enhanced animation */}
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 transform hover:scale-105 transition-transform duration-200">
                  <div className="flex items-center gap-2 text-blue-700">
                    <span className="text-lg animate-pulse">{getActionIcon(BOOKING_STEPS[currentStep].action)}</span>
                    <span className="text-sm font-medium">
                      {language === "es" ? "Acción requerida" : "Action required"}
                    </span>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm flex-1">
            {text.bookNowButton}
          </button>
          <button 
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {text.closeButton}
          </button>
        </div>

        {/* Step indicators */}
        <div className="mt-4 flex justify-center gap-2">
          {BOOKING_STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep ? "bg-blue-600 w-6" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
