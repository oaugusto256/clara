"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildServer = buildServer;
const fastify_1 = __importDefault(require("fastify"));
const csv_1 = require("./csv");
const normalize_1 = require("./normalize");
function buildServer() {
    const fastify = (0, fastify_1.default)({ logger: false });
    // Accept text/csv and text/plain as raw strings
    fastify.addContentTypeParser(['text/csv', 'text/plain'], { parseAs: 'string' }, function (req, body, done) {
        done(null, body);
    });
    fastify.post('/import/csv', async (request, reply) => {
        var _a;
        // Allow JSON body with { csv: string } for convenience
        let csv = '';
        if (typeof request.body === 'string')
            csv = request.body;
        else if (request.body && typeof request.body.csv === 'string')
            csv = request.body.csv;
        if (!csv || csv.trim() === '') {
            return reply.status(400).send({ error: 'No CSV provided' });
        }
        const parsed = (0, csv_1.parseCsv)(csv);
        const normalized = [];
        const normalizationErrors = [];
        for (let i = 0; i < parsed.ok.length; i++) {
            try {
                const tx = (0, normalize_1.normalizeInput)(parsed.ok[i]);
                normalized.push(tx);
            }
            catch (err) {
                normalizationErrors.push({ line: i + 1, reason: (_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : 'normalization failed' });
            }
        }
        return { parsed: parsed.ok, normalized, errors: parsed.errors.concat(normalizationErrors) };
    });
    return fastify;
}
