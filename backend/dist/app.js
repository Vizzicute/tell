"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const node_1 = require("better-auth/node");
const chat_route_1 = __importDefault(require("./routes/chat-route"));
const message_route_1 = __importDefault(require("./routes/message-route"));
const user_route_1 = __importDefault(require("./routes/user-route"));
const error_handler_1 = require("./middleware/error-handler");
const auth_1 = require("./lib/auth");
const origins_1 = require("./origins");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: origins_1.allowedOrigins.filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // allow credentials from client (cookies, authorization headers, etc.)
}));
app.use(express_1.default.json()); // parses incoming JSON request bodies and makes them available as req.body in your route handlers
// app.use(clerkMiddleware());
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
});
app.get("/api/me", async (req, res) => {
    const session = await auth_1.auth.api.getSession({
        headers: (0, node_1.fromNodeHeaders)(req.headers),
    });
    return res.json(session);
});
app.all("/api/auth/*splat", (0, node_1.toNodeHandler)(auth_1.auth));
app.use("/api/chats", chat_route_1.default);
app.use("/api/messages", message_route_1.default);
app.use("/api/users", user_route_1.default);
// error handlers must come after all the routes and other middlewares so they can catch errors passed with next(err) or thrown inside async handlers.
app.use(error_handler_1.errorHandler);
// serve frontend in production
if (process.env.NODE_ENV === "production") {
    app.use(express_1.default.static(path_1.default.join(__dirname, "../../web/dist")));
    app.get("/{*any}", (_, res) => {
        res.sendFile(path_1.default.join(__dirname, "../../web/dist/index.html"));
    });
}
exports.default = app;
//# sourceMappingURL=app.js.map