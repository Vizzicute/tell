"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const better_auth_1 = require("better-auth");
const prisma_1 = require("./prisma");
const prisma_2 = require("better-auth/adapters/prisma");
const origins_1 = require("../origins");
exports.auth = (0, better_auth_1.betterAuth)({
    database: (0, prisma_2.prismaAdapter)(prisma_1.prisma, {
        provider: "mysql",
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    socialProviders: {
        google: {
            clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
            clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
        },
    },
    trustedOrigins: origins_1.allowedOrigins
});
//# sourceMappingURL=auth.js.map