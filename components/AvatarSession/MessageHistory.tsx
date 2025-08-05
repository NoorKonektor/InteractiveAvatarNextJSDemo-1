import React, { useEffect, useRef } from "react";

import { useMessageHistory, MessageSender } from "../logic";

export const MessageHistory: React.FC = () => {
  const { messages } = useMessageHistory();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || messages.length === 0) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 p-4 border-b border-gray-200">
        Conversation History
      </h3>
      <div
        ref={containerRef}
        className="w-full overflow-y-auto flex flex-col gap-3 px-4 py-4 text-gray-900 max-h-[200px]"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center italic">
            Start a conversation to see the chat history
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col gap-1 max-w-[80%] ${
                message.sender === MessageSender.CLIENT
                  ? "self-end items-end"
                  : "self-start items-start"
              }`}
            >
              <p className="text-xs text-gray-500 font-medium">
                {message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
              </p>
              <div className={`rounded-lg px-3 py-2 ${
                message.sender === MessageSender.CLIENT
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
