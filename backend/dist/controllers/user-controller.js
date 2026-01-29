"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
const prisma_1 = require("../lib/prisma");
async function getUsers(req, res, next) {
    try {
        const userId = req.userId;
        if (!userId)
            throw new Error("Missing userId");
        const users = await prisma_1.prisma.user.findMany({
            where: { id: { not: userId } },
            select: { name: true, email: true, image: true, id: true },
            take: 50,
        });
        res.json(users);
    }
    catch (error) {
        res.status(500);
        next(error);
    }
}
//# sourceMappingURL=user-controller.js.map