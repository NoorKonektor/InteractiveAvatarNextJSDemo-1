"use client";

import { useEffect, useState } from "react";

interface MediaDisplayProps {
  mediaType?: "video" | "image" | "map";
  mediaUrl?: string;
  isVisible: boolean;
  onClose: () => void;
  language: string;
}

export default function MediaDisplay({ 
  mediaType, 
  mediaUrl, 
  isVisible, 
  onClose, 
  language 
}: MediaDisplayProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isVisible && mediaUrl) {
      setIsLoading(true);
      // Simulate loading time for better UX
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, mediaUrl]);

  if (!isVisible || !mediaType || !mediaUrl) return null;

  const renderMedia = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64 bg-zinc-800 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-white">
            {language === "es" ? "Cargando..." : "Loading..."}
          </span>
        </div>
      );
    }

    switch (mediaType) {
      case "video":
        return (
          <video 
            className="w-full h-64 bg-black rounded-lg" 
            controls 
            autoPlay 
            muted
            onLoadStart={() => setIsLoading(false)}
          >
            <source src={mediaUrl} type="video/mp4" />
            {language === "es" 
              ? "Su navegador no soporta video." 
              : "Your browser does not support video."
            }
          </video>
        );
      
      case "image":
        return (
          <img 
            src={mediaUrl} 
            alt={language === "es" ? "Información" : "Information"}
            className="w-full h-64 object-cover rounded-lg"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        );
      
      case "map":
        return (
          <iframe
            src={mediaUrl}
            className="w-full h-64 rounded-lg border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setIsLoading(false)}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg font-semibold">
            {mediaType === "video" && (language === "es" ? "Video informativo" : "Instructional Video")}
            {mediaType === "image" && (language === "es" ? "Información" : "Information")}
            {mediaType === "map" && (language === "es" ? "Ubicación" : "Location")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        {renderMedia()}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {language === "es" ? "Cerrar" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
