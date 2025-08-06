"use client";

interface MicrophoneTroubleshootingProps {
  language: string;
}

export default function MicrophoneTroubleshooting({ language }: MicrophoneTroubleshootingProps) {
  const content = {
    en: {
      title: "Microphone Troubleshooting",
      steps: [
        {
          title: "Check Browser Permissions",
          description: "Look for a microphone icon in your browser's address bar and click 'Allow'"
        },
        {
          title: "Refresh the Page",
          description: "After granting permissions, refresh the page and try again"
        },
        {
          title: "Check System Settings",
          description: "Ensure your microphone is enabled in your operating system settings"
        },
        {
          title: "Try a Different Browser",
          description: "Chrome, Firefox, and Safari all support microphone access"
        },
        {
          title: "Check for Other Applications",
          description: "Close other applications that might be using your microphone"
        }
      ]
    },
    es: {
      title: "Solución de Problemas del Micrófono",
      steps: [
        {
          title: "Verificar Permisos del Navegador",
          description: "Busca un ícono de micrófono en la barra de direcciones y haz clic en 'Permitir'"
        },
        {
          title: "Refrescar la Página",
          description: "Después de dar permisos, refresca la página e intenta de nuevo"
        },
        {
          title: "Verificar Configuración del Sistema",
          description: "Asegúrate de que tu micrófono esté habilitado en la configuración del sistema"
        },
        {
          title: "Probar con Otro Navegador",
          description: "Chrome, Firefox y Safari soportan acceso al micrófono"
        },
        {
          title: "Verificar Otras Aplicaciones",
          description: "Cierra otras aplicaciones que puedan estar usando tu micrófono"
        }
      ]
    }
  };

  const text = content[language as keyof typeof content] || content.en;

  return (
    <details className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <summary className="cursor-pointer font-medium text-blue-800 hover:text-blue-900">
        {text.title}
      </summary>
      <div className="mt-3 space-y-3">
        {text.steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              {index + 1}
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{step.title}</h4>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
