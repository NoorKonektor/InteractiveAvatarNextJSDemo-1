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

import { AVATARS } from "@/app/lib/constants";

const KNOWLEDGE_BASE_ID = "040ec533171d4cc191041914213cc97d";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Low,
  avatarName: AVATARS[0].avatar_id,
  knowledgeId: KNOWLEDGE_BASE_ID,
  voice: {
    rate: 1.5,
    emotion: VoiceEmotion.EXCITED,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "en",
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

  const handlePresetMessage = async (message: string, mediaType?: string, mediaUrl?: string) => {
    if (sessionState === StreamingAvatarSessionState.CONNECTED && sendTextMessage) {
      await sendTextMessage(message);

      if (mediaType && mediaUrl) {
        setMediaDisplay({
          type: mediaType as "video" | "image" | "map",
          url: mediaUrl,
          visible: true
        });
      }
    }
  };

  const closeMediaDisplay = () => {
    setMediaDisplay({ visible: false });
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Main content area with side-by-side layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avatar Section */}
        <div className="flex flex-col rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
          <div className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
              <AvatarVideo ref={mediaStream} />
            ) : (
              <AvatarConfig config={config} onConfigChange={setConfig} />
            )}
          </div>
          <div className="flex flex-col gap-3 items-center justify-center p-6 border-t border-gray-200 w-full bg-gray-50">
            {sessionState === StreamingAvatarSessionState.CONNECTED ? (
              <AvatarControls />
            ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
              <div className="flex flex-row gap-4">
                <Button onClick={() => startSessionV2(true)}>
                  Start Voice Chat
                </Button>
                <Button onClick={() => startSessionV2(false)}>
                  Start Text Chat
                </Button>
              </div>
            ) : (
              <LoadingIcon />
            )}
          </div>
        </div>

        {/* Media Section */}
        <div className="flex flex-col gap-4">
          <InlineMedia
            mediaType={mediaDisplay.type}
            mediaUrl={mediaDisplay.url}
            isVisible={true}
            language={language}
          />
        </div>
      </div>

      {/* Preset buttons and message history */}
      {sessionState === StreamingAvatarSessionState.CONNECTED && (
        <>
          <PresetButtons
            onSendMessage={handlePresetMessage}
            language={language}
          />
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <MessageHistory />
          </div>
        </>
      )}
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
