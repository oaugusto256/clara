import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { NormalizedTransactionInputSchema, TransactionSchema } from '../src/schemas';

const outDir = join(__dirname, '../../../apps/api/generated-schemas');
mkdirSync(outDir, { recursive: true });

const normalizedTxSchema = zodToJsonSchema(NormalizedTransactionInputSchema);
const transactionSchema = zodToJsonSchema(TransactionSchema);

writeFileSync(join(outDir, 'NormalizedTransactionInput.schema.json'), JSON.stringify(normalizedTxSchema, null, 2));
writeFileSync(join(outDir, 'Transaction.schema.json'), JSON.stringify(transactionSchema, null, 2));

console.log('JSON schemas generated in', outDir);
