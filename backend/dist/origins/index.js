"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allowedOrigins = void 0;
exports.allowedOrigins = [
    "http://localhost:8081", // expo mobile
    "http://localhost:3000", // vite web devs
    "exp://172.22.59.252:8081", // expo mobile (expo go)
    "http://172.22.59.252:8081",
    process.env.FRONTEND_URL,
];
//# sourceMappingURL=index.js.map