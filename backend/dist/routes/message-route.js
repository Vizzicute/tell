"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const message_controller_1 = require("../controllers/message-controller");
const router = (0, express_1.Router)();
router.get("/chat/:chatId", auth_1.protectRoute, message_controller_1.getMessages);
exports.default = router;
//# sourceMappingURL=message-route.js.map