"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat-controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.protectRoute);
router.get("/", chat_controller_1.getChats);
router.post("/with/:participantId", chat_controller_1.getOrCreateChat);
exports.default = router;
//# sourceMappingURL=chat-route.js.map