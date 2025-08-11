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
  const [routeProgress, setRouteProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
const animationRef = useRef<NodeJS>();

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
        const startCoords: [number, number] = [40.7570, -73.9870];

        // Create map
        mapInstance.current = window.L.map(mapRef.current, {
          center: clinicCoords,
          zoom: 15,
          zoomControl: true,
          scrollWheelZoom: true
        });

        // Add tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18
        }).addTo(mapInstance.current);

        // Extended route coordinates for longer route
        const routeCoords: [number, number][] = [
          startCoords,
          [40.7575, -73.9865],
          [40.7580, -73.9860],
          [40.7582, -73.9858],
          [40.7585, -73.9855],
          [40.7587, -73.9853],
          [40.7588, -73.9852],
          clinicCoords
        ];

        // Create custom icons
        const startIcon = window.L.divIcon({
          html: `
            <div class="animate-pulse">
              <div class="w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg">
                <div class="w-full h-full bg-green-400 rounded-full animate-ping absolute"></div>
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          className: 'custom-div-icon'
        });

        const clinicIcon = window.L.divIcon({
          html: `
            <div class="animate-bounce">
              <div class="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-xl relative">
                <div class="absolute inset-0 bg-red-400 rounded-full animate-pulse"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold">🏥</div>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          className: 'custom-div-icon'
        });

        // Add markers
        const startMarker = window.L.marker(startCoords, { icon: startIcon })
          .addTo(mapInstance.current)
          .bindPopup(`
            <div class="text-center p-2">
              <div class="text-green-600 font-bold">${language === 'es' ? '🚀 Punto de inicio' : '🚀 Starting point'}</div>
              <div class="text-sm text-gray-600">${language === 'es' ? 'Tu ubicación actual' : 'Your current location'}</div>
            </div>
          `);

        const clinicMarker = window.L.marker(clinicCoords, { icon: clinicIcon })
          .addTo(mapInstance.current)
          .bindPopup(`
            <div class="text-center p-2">
              <div class="text-red-600 font-bold">${language === 'es' ? '🏥 Clínica Dental' : '🏥 Dental Clinic'}</div>
              <div class="text-sm text-gray-600">${language === 'es' ? 'Tu destino' : 'Your destination'}</div>
            </div>
          `);

        // Create static route line (faded)
        const staticRoute = window.L.polyline(routeCoords, {
          color: '#e5e7eb',
          weight: 6,
          opacity: 0.5,
          smoothFactor: 1
        }).addTo(mapInstance.current);

        // Create animated route line
        let animatedRoute: any = null;

        // Animation function
        const animateRoute = () => {
          setIsAnimating(true);
          setRouteProgress(0);
          
          if (animatedRoute) {
            mapInstance.current.removeLayer(animatedRoute);
          }

          let progress = 0;
          const duration = 5000; // 5 seconds for longer animation
          const interval = 30; // Update every 30ms for smoother animation
          const steps = duration / interval;
          const increment = 1 / steps;

          const animate = () => {
            progress += increment;
            setRouteProgress(progress);

            if (progress >= 1) {
              progress = 1;
              setIsAnimating(false);
            }

            // Calculate partial route based on progress
            const totalSegments = routeCoords.length - 1;
            const currentSegment = Math.floor(progress * totalSegments);
            const segmentProgress = (progress * totalSegments) % 1;

            let partialRoute = routeCoords.slice(0, currentSegment + 1);
            
            if (currentSegment < totalSegments) {
              const currentPoint = routeCoords[currentSegment];
              const nextPoint = routeCoords[currentSegment + 1];
              const interpolatedPoint: [number, number] = [
                currentPoint[0] + (nextPoint[0] - currentPoint[0]) * segmentProgress,
                currentPoint[1] + (nextPoint[1] - currentPoint[1]) * segmentProgress
              ];
              partialRoute.push(interpolatedPoint);
            }

            if (animatedRoute) {
              mapInstance.current.removeLayer(animatedRoute);
            }

            animatedRoute = window.L.polyline(partialRoute, {
              color: '#3b82f6',
              weight: 5,
              opacity: 1,
              smoothFactor: 2,
              className: 'animated-route'
            }).addTo(mapInstance.current);

            if (progress < 1) {
              animationRef.current = setTimeout(animate, interval);
            }
          };

          animate();
        };

        // Start animation after a delay and repeat
        const startAnimation = () => {
          animateRoute();
          // Repeat animation every 8 seconds
          setTimeout(startAnimation, 8000);
        };

        setTimeout(() => {
          startAnimation();
        }, 1000);

        // Fit map to show the route
        const bounds = window.L.latLngBounds([startCoords, clinicCoords]);
        mapInstance.current.fitBounds(bounds, { padding: [30, 30] });

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
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isVisible, language]);

  const content = {
    en: {
      title: "��️ Route to Dental Clinic",
      walking: "🚶‍♂️ Walking directions",
      duration: "⏱️ Estimated time: 8-12 minutes",
      distance: "📏 Distance: ~950 meters",
      instructions: [
        "Exit the building and head north",
        "Walk straight for 3 blocks",
        "Turn right on Main Street",
        "Continue for 2 more blocks",
        "Turn left at the pharmacy",
        "The clinic is 50m ahead on your right (red marker)"
      ],
      closeBtn: "Close Directions",
      loading: "🗺️ Loading interactive map...",
      error: "❌ Unable to load map. Please try again.",
      animating: "🎯 Calculating best route...",
      startNavigation: "Start Navigation"
    },
    es: {
      title: "🗺️ Ruta a la Clínica Dental",
      walking: "🚶‍♂️ Direcciones a pie",
      duration: "⏱️ Tiempo estimado: 5-8 minutos",
      distance: "📏 Distancia: ~600 metros",
      instructions: [
        "Salga del edificio y diríjase al norte",
        "Gire a la derecha en la calle Main",
        "Camine 2 cuadras en línea recta",
        "La clínica está a su izquierda (marcador rojo)"
      ],
      closeBtn: "Cerrar Direcciones",
      loading: "🗺️ Cargando mapa interactivo...",
      error: "❌ No se pudo cargar el mapa. Inténtelo de nuevo.",
      animating: "🎯 Calculando la mejor ruta...",
      startNavigation: "Iniciar Navegación"
    }
  };

  const text = content[language as keyof typeof content] || content.en;

  if (!isVisible) return null;

  return (
    <div className="w-full h-full animate-fadeIn">
      <div className="bg-gradient-to-br from-white/95 to-blue-50/95 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/70 shadow-2xl h-full transform transition-all duration-500 hover:shadow-3xl">
        {/* Enhanced Header */}
        <div className="p-6 border-b border-white/50 bg-gradient-to-r from-blue-100/80 via-purple-100/80 to-indigo-100/80 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-blue-500/10 to-purple-600/10 animate-gradient-x"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3 mb-2">
                <span className="text-2xl animate-bounce">{text.title.split(' ')[0]}</span>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {text.title.split(' ').slice(1).join(' ')}
                </span>
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  {text.duration}
                </span>
                <span className="flex items-center gap-1">
                  {text.distance}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-xl bg-white/70 hover:bg-white/90 transition-all duration-300 transform hover:scale-110 hover:rotate-90 shadow-lg"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          {isAnimating && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-blue-600 mb-2">
                <span>{text.animating}</span>
                <span>{Math.round(routeProgress * 100)}%</span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
                  style={{ width: `${routeProgress * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row h-96">
          {/* Enhanced Map */}
          <div className="flex-1 relative overflow-hidden">
            {mapError ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                <div className="text-center text-red-600 animate-fadeIn">
                  <div className="text-6xl mb-4 animate-bounce">🗺️</div>
                  <p className="text-lg font-semibold">{text.error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    {language === 'es' ? 'Reintentar' : 'Retry'}
                  </button>
                </div>
              </div>
            ) : !mapLoaded ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center text-blue-600 animate-fadeIn">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl animate-pulse">🗺️</span>
                    </div>
                  </div>
                  <p className="text-lg font-semibold animate-pulse">{text.loading}</p>
                </div>
              </div>
            ) : null}
            
            <div ref={mapRef} className="w-full h-full" style={{ minHeight: '300px' }} />
            
            {/* Map Overlay Controls */}
            {mapLoaded && (
              <div className="absolute top-4 left-4 z-[1000]">
                <div className="bg-white/90 backdrop-blur-md rounded-lg p-3 shadow-lg border border-white/50">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-700 font-medium">
                      {language === 'es' ? 'Ruta Activa' : 'Route Active'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Instructions */}
          <div className="lg:w-80 bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-md border-l border-white/50">
            <div className="p-6 h-full overflow-y-auto">
              <div className="space-y-6">
                {/* Status Card */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🚶‍♂️</div>
                    <div className="font-bold">{text.walking.split(' ')[1]}</div>
                    <div className="text-blue-100 text-sm">{text.duration.split(' ').slice(1).join(' ')}</div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    {language === 'es' ? 'Instrucciones paso a paso' : 'Step-by-step instructions'}
                  </h4>
                  
                  <ol className="space-y-3">
                    {text.instructions.map((instruction, index) => (
                      <li 
                        key={index} 
                        className="flex items-start gap-3 p-3 bg-white/70 rounded-xl shadow-sm border border-white/50 transform transition-all duration-300 hover:scale-105 hover:shadow-md"
                        style={{ animationDelay: `${index * 0.2}s` }}
                      >
                        <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 font-medium text-sm leading-relaxed">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Legend */}
                <div className="bg-white/70 p-4 rounded-xl border border-white/50 shadow-sm">
                  <h5 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                    <span className="text-lg">🏷️</span>
                    {language === 'es' ? 'Leyenda' : 'Legend'}
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                      <span className="text-gray-700 font-medium">{language === 'es' ? 'Punto de inicio' : 'Starting point'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-bounce shadow-lg"></div>
                      <span className="text-gray-700 font-medium">{language === 'es' ? 'Clínica dental' : 'Dental clinic'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                      <span className="text-gray-700 font-medium">{language === 'es' ? 'Ruta recomendada' : 'Recommended route'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
          background-size: 200% 200%;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
        
        .custom-div-icon {
          background: none !important;
          border: none !important;
        }
        
        .animated-route {
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
          animation: route-glow 2s ease-in-out infinite alternate;
        }

        @keyframes route-glow {
          from { filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5)); }
          to { filter: drop-shadow(0 0 12px rgba(59, 130, 246, 1)); }
        }
      `}</style>
    </div>
  );
}
