"use client";

interface InstructionsProps {
  language: string;
}

export default function Instructions({ language }: InstructionsProps) {
  const content = {
    en: {
      title: "Virtual Meeting Assistant",
      subtitle: "AI-powered multilingual support",
      features: [
        "🗣️ Voice & text chat with AI avatar",
        "🌍 English & Spanish support", 
        "❓ Quick preset questions",
        "📍 Interactive maps & media",
        "🏥 Perfect for medical offices"
      ],
      note: "Choose your language in the top-right corner and start a conversation!"
    },
    es: {
      title: "Asistente Virtual de Reuniones",
      subtitle: "Soporte multilingüe impulsado por IA",
      features: [
        "🗣️ Chat de voz y texto con avatar IA",
        "🌍 Soporte en inglés y español",
        "❓ Preguntas preconfiguradas rápidas",
        "📍 Mapas interactivos y medios",
        "🏥 Perfecto para consultorios médicos"
      ],
      note: "¡Elige tu idioma en la esquina superior derecha y comienza una conversación!"
    }
  };

  const text = content[language as keyof typeof content] || content.en;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{text.title}</h2>
      <p className="text-blue-600 mb-4 font-medium">{text.subtitle}</p>
      <ul className="space-y-2 mb-4">
        {text.features.map((feature, index) => (
          <li key={index} className="text-gray-700">{feature}</li>
        ))}
      </ul>
      <p className="text-sm text-amber-800 bg-amber-50 rounded-lg p-3 border border-amber-200">
        💡 {text.note}
      </p>
    </div>
  );
}
