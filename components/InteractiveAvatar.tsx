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
import AnimatedDirectionsMap from "./AnimatedDirectionsMap";
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
  const [showDirections, setShowDirections] = useState(false);

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
    setShowBookingGuide(false);
    setCurrentGuideType(null);
    setShowDirections(false);

    if (messageLower.includes("appointment") || messageLower.includes("book")) {
      setShowBookingGuide(true);
    } else if (messageLower.includes("directions") || messageLower.includes("how to get") || messageLower.includes("cómo llegar")) {
      setShowDirections(true);
    } else if (messageLower.includes("dentist room") || messageLower.includes("situated") || messageLower.includes("location")) {
      setCurrentGuideType("location");
    } else if (messageLower.includes("office hours") || messageLower.includes("contact")) {
      setCurrentGuideType("office-hours");
    } else if (messageLower.includes("parking")) {
      setCurrentGuideType("parking");
    } else if (messageLower.includes("services") || messageLower.includes("costs")) {
      setCurrentGuideType("services");
    } else if (messageLower.includes("insurance")) {
      setCurrentGuideType("insurance");
    } else {
      // Default behavior for other messages - show media if available
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

  const handleCloseDirections = () => {
    setShowDirections(false);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-2 lg:px-8 xl:px-16 animate-fadeIn">
      {/* Main Interface Container */}
      <div className="bg-white/85 backdrop-blur-2xl border border-white/70 rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-700 hover:shadow-3xl">
        {/* Main Interface Grid */}
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 p-4 lg:p-10 xl:p-14">
          {/* Avatar Control Panel */}
          <div className="space-y-6 animate-slideInLeft">
            {/* Avatar Display */}
            <div className="relative group">
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden border border-gray-200 shadow-xl transform transition-all duration-500 group-hover:scale-105">
                {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
                  <div className="relative h-full">
                    <AvatarVideo ref={mediaStream} />
                    {/* Status Overlay */}
                    <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      LIVE
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 animate-pulse"></div>
                    <AvatarConfig config={config} onConfigChange={setConfig} />
                  </div>
                )}
              </div>
              
              {/* Glow Effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-indigo-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Enhanced Control Panel */}
            <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-xl p-8 rounded-3xl border border-white/50 shadow-xl transform transition-all duration-500 hover:shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {language === "es" ? "Panel de Control" : "Control Panel"}
                </h3>
              </div>

              {sessionState === StreamingAvatarSessionState.CONNECTED ? (
                <div className="animate-fadeIn">
                  <AvatarControls />
                </div>
              ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
                <div className="space-y-6">
                  {/* Microphone Permission */}
                  {microphonePermission.checked && !microphonePermission.granted && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-2xl shadow-lg animate-slideInUp">
                      <MicrophonePermissionRequest
                        onPermissionGranted={handleMicrophonePermissionGranted}
                        onPermissionDenied={handleMicrophonePermissionDenied}
                        language={language}
                      />
                    </div>
                  )}

                  {/* Error Display */}
                  {microphonePermission.error && (
                    <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 p-6 rounded-2xl shadow-lg animate-shake">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-600 font-medium">{microphonePermission.error}</span>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => startSessionV2(true)}
                      disabled={!microphonePermission.granted}
                      className={`
                        bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                        text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300
                        relative overflow-hidden group
                        ${!microphonePermission.granted ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}
                      `}
                    >
                      <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      <div className="relative flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        Voice Chat
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={() => startSessionV2(false)}
                      className="
                        bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 
                        text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300
                        relative overflow-hidden group
                      "
                    >
                      <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      <div className="relative flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Text Chat
                      </div>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <span className="text-gray-600 font-medium animate-pulse">
                      {language === "es" ? "Conectando..." : "Connecting..."}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Media Panel */}
          <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-xl border border-white/50 rounded-3xl overflow-hidden shadow-xl transform transition-all duration-500 hover:shadow-2xl animate-slideInRight">
            <div className="p-6 border-b border-white/50 bg-gradient-to-r from-blue-50/70 to-purple-50/70">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                {language === "es" ? "Panel de Información" : "Information Display"}
              </h3>
            </div>
            
            <div className="h-96 overflow-hidden relative">
              {showDirections ? (
                <AnimatedDirectionsMap
                  language={language}
                  isVisible={showDirections}
                  onClose={handleCloseDirections}
                />
              ) : showBookingGuide ? (
                <div className="p-6 h-full overflow-y-auto animate-fadeIn">
                  <BookingGuide
                    language={language}
                    isVisible={showBookingGuide}
                    onClose={handleCloseBookingGuide}
                  />
                </div>
              ) : currentGuideType ? (
                <div className="p-6 h-full overflow-y-auto animate-fadeIn">
                  <AnimatedGuides
                    guideType={currentGuideType}
                    language={language}
                    isVisible={!!currentGuideType}
                    onClose={handleCloseAnimatedGuide}
                  />
                </div>
              ) : (
                <div className="p-6 h-full overflow-y-auto animate-fadeIn">
                  <InlineMedia
                    mediaType={mediaDisplay.type}
                    mediaUrl={mediaDisplay.url}
                    isVisible={true}
                    language={language}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Preset buttons */}
        <div className="border-t border-white/50 bg-gradient-to-r from-blue-50/70 via-purple-50/70 to-indigo-50/70 p-8 animate-slideInUp">
          <PresetButtons
            onSendMessage={handlePresetMessage}
            language={language}
          />
        </div>

        {/* Enhanced Message history */}
        {sessionState === StreamingAvatarSessionState.CONNECTED && (
          <div className="border-t border-white/50 bg-gradient-to-r from-gray-50/70 to-blue-50/70 p-8 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              {language === "es" ? "Historial de Conversación" : "Conversation History"}
            </h3>
            <MessageHistory />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
          background-size: 200% 200%;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
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
