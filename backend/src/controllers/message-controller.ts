import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

export async function getMessages(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
      const { chatId } = req.params;
      
      if (!userId || !chatId) throw new Error("Missing required parameters");

    const chat = await prisma.chat.findFirst({
      where: { id: chatId as string, participants: { some: { id: userId } } },
    });

    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { chatId: chatId as string },
      include: { sender: { select: { name: true, email: true, image: true } } },
      orderBy: { createdAt: "asc" },
    });

    res.json(messages);
  } catch (error) {
    res.status(500);
    next(error);
  }
}
