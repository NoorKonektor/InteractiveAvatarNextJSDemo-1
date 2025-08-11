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

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Main Interface Container */}
      <div className="bg-gray-800/30 backdrop-blur-md border border-gray-600/30 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900/50 p-6 border-b border-gray-600/30">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">
              {language === "es" ? "Asistente Virtual" : "Virtual Assistant"}
            </h2>
            <p className="text-gray-400 text-sm">
              {language === "es" 
                ? "Soporte AI multilingüe para reuniones" 
                : "AI-powered multilingual meeting support"
              }
            </p>
          </div>
        </div>

        {/* Main Interface Grid */}
        <div className="grid lg:grid-cols-2 gap-6 p-6">
          {/* Avatar Control Panel */}
          <div className="space-y-4">
            {/* Avatar Display */}
            <div className="aspect-video bg-gray-900/50 rounded-xl overflow-hidden border border-gray-600/30">
              {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
                <AvatarVideo ref={mediaStream} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <AvatarConfig config={config} onConfigChange={setConfig} />
                </div>
              )}
            </div>

            {/* Control Panel */}
            <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-600/30">
              {sessionState === StreamingAvatarSessionState.CONNECTED ? (
                <AvatarControls />
              ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
                <div className="space-y-4">
                  {/* Microphone Permission */}
                  {microphonePermission.checked && !microphonePermission.granted && (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg">
                      <MicrophonePermissionRequest
                        onPermissionGranted={handleMicrophonePermissionGranted}
                        onPermissionDenied={handleMicrophonePermissionDenied}
                        language={language}
                      />
                    </div>
                  )}

                  {/* Error Display */}
                  {microphonePermission.error && (
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                      <span className="text-red-400 text-sm">{microphonePermission.error}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => startSessionV2(true)}
                      disabled={!microphonePermission.granted}
                      className={`
                        bg-blue-600 hover:bg-blue-700 text-white border-0
                        ${!microphonePermission.granted ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      Voice Chat
                    </Button>
                    <Button 
                      onClick={() => startSessionV2(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white border-0"
                    >
                      Text Chat
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-6">
                  <div className="flex items-center gap-2">
                    <LoadingIcon />
                    <span className="text-gray-400 text-sm">Connecting...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Media Panel */}
          <div className="bg-gray-900/30 border border-gray-600/30 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-600/30">
              <h3 className="text-white font-medium">Information Display</h3>
            </div>
            
            <div className="p-4">
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

        {/* Preset buttons */}
        <div className="border-t border-gray-600/30 bg-gray-900/30 p-6">
          <PresetButtons
            onSendMessage={handlePresetMessage}
            language={language}
          />
        </div>

        {/* Message history */}
        {sessionState === StreamingAvatarSessionState.CONNECTED && (
          <div className="border-t border-gray-600/30 bg-gray-900/50 p-6">
            <h3 className="text-white font-medium mb-4">Conversation History</h3>
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
