import { createServer } from "http";
import { initializeSocket } from "./lib/socket";
import app from "./app";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

initializeSocket(httpServer);

const startServer = async () => {
  try {
    await prisma.$connect();
    httpServer.listen(PORT, () => {
      console.log("Server is running on PORT:", PORT);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();