"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function RequestNotificationBell() {
  const { data: session } = useSession();
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        // Fetch pending requests for personal
        if (session.user.userType === "personal") {
          const requestResponse = await fetch(
            "/api/client-requests?type=received&status=pending",
            {
              method: "GET",
              credentials: "include",
            },
          );

          if (requestResponse.ok) {
            const data = await requestResponse.json();
            setPendingCount(data.requests?.length || 0);
          }
        }

        // Fetch unread notifications for all users
        const notificationResponse = await fetch("/api/notifications/unread", {
          method: "GET",
          credentials: "include",
        });

        if (notificationResponse.ok) {
          const data = await notificationResponse.json();
          setUnreadNotifications(data.count || 0);
        }
      } catch (error) {
        console.error("Erro ao carregar notificações:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Recarrega a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session]);

  if (loading) {
    return null;
  }

  // Calculate total count
  const totalCount = pendingCount + unreadNotifications;

  if (session?.user?.userType !== "personal" && totalCount === 0) {
    return null;
  }

  return (
    <Link
      href="/dashboard/personal/solicitacoes"
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
      {pendingCount > 0 && (
        <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {pendingCount}
        </span>
      )}
    </Link>
  );
}
