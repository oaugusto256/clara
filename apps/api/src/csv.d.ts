import { type NormalizedTransactionInput } from '@clara/schemas';
export type ParseResult = {
    ok: NormalizedTransactionInput[];
    errors: {
        line: number;
        reason: string;
    }[];
};
/**
 * Very small CSV parser for the MVP: expects header row and columns:
 * accountExternalId,description,amount,currency,date
 */
export declare function parseCsv(raw: string): ParseResult;
