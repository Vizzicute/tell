import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

export async function getUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;

    if (!userId) throw new Error("Missing userId");

    const users = await prisma.user.findMany({
      where: { id: { not: userId } },
      select: { name: true, email: true, image: true, id: true },
      take: 50,
    });

    res.json(users);
  } catch (error) {
    res.status(500);
    next(error);
  }
}
