"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChats = getChats;
exports.getOrCreateChat = getOrCreateChat;
const prisma_1 = require("../lib/prisma");
async function getChats(req, res, next) {
    try {
        const userId = req.userId;
        if (!userId)
            throw new Error("Missing userId");
        const chats = await prisma_1.prisma.chat.findMany({
            where: { participants: { some: { id: userId } } },
            include: {
                participants: { select: { id: true, name: true, email: true, image: true } },
                lastMessage: true,
            },
            orderBy: { lastMessageAt: "desc" },
        });
        const formattedChats = chats.map((chat) => {
            const otherParticipant = chat.participants.find((p) => p.id !== userId);
            return {
                _id: chat.id,
                participant: otherParticipant ?? null,
                lastMessage: chat.lastMessage,
                lastMessageAt: chat.lastMessageAt,
                createdAt: chat.createdAt,
            };
        });
        res.json(formattedChats);
    }
    catch (error) {
        res.status(500);
        next(error);
    }
}
async function getOrCreateChat(req, res, next) {
    try {
        const userId = req.userId;
        const { participantId } = req.params;
        if (Array.isArray(participantId)) {
            return res.status(400).json({ message: "Invalid participantId" });
        }
        if (!participantId) {
            return res.status(400).json({ message: "Participant ID is required" });
        }
        if (!userId) {
            throw new Error("User ID is required");
        }
        if (userId === participantId) {
            res.status(400).json({ message: "Cannot create chat with yourself" });
            return;
        }
        // check if chat already exists
        let chat = await prisma_1.prisma.chat.findFirst({
            where: { participants: { every: { id: { in: [userId, participantId] } } } },
            include: {
                participants: { select: { id: true, name: true, email: true, image: true } },
                lastMessage: true,
            },
        });
        if (!chat) {
            const newChat = await prisma_1.prisma.chat.create({
                data: { participants: { connect: [{ id: userId }, { id: participantId }] } },
            });
            chat = await prisma_1.prisma.chat.findUnique({
                where: { id: newChat.id },
                include: {
                    participants: { select: { id: true, name: true, email: true, image: true } },
                    lastMessage: true,
                },
            });
        }
        const otherParticipant = chat?.participants.find((p) => p.id !== userId);
        res.json({
            id: chat?.id,
            participant: otherParticipant ?? null,
            lastMessage: chat?.lastMessage,
            lastMessageAt: chat?.lastMessageAt,
            createdAt: chat?.createdAt,
        });
    }
    catch (error) {
        res.status(500);
        next(error);
    }
}
//# sourceMappingURL=chat-controller.js.map