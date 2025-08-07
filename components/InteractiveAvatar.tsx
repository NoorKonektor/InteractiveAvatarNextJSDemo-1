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
    return content[language as keyof typeof content] || content.en;
  };

  const instructionsText = getInstructionsContent();

  return (
    <div className="w-full">
      {/* Unified card containing everything */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header with instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-8 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">{instructionsText.title}</h2>
              <p className="text-blue-600 font-medium mb-4 text-lg">{instructionsText.subtitle}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-base text-gray-700">
                {instructionsText.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    {feature}
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-96">
              <div className="text-base text-amber-800 bg-amber-50 rounded-lg p-4 border border-amber-200">
                💡 {instructionsText.note}
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Avatar Section */}
          <div className="flex flex-col">
            <div className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl mb-6">
              {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
                <AvatarVideo ref={mediaStream} />
              ) : (
                <AvatarConfig config={config} onConfigChange={setConfig} />
              )}
            </div>
            <div className="flex flex-col gap-4 items-center justify-center p-6 bg-gray-50 rounded-xl">
              {sessionState === StreamingAvatarSessionState.CONNECTED ? (
                <AvatarControls />
              ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
                <>
                  {/* Show microphone permission request if needed */}
                  {microphonePermission.checked && !microphonePermission.granted && (
                    <div className="w-full mb-4">
                      <MicrophonePermissionRequest
                        onPermissionGranted={handleMicrophonePermissionGranted}
                        onPermissionDenied={handleMicrophonePermissionDenied}
                        language={language}
                      />
                    </div>
                  )}

                  {/* Show error if microphone permission was denied */}
                  {microphonePermission.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700 text-center">
                      {microphonePermission.error}
                    </div>
                  )}

                  <div className="flex flex-row gap-4">
                    <Button
                      onClick={() => startSessionV2(true)}
                      disabled={!microphonePermission.granted}
                      className={!microphonePermission.granted ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      Start Voice Chat
                    </Button>
                    <Button onClick={() => startSessionV2(false)}>
                      Start Text Chat
                    </Button>
                  </div>
                </>
              ) : (
                <LoadingIcon />
              )}
            </div>
          </div>

          {/* Media Section */}
          <div className="flex flex-col">
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

        {/* Preset buttons - always visible */}
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <PresetButtons
            onSendMessage={handlePresetMessage}
            language={language}
          />
        </div>

        {/* Message history - only show when connected */}
        {sessionState === StreamingAvatarSessionState.CONNECTED && (
          <div className="border-t border-gray-200 bg-white">
            <MessageHistory />
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
