"use client";

import { useEffect, useState } from "react";

interface SuccessModalProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  autoCloseDuration?: number;
}

export default function SuccessModal({
  message,
  isOpen,
  onClose,
  autoCloseDuration = 4000,
}: SuccessModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [isOpen, autoCloseDuration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">Sucesso</h3>
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mt-4 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
          <div
            className="bg-green-600 h-full rounded-full animate-pulse"
            style={{
              animation: `shrink ${autoCloseDuration}ms linear forwards`,
            }}
          />
        </div>

        <style jsx>{`
          @keyframes shrink {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
