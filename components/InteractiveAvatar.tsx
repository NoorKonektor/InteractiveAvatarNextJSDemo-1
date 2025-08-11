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
    <div className="w-full max-w-7xl mx-auto">
      {/* Main Interface Container */}
      <div className="bg-white/80 backdrop-blur-lg border border-white/60 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-indigo-50/80 p-8 border-b border-white/40">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              {language === "es" ? "Asistente Virtual" : "Virtual Assistant"}
            </h2>
            <p className="text-gray-600 text-lg font-medium">
              {language === "es" 
                ? "Soporte AI multilingüe para reuniones" 
                : "AI-powered multilingual meeting support"
              }
            </p>
          </div>
        </div>

        {/* Main Interface Grid */}
        <div className="grid lg:grid-cols-2 gap-8 p-8">
          {/* Avatar Control Panel */}
          <div className="space-y-6">
            {/* Avatar Display */}
            <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
              {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
                <AvatarVideo ref={mediaStream} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <AvatarConfig config={config} onConfigChange={setConfig} />
                </div>
              )}
            </div>

            {/* Control Panel */}
            <div className="bg-gradient-to-br from-white/60 to-gray-50/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 shadow-lg">
              {sessionState === StreamingAvatarSessionState.CONNECTED ? (
                <AvatarControls />
              ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
                <div className="space-y-4">
                  {/* Microphone Permission */}
                  {microphonePermission.checked && !microphonePermission.granted && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                      <MicrophonePermissionRequest
                        onPermissionGranted={handleMicrophonePermissionGranted}
                        onPermissionDenied={handleMicrophonePermissionDenied}
                        language={language}
                      />
                    </div>
                  )}

                  {/* Error Display */}
                  {microphonePermission.error && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                      <span className="text-red-600 text-sm font-medium">{microphonePermission.error}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => startSessionV2(true)}
                      disabled={!microphonePermission.granted}
                      className={`
                        bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                        text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200
                        ${!microphonePermission.granted ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}
                      `}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      Voice Chat
                    </Button>
                    <Button 
                      onClick={() => startSessionV2(false)}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Text Chat
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3">
                    <LoadingIcon />
                    <span className="text-gray-600 text-sm font-medium">Connecting...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Media Panel */}
          <div className="bg-gradient-to-br from-white/60 to-gray-50/60 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-white/40 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
              <h3 className="text-gray-800 font-semibold text-lg flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Information Display
              </h3>
            </div>
            
            <div className="h-96 overflow-hidden">
              {showDirections ? (
                <AnimatedDirectionsMap
                  language={language}
                  isVisible={showDirections}
                  onClose={handleCloseDirections}
                />
              ) : showBookingGuide ? (
                <div className="p-6 h-full overflow-y-auto">
                  <BookingGuide
                    language={language}
                    isVisible={showBookingGuide}
                    onClose={handleCloseBookingGuide}
                  />
                </div>
              ) : currentGuideType ? (
                <div className="p-6 h-full overflow-y-auto">
                  <AnimatedGuides
                    guideType={currentGuideType}
                    language={language}
                    isVisible={!!currentGuideType}
                    onClose={handleCloseAnimatedGuide}
                  />
                </div>
              ) : (
                <div className="p-6 h-full overflow-y-auto">
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

        {/* Preset buttons */}
        <div className="border-t border-white/40 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-indigo-50/50 p-8">
          <PresetButtons
            onSendMessage={handlePresetMessage}
            language={language}
          />
        </div>

        {/* Message history */}
        {sessionState === StreamingAvatarSessionState.CONNECTED && (
          <div className="border-t border-white/40 bg-gradient-to-r from-gray-50/50 to-blue-50/50 p-8">
            <h3 className="text-gray-800 font-semibold text-lg mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Conversation History
            </h3>
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
