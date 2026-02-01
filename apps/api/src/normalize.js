"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeInput = normalizeInput;
const schemas_1 = require("@clara/schemas");
const uuid_1 = require("uuid");
/**
 * Normalizes a normalized input payload into a canonical Transaction.
 * This function demonstrates using runtime schemas from `@clara/schemas`.
 */
function normalizeInput(input) {
    // Validate incoming normalized input
    schemas_1.NormalizedTransactionInputSchema.parse(input);
    const tx = {
        id: (0, uuid_1.v4)(),
        userId: 'u1', // TODO: wire real user context
        accountId: input.accountExternalId,
        description: input.description,
        amount: { amount: Math.round(input.amount), currency: input.currency },
        direction: 'expense',
        date: input.date,
        source: 'csv',
    };
    // Validate the canonical transaction before returning
    schemas_1.TransactionSchema.parse(tx);
    return tx;
}
