"use client";

import { useState } from "react";
import { Button } from "./Button";
import { requestMicrophonePermission, getMicrophonePermissionError } from "./utils/microphonePermissions";
import MicrophoneTroubleshooting from "./MicrophoneTroubleshooting";

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
      title: "Microphone Access Required",
      description: "To use voice chat with the AI avatar, we need access to your microphone.",
      instructions: [
        "Click 'Allow Microphone Access' below",
        "When prompted by your browser, click 'Allow'",
        "If blocked, click the microphone icon in your browser's address bar"
      ],
      buttonText: "Allow Microphone Access",
      note: "Your audio is only used for the AI conversation and is not recorded or stored."
    },
    es: {
      title: "Acceso al Micrófono Requerido",
      description: "Para usar el chat de voz con el avatar de IA, necesitamos acceso a tu micrófono.",
      instructions: [
        "Haz clic en 'Permitir Acceso al Micrófono' abajo",
        "Cuando tu navegador te pregunte, haz clic en 'Permitir'",
        "Si está bloqueado, haz clic en el ícono del micrófono en la barra de direcciones"
      ],
      buttonText: "Permitir Acceso al Micrófono",
      note: "Tu audio solo se usa para la conversación con IA y no se graba ni almacena."
    }
  };

  const text = content[language as keyof typeof content] || content.en;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <div className="text-4xl mb-4">🎤</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{text.title}</h3>
      <p className="text-gray-600 mb-4">{text.description}</p>
      
      <div className="bg-white rounded-lg p-4 mb-4 text-left">
        <p className="font-medium text-gray-700 mb-2">
          {language === "es" ? "Instrucciones:" : "Instructions:"}
        </p>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          {text.instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </div>

      <Button 
        onClick={handleRequestPermission}
        disabled={isRequesting}
        className="mb-3"
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

      <p className="text-xs text-gray-500">{text.note}</p>

      <MicrophoneTroubleshooting language={language} />
    </div>
  );
}
