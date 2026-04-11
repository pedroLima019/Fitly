"use client";

import Image from "next/image";

interface MessageBubbleProps {
  content: string;
  isOwn: boolean;
  senderName: string;
  senderImage: string | null;
  timestamp: string;
  isRead?: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({
  content,
  isOwn,
  senderName,
  senderImage,
  timestamp,
  isRead = false,
  showAvatar = true,
}: MessageBubbleProps) {
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0">
          {senderImage ? (
            <Image
              src={senderImage}
              alt={senderName}
              width={32}
              height={32}
              className="rounded-full w-8 h-8 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
              {senderName?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>
      )}

      <div
        className={`flex flex-col max-w-xs sm:max-w-sm ${isOwn ? "items-end" : "items-start"}`}
      >
        {!isOwn && (
          <p className="text-xs text-gray-600 font-medium mb-1 px-2">
            {senderName}
          </p>
        )}

        <div
          className={`px-3 sm:px-4 py-2 rounded-2xl transition-all ${
            isOwn
              ? "bg-blue-900 text-white rounded-br-md"
              : "bg-gray-200 text-gray-900 rounded-bl-md"
          }`}
        >
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
            {content}
          </p>
        </div>

        <div
          className={`flex items-center gap-2 mt-1 px-2 text-xs ${
            isOwn ? "text-gray-500" : "text-gray-500"
          }`}
        >
          <span>{formattedTime}</span>
          {isOwn && (
            <span className={`font-bold ${isRead ? "text-blue-500" : ""}`}>
              {isRead ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
