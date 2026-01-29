import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";

export type AuthRequest = Request & {
  userId?: string;
  user?: {
    id: string;
    email?: string;
  };
};

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.userId = session.user.id;
    req.user = session.user;

    next();
  } catch (error) {
    next(error);
  }
};
