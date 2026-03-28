import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface UseSocketReturn {
  isConnected: boolean;
  sendMessage: (
    personalId: string,
    studentId: string,
    content: string,
    senderId: string,
  ) => void;
  markAsRead: (personalId: string, studentId: string) => void;
  setTyping: (personalId: string, studentId: string, isTyping: boolean) => void;
}

export const useSocket = (
  userId: string | null | undefined,
): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Conectar ao servidor Socket.io
    const newSocket = io({
      path: "/api/socket.io",
      addTrailingSlash: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Identificar usuário
    newSocket.on("connect", () => {
      console.log("✅ Conectado ao servidor Socket.io");
      newSocket.emit("user:identify", userId);
    });

    newSocket.on("connection:success", () => {
      console.log("✅ Identidade confirmada");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Desconectado do servidor");
      setIsConnected(false);
    });

    newSocket.on("error", (error: Error) => {
      console.error("❌ Erro Socket.io:", error);
    });

    socketRef.current = newSocket;

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  const sendMessage = useCallback(
    (
      personalId: string,
      studentId: string,
      content: string,
      senderId: string,
    ) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("message:send", {
          personalId,
          studentId,
          content,
          senderId,
        });
      }
    },
    [],
  );

  const markAsRead = useCallback((personalId: string, studentId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("message:read", {
        personalId,
        studentId,
      });
    }
  }, []);

  const setTyping = useCallback(
    (personalId: string, studentId: string, isTyping: boolean) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("message:typing", {
          personalId,
          studentId,
          isTyping,
        });
      }
    },
    [],
  );

  return {
    isConnected,
    sendMessage,
    markAsRead,
    setTyping,
  };
};
