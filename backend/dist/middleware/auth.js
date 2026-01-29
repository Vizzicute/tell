"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectRoute = void 0;
const node_1 = require("better-auth/node");
const auth_1 = require("../lib/auth");
const protectRoute = async (req, res, next) => {
    try {
        const session = await auth_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers),
        });
        if (!session) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.userId = session.user.id;
        next();
    }
    catch (error) {
        res.status(500);
        next(error);
    }
};
exports.protectRoute = protectRoute;
//# sourceMappingURL=auth.js.map