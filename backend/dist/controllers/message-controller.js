"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = getMessages;
const prisma_1 = require("../lib/prisma");
async function getMessages(req, res, next) {
    try {
        const userId = req.userId;
        const { chatId } = req.params;
        if (!userId || !chatId)
            throw new Error("Missing required parameters");
        const chat = await prisma_1.prisma.chat.findFirst({
            where: { id: chatId, participants: { some: { id: userId } } },
        });
        if (!chat) {
            res.status(404).json({ message: "Chat not found" });
            return;
        }
        const messages = await prisma_1.prisma.message.findMany({
            where: { chatId: chatId },
            include: { sender: { select: { name: true, email: true, image: true } } },
            orderBy: { createdAt: "asc" },
        });
        res.json(messages);
    }
    catch (error) {
        res.status(500);
        next(error);
    }
}
//# sourceMappingURL=message-controller.js.map