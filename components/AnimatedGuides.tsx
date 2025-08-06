"use client";

import { useState, useEffect } from "react";

interface AnimatedGuidesProps {
  guideType: "location" | "office-hours" | "parking" | "services" | "insurance" | null;
  language: string;
  isVisible: boolean;
  onClose: () => void;
}

interface GuideStep {
  icon: string;
  titleEn: string;
  titleEs: string;
  descriptionEn: string;
  descriptionEs: string;
  action?: string;
}

const GUIDE_CONFIGS = {
  location: {
    titleEn: "Finding the Dentist Room",
    titleEs: "Encontrar el Consultorio del Dentista",
    steps: [
      {
        icon: "🏢",
        titleEn: "Enter Main Building",
        titleEs: "Ingresar al Edificio Principal",
        descriptionEn: "Walk through the main entrance and head to the reception desk",
        descriptionEs: "Camina por la entrada principal y dirígete a la recepción",
        action: "entrance"
      },
      {
        icon: "🛗",
        titleEn: "Take the Elevator",
        titleEs: "Tomar el Ascensor",
        descriptionEn: "Go to the 3rd floor using the elevator on your right",
        descriptionEs: "Ve al 3er piso usando el ascensor a tu derecha",
        action: "elevator"
      },
      {
        icon: "➡️",
        titleEn: "Turn Right",
        titleEs: "Girar a la Derecha",
        descriptionEn: "Exit elevator and turn right down the hallway",
        descriptionEs: "Sal del ascensor y gira a la derecha por el pasillo",
        action: "direction"
      },
      {
        icon: "🦷",
        titleEn: "Room 302",
        titleEs: "Sala 302",
        descriptionEn: "The dentist office is room 302, third door on your left",
        descriptionEs: "El consultorio dental es la sala 302, tercera puerta a tu izquierda",
        action: "arrive"
      }
    ]
  },
  "office-hours": {
    titleEn: "Office Hours & Contact",
    titleEs: "Horarios y Contacto",
    steps: [
      {
        icon: "🕘",
        titleEn: "Monday - Friday",
        titleEs: "Lunes - Viernes",
        descriptionEn: "9:00 AM - 6:00 PM - Regular appointments available",
        descriptionEs: "9:00 AM - 6:00 PM - Citas regulares disponibles",
        action: "weekdays"
      },
      {
        icon: "🕐",
        titleEn: "Saturday",
        titleEs: "Sábado",
        descriptionEn: "10:00 AM - 2:00 PM - Limited weekend hours",
        descriptionEs: "10:00 AM - 2:00 PM - Horarios limitados de fin de semana",
        action: "saturday"
      },
      {
        icon: "📞",
        titleEn: "Phone Contact",
        titleEs: "Contacto Telefónico",
        descriptionEn: "Call (555) 123-4567 for appointments and emergencies",
        descriptionEs: "Llama al (555) 123-4567 para citas y emergencias",
        action: "phone"
      },
      {
        icon: "🚨",
        titleEn: "Emergency Hours",
        titleEs: "Horarios de Emergencia",
        descriptionEn: "24/7 emergency line available for urgent dental needs",
        descriptionEs: "Línea de emergencia 24/7 disponible para necesidades dentales urgentes",
        action: "emergency"
      }
    ]
  },
  parking: {
    titleEn: "Parking Information",
    titleEs: "Información de Estacionamiento",
    steps: [
      {
        icon: "🅿️",
        titleEn: "Main Parking Garage",
        titleEs: "Estacionamiento Principal",
        descriptionEn: "Free 2-hour parking available in our underground garage",
        descriptionEs: "Estacionamiento gratuito de 2 horas en nuestro garaje subterráneo",
        action: "garage"
      },
      {
        icon: "🛣️",
        titleEn: "Street Parking",
        titleEs: "Estacionamiento en la Calle",
        descriptionEn: "Metered street parking available on Main St and Oak Ave",
        descriptionEs: "Estacionamiento medido disponible en Main St y Oak Ave",
        action: "street"
      },
      {
        icon: "♿",
        titleEn: "Accessible Parking",
        titleEs: "Estacionamiento Accesible",
        descriptionEn: "Handicap accessible spots near the main entrance",
        descriptionEs: "Espacios accesibles para discapacitados cerca de la entrada principal",
        action: "accessible"
      },
      {
        icon: "🎫",
        titleEn: "Validation",
        titleEs: "Validación",
        descriptionEn: "Present your appointment card at reception for free validation",
        descriptionEs: "Presenta tu tarjeta de cita en recepción para validación gratuita",
        action: "validation"
      }
    ]
  },
  services: {
    titleEn: "Our Dental Services",
    titleEs: "Nuestros Servicios Dentales",
    steps: [
      {
        icon: "🧹",
        titleEn: "General Cleaning",
        titleEs: "Limpieza General",
        descriptionEn: "Regular cleanings and check-ups - $80-120",
        descriptionEs: "Limpiezas regulares y chequeos - $80-120",
        action: "cleaning"
      },
      {
        icon: "🦷",
        titleEn: "Fillings & Repairs",
        titleEs: "Empastes y Reparaciones",
        descriptionEn: "Cavity fillings and minor repairs - $150-300",
        descriptionEs: "Empastes de caries y reparaciones menores - $150-300",
        action: "fillings"
      },
      {
        icon: "👑",
        titleEn: "Crowns & Bridges",
        titleEs: "Coronas y Puentes",
        descriptionEn: "Custom crowns and bridge work - $800-1500",
        descriptionEs: "Coronas personalizadas y trabajo de puentes - $800-1500",
        action: "crowns"
      },
      {
        icon: "✨",
        titleEn: "Cosmetic Services",
        titleEs: "Servicios Cosméticos",
        descriptionEn: "Whitening, veneers, and smile makeovers",
        descriptionEs: "Blanqueamiento, carillas y renovación de sonrisa",
        action: "cosmetic"
      }
    ]
  },
  insurance: {
    titleEn: "Insurance Coverage",
    titleEs: "Cobertura de Seguro",
    steps: [
      {
        icon: "🏥",
        titleEn: "Major Insurance Plans",
        titleEs: "Planes de Seguro Principales",
        descriptionEn: "We accept most major insurance plans including Blue Cross, Aetna, Cigna",
        descriptionEs: "Aceptamos la mayoría de planes principales incluyendo Blue Cross, Aetna, Cigna",
        action: "major"
      },
      {
        icon: "💳",
        titleEn: "Verify Coverage",
        titleEs: "Verificar Cobertura",
        descriptionEn: "Call us with your insurance info to verify coverage before your visit",
        descriptionEs: "Llámanos con tu información de seguro para verificar cobertura antes de tu visita",
        action: "verify"
      },
      {
        icon: "💰",
        titleEn: "Payment Options",
        titleEs: "Opciones de Pago",
        descriptionEn: "We offer payment plans and accept cash, credit, and HSA cards",
        descriptionEs: "Ofrecemos planes de pago y aceptamos efectivo, crédito y tarjetas HSA",
        action: "payment"
      },
      {
        icon: "📋",
        titleEn: "Pre-Authorization",
        titleEs: "Pre-Autorización",
        descriptionEn: "Some procedures may require pre-authorization from your insurance",
        descriptionEs: "Algunos procedimientos pueden requerir pre-autorización de tu seguro",
        action: "preauth"
      }
    ]
  }
};

