import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { AvatarConfig } from "./AvatarConfig";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useVoiceChat } from "./logic/useVoiceChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";
import PresetButtons from "./PresetButtons";
import InlineMedia from "./InlineMedia";
import MicrophonePermissionRequest from "./MicrophonePermissionRequest";
import BookingGuide from "./BookingGuide";
import AnimatedGuides from "./AnimatedGuides";
import { checkMicrophonePermission } from "./utils/microphonePermissions";

import { AVATARS } from "@/app/lib/constants";

const KNOWLEDGE_BASE_ID = "040ec533171d4cc191041914213cc97d";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Low,
  avatarName: AVATARS[0].avatar_id,
  knowledgeId: KNOWLEDGE_BASE_ID,
  voice: {
    rate: 1.5,
    emotion: VoiceEmotion.FRIENDLY,
    model: ElevenLabsModel.eleven_multilingual_v2,
  },
  language: "es",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

interface InteractiveAvatarProps {
  language: string;
}

function InteractiveAvatar({ language }: InteractiveAvatarProps) {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream, sendTextMessage } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();

  const [config, setConfig] = useState<StartAvatarRequest>({
    ...DEFAULT_CONFIG,
    language: language
  });
  const [mediaDisplay, setMediaDisplay] = useState<{
    type?: "video" | "image" | "map";
    url?: string;
    visible: boolean;
  }>({ visible: false });
  const [microphonePermission, setMicrophonePermission] = useState<{
    granted: boolean;
    checked: boolean;
    error?: string;
  }>({ granted: false, checked: false });
  const [showBookingGuide, setShowBookingGuide] = useState(false);
  const [currentGuideType, setCurrentGuideType] = useState<"location" | "office-hours" | "parking" | "services" | "insurance" | null>(null);

  const mediaStream = useRef<HTMLVideoElement>(null);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      // Check microphone permission before starting voice chat
      if (isVoiceChat && !microphonePermission.granted) {
        setMicrophonePermission(prev => ({
          ...prev,
          error: "Microphone permission is required for voice chat"
        }));
        return;
      }

      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
      });
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(">>>>> Stream ready:", event.detail);
      });
      avatar.on(StreamingEvents.USER_START, (event) => {
        console.log(">>>>> User started talking:", event);
      });
      avatar.on(StreamingEvents.USER_STOP, (event) => {
        console.log(">>>>> User stopped talking:", event);
      });
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
        console.log(">>>>> User end message:", event);
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        console.log(">>>>> User talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
        console.log(">>>>> Avatar talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event) => {
        console.log(">>>>> Avatar end message:", event);
      });

      await startAvatar(config);

      if (isVoiceChat) {
        await startVoiceChat();
      }
    } catch (error) {
      console.error("Error starting avatar session:", error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        setMicrophonePermission(prev => ({
          ...prev,
          granted: false,
          error: "Microphone access was denied. Please allow microphone access and try again."
        }));
      }
    }
  });

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  useEffect(() => {
    setConfig(prev => ({ ...prev, language: language }));
  }, [language]);

  useEffect(() => {
    // Check microphone permission on component mount
    const checkPermission = async () => {
      try {
        const hasPermission = await checkMicrophonePermission();
        setMicrophonePermission({ granted: hasPermission, checked: true });
      } catch (error) {
        setMicrophonePermission({ granted: false, checked: true });
      }
    };
    checkPermission();
  }, []);

  const handlePresetMessage = async (message: string, mediaType?: string, mediaUrl?: string) => {
    // Send the message to avatar if connected
    if (sessionState === StreamingAvatarSessionState.CONNECTED && sendTextMessage) {
      await sendTextMessage(message);
    }

    // Always show guides regardless of connection status
    const messageLower = message.toLowerCase();

    // Reset previous states
    setMediaDisplay({ type: undefined, url: undefined, visible: false });

    if (messageLower.includes("appointment") || messageLower.includes("book")) {
      setShowBookingGuide(true);
      setCurrentGuideType(null);
    } else if (messageLower.includes("dentist room") || messageLower.includes("situated") || messageLower.includes("location")) {
      setShowBookingGuide(false);
      setCurrentGuideType("location");
    } else if (messageLower.includes("office hours") || messageLower.includes("contact")) {
      setShowBookingGuide(false);
      setCurrentGuideType("office-hours");
    } else if (messageLower.includes("parking")) {
      setShowBookingGuide(false);
      setCurrentGuideType("parking");
    } else if (messageLower.includes("services") || messageLower.includes("costs")) {
      setShowBookingGuide(false);
      setCurrentGuideType("services");
    } else if (messageLower.includes("insurance")) {
      setShowBookingGuide(false);
      setCurrentGuideType("insurance");
    } else {
      // Default behavior for other messages - show media if available
      setShowBookingGuide(false);
      setCurrentGuideType(null);
      if (mediaType && mediaUrl) {
        setMediaDisplay({
          type: mediaType as "video" | "image" | "map",
          url: mediaUrl,
          visible: true
        });
      }
    }
  };

  const handleMicrophonePermissionGranted = () => {
    setMicrophonePermission({ granted: true, checked: true });
  };

  const handleMicrophonePermissionDenied = (error: string) => {
    setMicrophonePermission({ granted: false, checked: true, error });
  };

  const handleCloseBookingGuide = () => {
    setShowBookingGuide(false);
  };

  const handleCloseAnimatedGuide = () => {
    setCurrentGuideType(null);
  };

  const getInstructionsContent = () => {
    const content = {
      en: {
        title: "Neural Interface System",
        subtitle: "AI-POWERED QUANTUM COMMUNICATION PROTOCOL",
        features: [
          "🗣️ VOICE & TEXT NEURAL INTERFACE",
          "🌍 MULTILINGUAL QUANTUM PROCESSING",
          "❓ INSTANT RESPONSE ALGORITHMS",
          "📍 INTERACTIVE HOLOGRAPHIC DISPLAYS",
          "🏥 MEDICAL-GRADE SECURITY PROTOCOLS"
        ],
        note: "Initialize your language preference and establish neural connection!"
      },
      es: {
        title: "Sistema de Interfaz Neural",
        subtitle: "PROTOCOLO DE COMUNICACIÓN CUÁNTICA IMPULSADO POR IA",
        features: [
          "🗣️ INTERFAZ NEURAL DE VOZ Y TEXTO",
          "🌍 PROCESAMIENTO CUÁNTICO MULTILINGÜE",
          "❓ ALGORITMOS DE RESPUESTA INSTANTÁNEA",
          "📍 DISPLAYS HOLOGRÁFICOS INTERACTIVOS",
          "🏥 PROTOCOLOS DE SEGURIDAD DE GRADO MÉDICO"
        ],
        note: "¡Inicializa tu preferencia de idioma y establece conexión neural!"
      }
    };
    return content[language as keyof typeof content] || content.en;
  };

  const instructionsText = getInstructionsContent();

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Main Interface Container */}
      <div className="glass neon-border rounded-3xl overflow-hidden relative">
        {/* Holographic Header */}
        <div className="relative bg-gradient-to-r from-black/80 via-gray-900/80 to-black/80 p-8 border-b border-cyan-500/30">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 holographic opacity-20"></div>
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="font-orbitron font-bold text-4xl text-white neon-text">
                  {instructionsText.title}
                </h2>
                <p className="text-cyan-400 font-mono text-sm uppercase tracking-[3px] font-bold">
                  {instructionsText.subtitle}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {instructionsText.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full pulse-glow"></div>
                    <span className="text-gray-300 font-mono text-sm group-hover:text-cyan-400 transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="glass-dark p-6 rounded-2xl neon-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full pulse-glow"></div>
                <span className="text-white font-orbitron font-semibold">SYSTEM STATUS</span>
              </div>
              <p className="text-cyan-300 font-mono text-sm leading-relaxed">
                💡 {instructionsText.note}
              </p>
            </div>
          </div>
        </div>

        {/* Main Interface Grid */}
        <div className="grid lg:grid-cols-2 gap-8 p-8">
          {/* Avatar Control Panel */}
          <div className="space-y-6">
            {/* Avatar Display */}
            <div className="relative">
              <div className="aspect-video glass-dark rounded-2xl overflow-hidden neon-border scan-lines relative">
                {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
                  <div className="relative h-full">
                    <AvatarVideo ref={mediaStream} />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full pulse-glow"></div>
                      <span className="text-white font-mono text-xs uppercase tracking-wide">LIVE FEED</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                    <AvatarConfig config={config} onConfigChange={setConfig} />
                  </div>
                )}
              </div>
              
              {/* Holographic Frame Effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-lg opacity-50 animate-pulse"></div>
            </div>

            {/* Control Panel */}
            <div className="glass-dark p-6 rounded-2xl neon-border space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-white font-orbitron font-semibold text-lg">NEURAL INTERFACE CONTROLS</h3>
              </div>

              {sessionState === StreamingAvatarSessionState.CONNECTED ? (
                <AvatarControls />
              ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
                <div className="space-y-4">
                  {/* Microphone Permission */}
                  {microphonePermission.checked && !microphonePermission.granted && (
                    <div className="glass border border-amber-500/30 p-4 rounded-lg">
                      <MicrophonePermissionRequest
                        onPermissionGranted={handleMicrophonePermissionGranted}
                        onPermissionDenied={handleMicrophonePermissionDenied}
                        language={language}
                      />
                    </div>
                  )}

                  {/* Error Display */}
                  {microphonePermission.error && (
                    <div className="glass border border-red-500/30 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full pulse-glow"></div>
                        <span className="text-red-400 font-mono text-sm">{microphonePermission.error}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => startSessionV2(true)}
                      disabled={!microphonePermission.granted}
                      className={`
                        cyber-button font-orbitron
                        ${!microphonePermission.granted ? 'opacity-30 cursor-not-allowed' : ''}
                      `}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      VOICE LINK
                    </Button>
                    <Button onClick={() => startSessionV2(false)}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      TEXT LINK
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3">
                    <div className="cyber-spinner w-6 h-6"></div>
                    <span className="text-cyan-400 font-mono text-sm uppercase tracking-wide">ESTABLISHING CONNECTION...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Media & Information Panel */}
          <div className="space-y-6">
            <div className="glass-dark rounded-2xl neon-border overflow-hidden h-full min-h-[400px]">
              <div className="p-6 border-b border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-orbitron font-semibold text-lg">HOLOGRAPHIC DISPLAY</h3>
                </div>
              </div>
              
              <div className="p-6 h-full">
                {showBookingGuide ? (
                  <BookingGuide
                    language={language}
                    isVisible={showBookingGuide}
                    onClose={handleCloseBookingGuide}
                  />
                ) : currentGuideType ? (
                  <AnimatedGuides
                    guideType={currentGuideType}
                    language={language}
                    isVisible={!!currentGuideType}
                    onClose={handleCloseAnimatedGuide}
                  />
                ) : (
                  <InlineMedia
                    mediaType={mediaDisplay.type}
                    mediaUrl={mediaDisplay.url}
                    isVisible={true}
                    language={language}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Panel */}
        <div className="border-t border-cyan-500/20 bg-black/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-white font-orbitron font-semibold">QUICK ACCESS PROTOCOLS</h3>
          </div>
          <PresetButtons
            onSendMessage={handlePresetMessage}
            language={language}
          />
        </div>

        {/* Message History - Neural Feed */}
        {sessionState === StreamingAvatarSessionState.CONNECTED && (
          <div className="border-t border-cyan-500/20 bg-gradient-to-r from-black/80 to-gray-900/80">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-500 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-white font-orbitron font-semibold">NEURAL COMMUNICATION LOG</h3>
              </div>
              <MessageHistory />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InteractiveAvatarWrapper({ language = "en" }: { language?: string }) {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar language={language} />
    </StreamingAvatarProvider>
  );
}
