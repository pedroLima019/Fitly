"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  createdAt: string;
  isRead: boolean;
}

export default function StudentNotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notification: Notification) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notification.id }),
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n,
        ),
      );
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "request_approved":
        return "✓";
      case "request_rejected":
        return "✗";
      case "request_canceled":
        return "✕";
      default:
        return "•";
    }
  };

  const getTitleFromNotification = (notification: Notification) => {
    const typeMap: { [key: string]: string } = {
      request_approved: "Solicitação Aprovada",
      request_rejected: "Solicitação Rejeitada",
      request_canceled: "Solicitação Cancelada",
      message: "Mensagem Nova",
    };
    return typeMap[notification.type] || notification.title;
  };

  const getLinkFromNotification = (notification: Notification) => {
    if (notification.type.startsWith("request_")) {
      return "/dashboard/aluno/minhas-solicitacoes";
    }
    if (notification.type === "message") {
      return "/dashboard/aluno/chats";
    }
    return "#";
  };

  if (loading) {
    return null;
  }

  const totalCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Notificações"
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
        {totalCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {totalCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 md:hidden bg-black bg-opacity-30 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="fixed inset-0 md:inset-auto md:right-4 md:top-12 md:w-80 bg-white rounded-lg shadow-lg z-50 flex flex-col max-h-screen md:max-h-96"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-sm font-semibold text-gray-900">
                Notificações
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="md:hidden text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-xs">
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={getLinkFromNotification(notification)}
                    onClick={() => {
                      handleMarkAsRead(notification);
                      setIsOpen(false);
                    }}
                    className={`flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-white text-sm font-bold ${
                        notification.type === "request_approved"
                          ? "bg-green-500"
                          : notification.type === "request_rejected"
                            ? "bg-red-500"
                            : "bg-orange-500"
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm md:text-xs">
                        {getTitleFromNotification(notification)}
                      </p>
                      <p className="text-gray-600 text-sm md:text-xs line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(notification.createdAt).toLocaleString(
                          "pt-BR",
                        )}
                      </p>
                    </div>

                    {!notification.isRead && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2" />
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
