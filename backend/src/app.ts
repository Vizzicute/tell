import express from "express";
import path from "path";
import cors from "cors";

import { fromNodeHeaders, toNodeHandler } from "better-auth/node";

import chatRoutes from "./routes/chat-route";
import messageRoutes from "./routes/message-route";
import userRoutes from "./routes/user-route";
import { errorHandler } from "./middleware/error-handler";
import { auth } from "./lib/auth";
import { allowedOrigins } from "./origins";

const app = express();

app.use(
  cors({
    origin: allowedOrigins.filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // allow credentials from client (cookies, authorization headers, etc.)
  }),
);

app.use(express.json()); // parses incoming JSON request bodies and makes them available as req.body in your route handlers
// app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json(session);
});

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// error handlers must come after all the routes and other middlewares so they can catch errors passed with next(err) or thrown inside async handlers.
app.use(errorHandler);

// serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../web/dist")));

  app.get("/{*any}", (_, res) => {
    res.sendFile(path.join(__dirname, "../../web/dist/index.html"));
  });
}

export default app;
