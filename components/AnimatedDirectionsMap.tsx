"use client";

import { useEffect, useRef, useState } from 'react';

interface AnimatedDirectionsMapProps {
  language: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function AnimatedDirectionsMap({ language, isVisible, onClose }: AnimatedDirectionsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const loadLeafletMap = async () => {
      try {
        // Create script elements for Leaflet
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(cssLink);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        
        script.onload = () => {
          initializeMap();
        };
        
        script.onerror = () => {
          setMapError(true);
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading map:', error);
        setMapError(true);
      }
    };

    const initializeMap = () => {
      if (!window.L || !mapRef.current) return;

      try {
        // Clear existing map
        if (mapInstance.current) {
          mapInstance.current.remove();
        }

        // Dental clinic coordinates (example: Manhattan, NY)
        const clinicCoords: [number, number] = [40.7589, -73.9851];
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
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18
        }).addTo(mapInstance.current);

        // Route coordinates
        const routeCoords: [number, number][] = [
          startCoords,
          [40.7582, -73.9853],
          [40.7585, -73.9851],
          [40.7587, -73.9850],
          clinicCoords
        ];

        // Create markers
        const startMarker = window.L.circleMarker(startCoords, {
          color: '#22c55e',
          fillColor: '#22c55e',
          fillOpacity: 0.8,
          radius: 8,
          weight: 3
        }).addTo(mapInstance.current);

        const clinicMarker = window.L.circleMarker(clinicCoords, {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.8,
          radius: 10,
          weight: 3
        }).addTo(mapInstance.current);

        // Add popups
        startMarker.bindPopup(language === 'es' ? 'Punto de inicio' : 'Starting point');
        clinicMarker.bindPopup(language === 'es' ? 'Clínica Dental' : 'Dental Clinic');

        // Create route line
        const routeLine = window.L.polyline(routeCoords, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8,
          smoothFactor: 1
        }).addTo(mapInstance.current);

        // Fit map to show the route
        const bounds = window.L.latLngBounds([startCoords, clinicCoords]);
        mapInstance.current.fitBounds(bounds, { padding: [20, 20] });

        setMapLoaded(true);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(true);
      }
    };

    // Check if Leaflet is already loaded
    if (window.L) {
      initializeMap();
    } else {
      loadLeafletMap();
    }

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
      closeBtn: "Close Directions",
      loading: "Loading map...",
      error: "Unable to load map. Please try again."
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
      closeBtn: "Cerrar Direcciones",
      loading: "Cargando mapa...",
      error: "No se pudo cargar el mapa. Inténtelo de nuevo."
    }
  };

  const text = content[language as keyof typeof content] || content.en;

  if (!isVisible) return null;

  return (
    <div className="w-full h-full">
      <div className="bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-md rounded-xl overflow-hidden border border-white/60 shadow-lg h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/40 bg-gradient-to-r from-blue-50/80 to-purple-50/80">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="text-xl">🗺️</span>
              {text.title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col h-80">
          {/* Map */}
          <div className="flex-1 relative bg-gray-100">
            {mapError ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-sm">{text.error}</p>
                </div>
              </div>
            ) : !mapLoaded ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm">{text.loading}</p>
                </div>
              </div>
            ) : null}
            <div ref={mapRef} className="w-full h-full" style={{ minHeight: '200px' }} />
          </div>

          {/* Instructions */}
          <div className="p-4 bg-gradient-to-br from-white/80 to-blue-50/80 border-t border-white/40">
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-blue-600 font-semibold text-sm">{text.walking}</div>
                <div className="text-gray-600 text-xs">{text.duration}</div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wide">
                  {language === 'es' ? 'Instrucciones:' : 'Instructions:'}
                </h4>
                <ol className="space-y-1">
                  {text.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
                      <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2 border-t border-white/60">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>{language === 'es' ? 'Inicio' : 'Start'}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>{language === 'es' ? 'Clínica' : 'Clinic'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
