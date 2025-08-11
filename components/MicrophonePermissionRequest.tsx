"use client";

import { useState } from "react";
import { Button } from "./Button";
import { requestMicrophonePermission, getMicrophonePermissionError } from "./utils/microphonePermissions";

interface MicrophonePermissionRequestProps {
  onPermissionGranted: () => void;
  onPermissionDenied: (error: string) => void;
  language: string;
}

export default function MicrophonePermissionRequest({ 
  onPermissionGranted, 
  onPermissionDenied, 
  language 
}: MicrophonePermissionRequestProps) {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const stream = await requestMicrophonePermission();
      if (stream) {
        // Stop the test stream immediately
        stream.getTracks().forEach(track => track.stop());
        onPermissionGranted();
      }
    } catch (error) {
      const errorMessage = getMicrophonePermissionError(error);
      onPermissionDenied(errorMessage);
    } finally {
      setIsRequesting(false);
    }
  };

  const content = {
    en: {
      buttonText: "Allow Microphone Access"
    },
    es: {
      buttonText: "Permitir Acceso al Micrófono"
    }
  };

  const text = content[language as keyof typeof content] || content.en;

  return (
    <div className="text-center">
      <Button 
        onClick={handleRequestPermission}
        disabled={isRequesting}
        className="bg-blue-600 hover:bg-blue-700 text-white border-0"
      >
        {isRequesting ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            {language === "es" ? "Solicitando..." : "Requesting..."}
          </>
        ) : (
          text.buttonText
        )}
      </Button>
    </div>
  );
}
