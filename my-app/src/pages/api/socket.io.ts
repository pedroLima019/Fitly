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
  const io = new SocketIOServer(httpServer as HTTPServer, {
    path: "/api/socket.io",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Armazenar o IO no server
  httpServer.io = io;

  // Armazenar ID do usuário por socket
  const userSockets = new Map<string, string>();
  const socketUsers = new Map<string, string>();

  io.on("connection", (socket) => {
    console.log("📱 Usuário conectado:", socket.id);

    // Usuário se identifica ao conectar
    socket.on("user:identify", (userId: string) => {
      userSockets.set(userId, socket.id);
      socketUsers.set(socket.id, userId);
      console.log(`✅ Usuário ${userId} identificado como ${socket.id}`);

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
        const recipientId =
          data.senderId === data.personalId ? data.studentId : data.personalId;
        const recipientSocketId = userSockets.get(recipientId);

        // Enviar para o recipiente em tempo real
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("message:receive", {
            personalId: data.personalId,
            studentId: data.studentId,
            senderId: data.senderId,
            content: data.content,
            createdAt: new Date(),
          });
        }

        // Confirmar envio
        socket.emit("message:sent");
      },
    );

    // Marcar mensagem como lida
    socket.on(
      "message:read",
      (data: { personalId: string; studentId: string }) => {
        console.log("✅ Mensagens marcadas como lidas:", data);

        const recipientId = socketUsers.get(socket.id);
        const otherUserId =
          data.personalId === recipientId ? data.studentId : data.personalId;
        const otherUserSocketId = userSockets.get(otherUserId);

        if (otherUserSocketId) {
          io.to(otherUserSocketId).emit("message:marked-read", data);
        }
      },
    );

    // Indicador de digitação
    socket.on(
      "message:typing",
      (data: { personalId: string; studentId: string; isTyping: boolean }) => {
        const recipientId = socketUsers.get(socket.id);
        const otherUserId =
          data.personalId === recipientId ? data.studentId : data.personalId;
        const otherUserSocketId = userSockets.get(otherUserId);

        if (otherUserSocketId) {
          io.to(otherUserSocketId).emit("message:typing", {
            isTyping: data.isTyping,
            userId: recipientId,
          });
        }
      },
    );

    // Desconexão
    socket.on("disconnect", () => {
      const userId = socketUsers.get(socket.id);
      if (userId) {
        userSockets.delete(userId);
        socketUsers.delete(socket.id);
        console.log(`❌ Usuário ${userId} desconectado`);
      }
    });

    // Erro
    socket.on("error", (error: Error) => {
      console.error("❌ Erro no socket:", error);
    });
  });

  if (httpServer) {
    httpServer.io = io;
  }
  res.status(200).json({ success: true });
};

export default SocketHandler;
