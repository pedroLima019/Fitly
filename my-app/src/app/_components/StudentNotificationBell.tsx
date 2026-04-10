"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function StudentNotificationBell() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id || session.user.userType !== "student") {
      setLoading(false);
      return;
    }

    const fetchUnreadMessages = async () => {
      try {
        const response = await fetch("/api/messages/conversations", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          const totalUnread =
            data.conversations?.reduce(
              (sum: number, conv: { unreadCount: number }) =>
                sum + conv.unreadCount,
              0,
            ) || 0;
          setUnreadCount(totalUnread);
        }
      } catch (error) {
        console.error("Erro ao carregar notificações:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadMessages();

    // Recarrega a cada 30 segundos
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [session]);

  if (loading || session?.user?.userType !== "student") {
    return null;
  }

  return (
    <Link
      href="/dashboard/aluno/chats"
      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
    >
      <svg
        className="w-6 h-6 text-[#0F172A]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {unreadCount}
        </span>
      )}
    </Link>
  );
}
