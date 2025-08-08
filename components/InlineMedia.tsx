"use client";

import { useEffect, useState } from "react";

interface InlineMediaProps {
  mediaType?: "video" | "image" | "map";
  mediaUrl?: string;
  isVisible: boolean;
  language: string;
}

export default function InlineMedia({ 
  mediaType, 
  mediaUrl, 
  isVisible, 
  language 
}: InlineMediaProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isVisible && mediaUrl) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, mediaUrl]);

  if (!isVisible || !mediaType || !mediaUrl) {
    return (
      <div className="w-full h-80 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📱</div>
          <p className="font-medium">
            {language === "es" ? "Información aparecerá aquí" : "Information will appear here"}
          </p>
          <p className="text-sm">
            {language === "es" ? "Haz clic en un botón para ver contenido" : "Click a button to view content"}
          </p>
        </div>
      </div>
    );
  }

  const renderMedia = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-80 bg-gray-50 rounded-xl border border-gray-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <span className="text-gray-600">
              {language === "es" ? "Cargando..." : "Loading..."}
            </span>
          </div>
        </div>
      );
    }

    switch (mediaType) {
      case "video":
        return (
          <div className="w-full">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              {language === "es" ? "Video informativo" : "Instructional Video"}
            </h4>
            <video 
              className="w-full h-80 bg-gray-900 rounded-xl shadow-lg" 
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
          </div>
        );
      
      case "image":
        return (
          <div className="w-full">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              {language === "es" ? "Información" : "Information"}
            </h4>
            <img 
              src={mediaUrl} 
              alt={language === "es" ? "Información" : "Information"}
              className="w-full h-80 object-cover rounded-xl shadow-lg border border-gray-200"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        );
      
      case "map":
        return (
          <div className="w-full">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              {language === "es" ? "Ubicación" : "Location"}
            </h4>
            <iframe
              src={mediaUrl}
              className="w-full h-80 rounded-xl border border-gray-200 shadow-lg"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {renderMedia()}
    </div>
  );
}
