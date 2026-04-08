import { NextApiRequest, NextApiResponse } from "next";
import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { Socket as NetSocket } from "net";

interface SocketServerWithIO extends HTTPServer {
  io?: SocketIOServer;
}

interface SocketWithIO extends NetSocket {
  server: SocketServerWithIO;
}

interface ResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

const SocketHandler = (req: NextApiRequest, res: ResponseWithSocket) => {
  if (res.socket?.server?.io) {
    console.log("Socket.io já está inicializado");
    res.end();
    return;
  }

  const httpServer = res.socket.server;

  // Get allowed origins from environment
  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS || "http://localhost:3000"
  )
    .split(",")
    .map((origin) => origin.trim());

  const io = new SocketIOServer(httpServer as HTTPServer, {
    path: "/api/socket.io",
    addTrailingSlash: false,
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
      maxAge: 86400, // 24 hours
    },
  });

  // Armazenar o IO no server
  httpServer.io = io;

  // ✅ OTIMIZADO: Usar Set para rastrear múltiplas conexões por usuário (evita memory leak)
  const userSockets = new Map<string, Set<string>>();
  const socketUsers = new Map<string, string>();

  io.on("connection", (socket) => {
    console.log("📱 Usuário conectado:", socket.id);

    // Usuário se identifica ao conectar
    socket.on("user:identify", (userId: string) => {
      // ✅ Adicionar socket ao Set do usuário (suporta múltiplas conexões)
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId)!.add(socket.id);
      socketUsers.set(socket.id, userId);
      console.log(
        `✅ Usuário ${userId} identificado como ${socket.id} (${userSockets.get(userId)?.size} conexões)`,
      );

      // Notificar que user entrou online
      socket.emit("connection:success", { socketId: socket.id });
    });

    // Enviar mensagem
    socket.on(
      "message:send",
      (data: {
        personalId: string;
        studentId: string;
        content: string;
        senderId: string;
      }) => {
        console.log("📨 Nova mensagem:", data);

        // Identificar recipiente
        const userId = socketUsers.get(socket.id);
        const recipientId =
          data.senderId === data.personalId ? data.studentId : data.personalId;
        const recipientSockets = userSockets.get(recipientId);

        // ✅ Enviar para TODAS as conexões do recipiente (não apenas uma)
        if (recipientSockets && recipientSockets.size > 0) {
          recipientSockets.forEach((socketId) => {
            io.to(socketId).emit("message:receive", {
              id: data.personalId + "-" + data.studentId,
              personalId: data.personalId,
              studentId: data.studentId,
              senderId: data.senderId,
              content: data.content,
              createdAt: new Date(),
              readAt: null,
              sender: {
                id: data.senderId,
                name: null,
                image: null,
              },
            });
          });
        }

        // Confirmar envio
        socket.emit("message:sent");
      },
    );

    // Marcar mensagens como lidas
    socket.on(
      "message:read",
      (data: { personalId: string; studentId: string }) => {
        console.log("✅ Mensagens marcadas como lidas:", data);

        const userId = socketUsers.get(socket.id);
        const otherUserId =
          data.personalId === userId ? data.studentId : data.personalId;

        // ✅ Notificar TODAS as conexões do outro usuário
        const otherUserSockets = userSockets.get(otherUserId);
        if (otherUserSockets && otherUserSockets.size > 0) {
          otherUserSockets.forEach((socketId) => {
            io.to(socketId).emit("message:marked-read", data);
          });
        }
      },
    );

    // Indicador de digitação
    socket.on(
      "message:typing",
      (data: { personalId: string; studentId: string; isTyping: boolean }) => {
        const userId = socketUsers.get(socket.id);
        const otherUserId =
          data.personalId === userId ? data.studentId : data.personalId;

        // ✅ Notificar TODAS as conexões do outro usuário
        const otherUserSockets = userSockets.get(otherUserId);
        if (otherUserSockets && otherUserSockets.size > 0) {
          otherUserSockets.forEach((socketId) => {
            io.to(socketId).emit("message:typing", {
              isTyping: data.isTyping,
              userId: userId,
            });
          });
        }
      },
    );

    // Desconexão
    socket.on("disconnect", () => {
      const userId = socketUsers.get(socket.id);
      if (userId) {
        // ✅ OTIMIZADO: Remover socket do Set
        const sockets = userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          console.log(
            `👋 Socket desconectado: ${socket.id}, usuário ainda ativo: ${sockets.size > 0}`,
          );

          // Remover usuário do Map quando não houver mais conexões
          if (sockets.size === 0) {
            userSockets.delete(userId);
            console.log(`🔴 Usuário ${userId} completamente desconectado`);
          }
        }
      }
      socketUsers.delete(socket.id);
    });

    // Erro
    socket.on("error", (error: Error) => {
      console.error("❌ Erro no socket:", error);
    });
  });

  res.status(200).json({ success: true });
};

export default SocketHandler;
