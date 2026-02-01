"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const server = (0, server_1.buildServer)();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
server.listen({ port: PORT }).then(() => {
    // eslint-disable-next-line no-console
    console.log(`API listening on ${PORT}`);
});
