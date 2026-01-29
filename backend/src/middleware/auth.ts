import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";

export type AuthRequest = Request & {
    userId?: string;
    user?: any;
};

export const protectRoute = async (
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

    next();
  } catch (error) {
    res.status(500);
    next(error);
  }
};
