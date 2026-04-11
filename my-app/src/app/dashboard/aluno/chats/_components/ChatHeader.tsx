"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";

interface ChatHeaderProps {
  otherUserName: string;
  otherUserImage: string | null;
  isOnline?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function ChatHeader({
  otherUserName,
  otherUserImage,
  isOnline = true,
  onBack,
  showBackButton = false,
}: ChatHeaderProps) {
  return (
    <div className="bg-white border-b p-3 sm:p-4 flex items-center justify-between flex-shrink-0 sticky top-0">
      <div className="flex items-center gap-3 min-w-0">
        {showBackButton && (
          <button
            onClick={onBack}
            className="lg:hidden p-1 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
        )}

        {/* Avatar */}
        {otherUserImage ? (
          <Image
            src={otherUserImage}
            alt={otherUserName}
            width={44}
            height={44}
            className="rounded-full w-11 h-11 sm:w-12 sm:h-12 object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-900 flex items-center justify-center text-white font-bold flex-shrink-0">
            {otherUserName?.charAt(0).toUpperCase() || "?"}
          </div>
        )}

        {/* Info */}
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
            {otherUserName}
          </h3>
          <p className="text-xs text-gray-500">
            {isOnline ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                Online
              </span>
            ) : (
              "Offline"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
