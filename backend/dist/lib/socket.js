"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = exports.onlineUsers = void 0;
const socket_io_1 = require("socket.io");
const auth_1 = require("./auth");
const prisma_1 = require("./prisma");
const node_1 = require("better-auth/node");
// store online users in memory: userId -> socketId
exports.onlineUsers = new Map();
const initializeSocket = (httpServer) => {
    const headers = new Headers();
    const allowedOrigins = [
        "http://localhost:8081", // Expo mobile
        "http://localhost:3000", // Vite web dev
        process.env.FRONTEND_URL, // production
    ].filter(Boolean);
    const io = new socket_io_1.Server(httpServer, { cors: { origin: allowedOrigins } });
    // verify socket connection - if the user is authenticated, we will store the user id in the socket
    io.use(async (socket, next) => {
        try {
            const session = await auth_1.auth.api.getSession({
                headers: (0, node_1.fromNodeHeaders)(socket.request.headers),
            });
            if (!session)
                return next(new Error("Unauthorized"));
            socket.data.userId = session.user.id;
            next();
        }
        catch {
            next(new Error("Unauthorized"));
        }
    });
    // this "connection" event name is special and should be written like this
    // it's the event that is triggered when a new client connects to the server
    io.on("connection", (socket) => {
        const userId = socket.data.userId;
        // send list of currently online users to the newly connected client
        socket.emit("online-users", { userIds: Array.from(exports.onlineUsers.keys()) });
        // store user in the onlineUsers map
        exports.onlineUsers.set(userId, socket.id);
        // notify others that this current user is online
        socket.broadcast.emit("user-online", { userId });
        socket.join(`user:${userId}`);
        socket.on("join-chat", (chatId) => {
            socket.join(`chat:${chatId}`);
        });
        socket.on("leave-chat", (chatId) => {
            socket.leave(`chat:${chatId}`);
        });
        // handle sending messages
        socket.on("send-message", async (data) => {
            try {
                const { chatId, text } = data;
                //   const chat = await Chat.findOne({
                //     _id: chatId,
                //     participants: userId,
                //   });
                const chat = await prisma_1.prisma.chat.findFirst({
                    where: { id: chatId, participants: { some: { id: userId } } },
                    include: { participants: true },
                });
                if (!chat) {
                    socket.emit("socket-error", { message: "Chat not found" });
                    return;
                }
                const message = await prisma_1.prisma.message.create({
                    data: {
                        chatId: chatId,
                        senderId: userId,
                        text: text,
                    },
                });
                await prisma_1.prisma.chat.update({
                    where: { id: chatId },
                    data: {
                        lastMessageId: message.id,
                        lastMessageAt: new Date(),
                    },
                });
                //   chat.lastMessage = message.id;
                //   chat.lastMessageAt = new Date();
                //   await chat.save();
                // emit to chat room (for users inside the chat)
                io.to(`chat:${chatId}`).emit("new-message", message);
                // also emit to participants' personal rooms (for chat list view)
                for (const participantId of chat.participants) {
                    io.to(`user:${participantId}`).emit("new-message", message);
                }
            }
            catch (error) {
                socket.emit("socket-error", { message: "Failed to send message" });
            }
        });
        socket.on("typing", async (data) => {
            const typingPayload = {
                userId,
                chatId: data.chatId,
                isTyping: data.isTyping,
            };
            // emit to chat room (for users inside the chat)
            socket.to(`chat:${data.chatId}`).emit("typing", typingPayload);
            // also emit to other participant's personal room (for chat list view)
            try {
                const chat = await prisma_1.prisma.chat.findUnique({
                    where: { id: data.chatId },
                    include: { participants: true },
                });
                if (chat) {
                    const otherParticipantId = chat.participants.find((p) => p.toString() !== userId);
                    if (otherParticipantId) {
                        socket
                            .to(`user:${otherParticipantId}`)
                            .emit("typing", typingPayload);
                    }
                }
            }
            catch (error) {
                // silently fail - typing indicator is not critical
            }
        });
        socket.on("disconnect", () => {
            exports.onlineUsers.delete(userId);
            // notify others
            socket.broadcast.emit("user-offline", { userId });
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
//# sourceMappingURL=socket.js.map