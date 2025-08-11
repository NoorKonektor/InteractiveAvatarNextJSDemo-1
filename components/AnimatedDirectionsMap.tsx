"use client";

import { useEffect, useRef } from 'react';

interface AnimatedDirectionsMapProps {
  language: string;
  isVisible: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    L: any;
  }
}

export default function AnimatedDirectionsMap({ language, isVisible, onClose }: AnimatedDirectionsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!isVisible || !mapRef.current) return;

    // Load Leaflet CSS and JS
    const loadLeaflet = () => {
      // Add Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          // Load SnakeAnim plugin
          const snakeScript = document.createElement('script');
          snakeScript.src = 'https://cdn.jsdelivr.net/npm/leaflet.polyline.snakeanim@0.2.2/L.Polyline.SnakeAnim.js';
          snakeScript.onload = initializeMap;
          document.head.appendChild(snakeScript);
        };
        document.head.appendChild(script);
      } else {
        // Check if SnakeAnim is loaded
        if (!window.L.Polyline.prototype.snakeIn) {
          const snakeScript = document.createElement('script');
          snakeScript.src = 'https://cdn.jsdelivr.net/npm/leaflet.polyline.snakeanim@0.2.2/L.Polyline.SnakeAnim.js';
          snakeScript.onload = initializeMap;
          document.head.appendChild(snakeScript);
        } else {
          initializeMap();
        }
      }
    };

    const initializeMap = () => {
      if (!window.L || !mapRef.current) return;

      // Clear existing map
      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      // Dental clinic coordinates (example: Manhattan, NY)
      const clinicCoords: [number, number] = [40.7589, -73.9851];
      
      // Starting point (example: Times Square)
      const startCoords: [number, number] = [40.7580, -73.9855];

      // Create map
      mapInstance.current = window.L.map(mapRef.current, {
        center: clinicCoords,
        zoom: 16,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      // Route coordinates (example path)
      const routeCoords: [number, number][] = [
        startCoords,
        [40.7582, -73.9853],
        [40.7585, -73.9851],
        [40.7587, -73.9850],
        clinicCoords
      ];

      // Start marker
      const startIcon = window.L.divIcon({
        html: '<div style="background: #22c55e; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      // Clinic marker
      const clinicIcon = window.L.divIcon({
        html: '<div style="background: #ef4444; border-radius: 50%; width: 24px; height: 24px; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Add markers
      window.L.marker(startCoords, { icon: startIcon })
        .addTo(mapInstance.current)
        .bindPopup(language === 'es' ? 'Punto de inicio' : 'Starting point');

      window.L.marker(clinicCoords, { icon: clinicIcon })
        .addTo(mapInstance.current)
        .bindPopup(language === 'es' ? 'Clínica Dental' : 'Dental Clinic');

      // Create animated polyline
      const animatedLine = window.L.polyline(routeCoords, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1
      }).addTo(mapInstance.current);

      // Start animation after a short delay
      setTimeout(() => {
        if (animatedLine.snakeIn) {
          animatedLine.snakeIn();
        }
      }, 500);

      // Fit map to show the route
      mapInstance.current.fitBounds(window.L.polyline(routeCoords).getBounds(), {
        padding: [20, 20]
      });
    };

    loadLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isVisible, language]);

  const content = {
    en: {
      title: "Directions to Dental Clinic",
      walking: "🚶‍♂️ Walking directions",
      duration: "⏱️ Estimated time: 5-8 minutes",
      instructions: [
        "Exit the building and head north",
        "Turn right on Main Street",
        "Walk 2 blocks straight",
        "The clinic is on your left (red marker)"
      ],
      closeBtn: "Close Directions"
    },
    es: {
      title: "Direcciones a la Clínica Dental",
      walking: "🚶‍♂️ Direcciones a pie",
      duration: "⏱️ Tiempo estimado: 5-8 minutos",
      instructions: [
        "Salga del edificio y diríjase al norte",
        "Gire a la derecha en la calle Main",
        "Camine 2 cuadras en línea recta",
        "La clínica está a su izquierda (marcador rojo)"
      ],
      closeBtn: "Cerrar Direcciones"
    }
  };

  const text = content[language as keyof typeof content] || content.en;

  if (!isVisible) return null;

  return (
    <div className="w-full h-full">
      <div className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-md rounded-2xl overflow-hidden border border-white/60 shadow-lg h-full">
        {/* Header */}
        <div className="p-6 border-b border-white/40 bg-gradient-to-r from-blue-50/80 to-purple-50/80">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🗺️</span>
              {text.title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-96">
          {/* Map */}
          <div className="flex-1 relative">
            <div ref={mapRef} className="w-full h-full" />
          </div>

          {/* Instructions */}
          <div className="lg:w-80 p-6 bg-gradient-to-br from-white/80 to-blue-50/80 border-l border-white/40">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-blue-600 font-semibold">{text.walking}</div>
                <div className="text-gray-600 text-sm">{text.duration}</div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                  {language === 'es' ? 'Instrucciones:' : 'Instructions:'}
                </h4>
                <ol className="space-y-2">
                  {text.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">
                        {index + 1}
                      </span>
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="pt-4 border-t border-white/60">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>{language === 'es' ? 'Inicio' : 'Start'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span>{language === 'es' ? 'Clínica Dental' : 'Dental Clinic'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