export default function AnimatedGuides({ guideType, language, isVisible, onClose }: AnimatedGuidesProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isVisible || !guideType) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => {
          const maxSteps = GUIDE_CONFIGS[guideType]?.steps.length || 0;
          if (prev >= maxSteps - 1) {
            return 0; // Loop back to start
          }
          return prev + 1;
        });
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible, guideType]);

  if (!isVisible || !guideType) return null;

  const config = GUIDE_CONFIGS[guideType];
  if (!config) return null;

  const content = {
    en: {
      subtitle: "Step by step guide",
      closeButton: "Close Guide"
    },
    es: {
      subtitle: "Guía paso a paso",
      closeButton: "Cerrar Guía"
    }
  };

  const text = content[language as keyof typeof content] || content.en;

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
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
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
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              {language === "es" ? config.titleEs : config.titleEn}
            </h3>
            <p className="text-purple-600 text-sm font-medium">{text.subtitle}</p>
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
          <div className="flex justify-between items-center mb-3">
            {config.steps.map((_, index) => (
              <div
                key={index}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  index <= currentStep
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-110 shadow-lg animate-float"
                    : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                }`}
              >
                {index <= currentStep && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse opacity-75"></div>
                )}
                <span className="relative z-10">{index + 1}</span>
                {index === currentStep && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ 
                width: `${((currentStep + 1) / config.steps.length) * 100}%`,
                backgroundSize: '200% 100%',
                animation: 'gradient-shift 2s ease infinite'
              }}
            />
          </div>
        </div>

        {/* Current step display */}
        <div className={`transition-all duration-500 ease-in-out ${isAnimating ? "opacity-0 transform scale-95 translate-y-2" : "opacity-100 transform scale-100 translate-y-0"}`}>
          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="text-4xl animate-bounce">
                  {config.steps[currentStep].icon}
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-800 mb-2 animate-fade-in">
                  {language === "es" 
                    ? config.steps[currentStep].titleEs 
                    : config.steps[currentStep].titleEn
                  }
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed animate-slide-in">
                  {language === "es" 
                    ? config.steps[currentStep].descriptionEs 
                    : config.steps[currentStep].descriptionEn
                  }
                </p>
                
                {/* Action visualization */}
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 transform hover:scale-105 transition-transform duration-200">
                  <div className="flex items-center gap-2 text-purple-700">
                    <span className="text-lg animate-pulse">{config.steps[currentStep].icon}</span>
                    <span className="text-sm font-medium">
                      {language === "es" ? "Información importante" : "Important info"}
                    </span>
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
          >
            <span className="relative z-10">{text.closeButton}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Step indicators */}
        <div className="mt-4 flex justify-center gap-2">
          {config.steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep ? "bg-purple-600 w-6" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
